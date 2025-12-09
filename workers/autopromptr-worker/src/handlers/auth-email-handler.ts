/**
 * Email Auth Handler for AutoPromptr
 * Handles all email-based authentication flows
 */

import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendMagicLinkEmail,
  sendEmailChangeConfirmation,
  generateSecureToken,
  generateOTP,
  EmailEnv,
  EmailSendResult
} from '../services/email-service';

// Use Cloudflare Workers types from the global scope
// These are provided by @cloudflare/workers-types
export interface AuthEnv extends EmailEnv {
  AUTOPROMPTR_DB: D1Database;
  AUTOPROMPTR_KV: KVNamespace;
  JWT_SECRET: string;
}

// Email token record from database
interface EmailTokenRecord {
  id: string;
  user_id: string | null;
  email: string;
  token: string;
  token_type: string;
  new_email: string | null;
  expires_at: string;
  used_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// User record from database
interface UserRecord {
  id: string;
  email: string;
  password_hash: string | null;
  name: string | null;
  email_verified: boolean;
  email_confirmed_at: string | null;
  user_metadata: string | null;
  created_at: string;
  updated_at: string;
}

// JWT payload type for generateJWT function
interface JWTPayload {
  userId: string;
  email: string;
}

// Token expiration times (in seconds)
const TOKEN_EXPIRY = {
  verification: 24 * 60 * 60,      // 24 hours
  password_reset: 60 * 60,         // 1 hour
  magic_link: 15 * 60,             // 15 minutes
  email_change: 60 * 60,           // 1 hour
};

// Rate limits (requests per window)
const RATE_LIMITS = {
  email_send: { max: 5, window: 60 * 60 },        // 5 emails per hour per address
  password_reset: { max: 3, window: 60 * 60 },    // 3 reset requests per hour
  magic_link: { max: 10, window: 60 * 60 },       // 10 magic links per hour
};

/**
 * Check rate limit
 */
async function checkRateLimit(
  db: D1Database,
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowSeconds * 1000);

  // Get current rate limit entry
  const entry = await db
    .prepare('SELECT count, window_start FROM rate_limits WHERE key = ?')
    .bind(key)
    .first() as { count: number; window_start: string } | null;

  if (!entry || new Date(entry.window_start) < windowStart) {
    // Reset or create new window
    await db
      .prepare('INSERT OR REPLACE INTO rate_limits (key, count, window_start, updated_at) VALUES (?, 1, ?, ?)')
      .bind(key, now.toISOString(), now.toISOString())
      .run();
    return { allowed: true, remaining: maxRequests - 1, resetAt: new Date(now.getTime() + windowSeconds * 1000) };
  }

  if (entry.count >= maxRequests) {
    const resetAt = new Date(new Date(entry.window_start).getTime() + windowSeconds * 1000);
    return { allowed: false, remaining: 0, resetAt };
  }

  // Increment count
  await db
    .prepare('UPDATE rate_limits SET count = count + 1, updated_at = ? WHERE key = ?')
    .bind(now.toISOString(), key)
    .run();

  return { 
    allowed: true, 
    remaining: maxRequests - entry.count - 1,
    resetAt: new Date(new Date(entry.window_start).getTime() + windowSeconds * 1000)
  };
}

/**
 * Create an email token
 */
async function createEmailToken(
  db: D1Database,
  params: {
    userId?: string;
    email: string;
    tokenType: 'verification' | 'password_reset' | 'magic_link' | 'email_change';
    newEmail?: string;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<string> {
  const token = generateSecureToken();
  const id = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TOKEN_EXPIRY[params.tokenType] * 1000);

  // Invalidate existing tokens of same type for this email
  await db
    .prepare('UPDATE email_tokens SET used_at = ? WHERE email = ? AND token_type = ? AND used_at IS NULL')
    .bind(now.toISOString(), params.email.toLowerCase(), params.tokenType)
    .run();

  // Create new token
  await db
    .prepare(`
      INSERT INTO email_tokens (id, user_id, email, token, token_type, new_email, expires_at, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      id,
      params.userId || null,
      params.email.toLowerCase(),
      token,
      params.tokenType,
      params.newEmail || null,
      expiresAt.toISOString(),
      params.ipAddress || null,
      params.userAgent || null
    )
    .run();

  return token;
}

/**
 * Verify and consume a token
 */
async function verifyToken(
  db: D1Database,
  token: string,
  expectedType: string
): Promise<{ valid: boolean; data?: EmailTokenRecord; error?: string }> {
  const now = new Date();

  const tokenRecord = await db
    .prepare(`
      SELECT * FROM email_tokens 
      WHERE token = ? AND token_type = ? AND used_at IS NULL
    `)
    .bind(token, expectedType)
    .first<EmailTokenRecord>();

  if (!tokenRecord) {
    return { valid: false, error: 'Invalid or expired token' };
  }

  if (new Date(tokenRecord.expires_at) < now) {
    return { valid: false, error: 'Token has expired' };
  }

  // Mark token as used
  await db
    .prepare('UPDATE email_tokens SET used_at = ? WHERE id = ?')
    .bind(now.toISOString(), tokenRecord.id)
    .run();

  return { valid: true, data: tokenRecord };
}

/**
 * Log email send attempt
 */
async function logEmailSend(
  db: D1Database,
  params: {
    email: string;
    emailType: string;
    status: 'sent' | 'failed' | 'bounced';
    provider?: string;
    messageId?: string;
    errorMessage?: string;
    ipAddress?: string;
  }
): Promise<void> {
  await db
    .prepare(`
      INSERT INTO email_logs (email, email_type, status, provider, message_id, error_message, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      params.email.toLowerCase(),
      params.emailType,
      params.status,
      params.provider || null,
      params.messageId || null,
      params.errorMessage || null,
      params.ipAddress || null
    )
    .run();
}

// ============ HANDLER FUNCTIONS ============

/**
 * Request email verification (for signup or resend)
 */
export async function handleRequestVerification(
  request: Request,
  env: AuthEnv
): Promise<Response> {
  const body = await request.json() as { email: string; userId?: string };
  const { email, userId } = body;
  const ipAddress = request.headers.get('CF-Connecting-IP') || undefined;
  const userAgent = request.headers.get('User-Agent') || undefined;

  if (!email) {
    return new Response(JSON.stringify({ error: 'Email required' }), { status: 400 });
  }

  // Check rate limit
  const rateLimit = await checkRateLimit(
    env.AUTOPROMPTR_DB,
    `email:${email.toLowerCase()}`,
    RATE_LIMITS.email_send.max,
    RATE_LIMITS.email_send.window
  );

  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({
      error: 'Too many requests',
      retryAfter: Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000)
    }), { status: 429 });
  }

  // Create token
  const token = await createEmailToken(env.AUTOPROMPTR_DB, {
    userId,
    email,
    tokenType: 'verification',
    ipAddress,
    userAgent
  });

  // Send email
  const result = await sendVerificationEmail(email, token, env);

  // Log the attempt
  await logEmailSend(env.AUTOPROMPTR_DB, {
    email,
    emailType: 'verification',
    status: result.success ? 'sent' : 'failed',
    provider: result.provider,
    messageId: result.messageId,
    errorMessage: result.error,
    ipAddress
  });

  if (!result.success) {
    return new Response(JSON.stringify({ error: 'Failed to send verification email' }), { status: 500 });
  }

  return new Response(JSON.stringify({
    success: true,
    message: 'Verification email sent'
  }));
}

/**
 * Verify email with token
 */
export async function handleVerifyEmail(
  request: Request,
  env: AuthEnv
): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const type = url.searchParams.get('type') || 'signup';

  if (!token) {
    return new Response(JSON.stringify({ error: 'Token required' }), { status: 400 });
  }

  const verification = await verifyToken(env.AUTOPROMPTR_DB, token, 'verification');

  if (!verification.valid || !verification.data) {
    return new Response(JSON.stringify({ error: verification.error }), { status: 400 });
  }

  const { email, user_id } = verification.data;

  // Update user's email_confirmed_at
  if (user_id) {
    await env.AUTOPROMPTR_DB
      .prepare('UPDATE users SET email_confirmed_at = ? WHERE id = ?')
      .bind(new Date().toISOString(), user_id)
      .run();
  } else {
    // Find user by email and confirm
    await env.AUTOPROMPTR_DB
      .prepare('UPDATE users SET email_confirmed_at = ? WHERE email = ?')
      .bind(new Date().toISOString(), email.toLowerCase())
      .run();
  }

  return new Response(JSON.stringify({
    success: true,
    message: 'Email verified successfully',
    redirect: `${env.SITE_URL}/signin?verified=true`
  }));
}

/**
 * Request password reset
 */
export async function handleRequestPasswordReset(
  request: Request,
  env: AuthEnv
): Promise<Response> {
  const body = await request.json() as { email: string };
  const { email } = body;
  const ipAddress = request.headers.get('CF-Connecting-IP') || undefined;
  const userAgent = request.headers.get('User-Agent') || undefined;

  if (!email) {
    return new Response(JSON.stringify({ error: 'Email required' }), { status: 400 });
  }

  // Check rate limit
  const rateLimit = await checkRateLimit(
    env.AUTOPROMPTR_DB,
    `reset:${email.toLowerCase()}`,
    RATE_LIMITS.password_reset.max,
    RATE_LIMITS.password_reset.window
  );

  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({
      error: 'Too many requests',
      retryAfter: Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000)
    }), { status: 429 });
  }

  // Check if user exists (don't reveal if they don't)
  const user = await env.AUTOPROMPTR_DB
    .prepare('SELECT id FROM users WHERE email = ?')
    .bind(email.toLowerCase())
    .first() as { id: string } | null;

  // Always return success to prevent email enumeration
  if (!user) {
    return new Response(JSON.stringify({
      success: true,
      message: 'If an account exists, a password reset email has been sent'
    }));
  }

  // Create token
  const token = await createEmailToken(env.AUTOPROMPTR_DB, {
    userId: user.id,
    email,
    tokenType: 'password_reset',
    ipAddress,
    userAgent
  });

  // Send email
  const result = await sendPasswordResetEmail(email, token, env);

  await logEmailSend(env.AUTOPROMPTR_DB, {
    email,
    emailType: 'password_reset',
    status: result.success ? 'sent' : 'failed',
    provider: result.provider,
    messageId: result.messageId,
    errorMessage: result.error,
    ipAddress
  });

  return new Response(JSON.stringify({
    success: true,
    message: 'If an account exists, a password reset email has been sent'
  }));
}

/**
 * Reset password with token
 */
export async function handleResetPassword(
  request: Request,
  env: AuthEnv
): Promise<Response> {
  const body = await request.json() as { token: string; password: string };
  const { token, password } = body;

  if (!token || !password) {
    return new Response(JSON.stringify({ error: 'Token and password required' }), { status: 400 });
  }

  if (password.length < 8) {
    return new Response(JSON.stringify({ error: 'Password must be at least 8 characters' }), { status: 400 });
  }

  const verification = await verifyToken(env.AUTOPROMPTR_DB, token, 'password_reset');

  if (!verification.valid || !verification.data) {
    return new Response(JSON.stringify({ error: verification.error }), { status: 400 });
  }

  const { user_id, email } = verification.data;

  // Hash new password
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const passwordHash = btoa(String.fromCharCode(...new Uint8Array(hash)));

  // Update password
  const userId = user_id || (await env.AUTOPROMPTR_DB
    .prepare('SELECT id FROM users WHERE email = ?')
    .bind(email.toLowerCase())
    .first() as { id: string } | null)?.id;

  if (!userId) {
    return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
  }

  await env.AUTOPROMPTR_DB
    .prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?')
    .bind(passwordHash, new Date().toISOString(), userId)
    .run();

  // Invalidate all sessions for this user (via KV)
  await env.AUTOPROMPTR_KV.delete(`sessions:${userId}`);

  return new Response(JSON.stringify({
    success: true,
    message: 'Password reset successfully',
    redirect: `${env.SITE_URL}/signin?reset=true`
  }));
}

/**
 * Request magic link login
 */
export async function handleRequestMagicLink(
  request: Request,
  env: AuthEnv
): Promise<Response> {
  const body = await request.json() as { email: string };
  const { email } = body;
  const ipAddress = request.headers.get('CF-Connecting-IP') || undefined;
  const userAgent = request.headers.get('User-Agent') || undefined;

  if (!email) {
    return new Response(JSON.stringify({ error: 'Email required' }), { status: 400 });
  }

  // Check rate limit
  const rateLimit = await checkRateLimit(
    env.AUTOPROMPTR_DB,
    `magic:${email.toLowerCase()}`,
    RATE_LIMITS.magic_link.max,
    RATE_LIMITS.magic_link.window
  );

  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({
      error: 'Too many requests',
      retryAfter: Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000)
    }), { status: 429 });
  }

  // Check if user exists
  const user = await env.AUTOPROMPTR_DB
    .prepare('SELECT id, email_confirmed_at FROM users WHERE email = ?')
    .bind(email.toLowerCase())
    .first() as { id: string; email_confirmed_at: string | null } | null;

  // Don't reveal if user doesn't exist
  if (!user) {
    return new Response(JSON.stringify({
      success: true,
      message: 'If an account exists, a magic link has been sent'
    }));
  }

  // Create token
  const token = await createEmailToken(env.AUTOPROMPTR_DB, {
    userId: user.id,
    email,
    tokenType: 'magic_link',
    ipAddress,
    userAgent
  });

  // Send email
  const result = await sendMagicLinkEmail(email, token, env);

  await logEmailSend(env.AUTOPROMPTR_DB, {
    email,
    emailType: 'magic_link',
    status: result.success ? 'sent' : 'failed',
    provider: result.provider,
    messageId: result.messageId,
    errorMessage: result.error,
    ipAddress
  });

  return new Response(JSON.stringify({
    success: true,
    message: 'If an account exists, a magic link has been sent'
  }));
}

/**
 * Verify magic link and create session
 */
export async function handleVerifyMagicLink(
  request: Request,
  env: AuthEnv,
  generateJWT: (payload: JWTPayload, secret: string, expiresIn?: number) => Promise<string>
): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response(JSON.stringify({ error: 'Token required' }), { status: 400 });
  }

  const verification = await verifyToken(env.AUTOPROMPTR_DB, token, 'magic_link');

  if (!verification.valid || !verification.data) {
    return new Response(JSON.stringify({ error: verification.error }), { status: 400 });
  }

  const { user_id, email } = verification.data;

  // Get user
  const user = await env.AUTOPROMPTR_DB
    .prepare('SELECT * FROM users WHERE id = ? OR email = ?')
    .bind(user_id, email.toLowerCase())
    .first<UserRecord>();

  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
  }

  // Auto-confirm email if not already
  if (!user.email_confirmed_at) {
    await env.AUTOPROMPTR_DB
      .prepare('UPDATE users SET email_confirmed_at = ? WHERE id = ?')
      .bind(new Date().toISOString(), user.id)
      .run();
  }

  // Update last sign in
  await env.AUTOPROMPTR_DB
    .prepare('UPDATE users SET last_sign_in_at = ? WHERE id = ?')
    .bind(new Date().toISOString(), user.id)
    .run();

  // Generate JWT
  const accessToken = await generateJWT({ userId: user.id, email: user.email }, env.JWT_SECRET);

  const userData = {
    id: user.id,
    email: user.email,
    email_confirmed_at: user.email_confirmed_at || new Date().toISOString(),
    created_at: user.created_at,
    user_metadata: user.user_metadata ? JSON.parse(user.user_metadata) : {}
  };

  return new Response(JSON.stringify({
    success: true,
    user: userData,
    session: {
      access_token: accessToken,
      expires_at: Math.floor(Date.now() / 1000) + 86400,
      user: userData
    }
  }));
}

/**
 * Request email change
 */
export async function handleRequestEmailChange(
  request: Request,
  env: AuthEnv,
  currentUser: UserRecord
): Promise<Response> {
  const body = await request.json() as { newEmail: string; password: string };
  const { newEmail, password } = body;
  const ipAddress = request.headers.get('CF-Connecting-IP') || undefined;
  const userAgent = request.headers.get('User-Agent') || undefined;

  if (!newEmail || !password) {
    return new Response(JSON.stringify({ error: 'New email and password required' }), { status: 400 });
  }

  // Verify current password
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const passwordHash = btoa(String.fromCharCode(...new Uint8Array(hash)));

  if (currentUser.password_hash !== passwordHash) {
    return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 401 });
  }

  // Check if new email is already taken
  const existing = await env.AUTOPROMPTR_DB
    .prepare('SELECT id FROM users WHERE email = ?')
    .bind(newEmail.toLowerCase())
    .first();

  if (existing) {
    return new Response(JSON.stringify({ error: 'Email already in use' }), { status: 409 });
  }

  // Check rate limit
  const rateLimit = await checkRateLimit(
    env.AUTOPROMPTR_DB,
    `emailchange:${currentUser.id}`,
    3,
    60 * 60 // 3 requests per hour
  );

  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({
      error: 'Too many requests',
      retryAfter: Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000)
    }), { status: 429 });
  }

  // Create token
  const token = await createEmailToken(env.AUTOPROMPTR_DB, {
    userId: currentUser.id,
    email: currentUser.email,
    tokenType: 'email_change',
    newEmail: newEmail.toLowerCase(),
    ipAddress,
    userAgent
  });

  // Send confirmation to current email
  const result = await sendEmailChangeConfirmation(currentUser.email, newEmail, token, env);

  await logEmailSend(env.AUTOPROMPTR_DB, {
    email: currentUser.email,
    emailType: 'email_change',
    status: result.success ? 'sent' : 'failed',
    provider: result.provider,
    messageId: result.messageId,
    errorMessage: result.error,
    ipAddress
  });

  if (!result.success) {
    return new Response(JSON.stringify({ error: 'Failed to send confirmation email' }), { status: 500 });
  }

  return new Response(JSON.stringify({
    success: true,
    message: 'Confirmation email sent to your current email address'
  }));
}

/**
 * Confirm email change
 */
export async function handleConfirmEmailChange(
  request: Request,
  env: AuthEnv
): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response(JSON.stringify({ error: 'Token required' }), { status: 400 });
  }

  const verification = await verifyToken(env.AUTOPROMPTR_DB, token, 'email_change');

  if (!verification.valid || !verification.data) {
    return new Response(JSON.stringify({ error: verification.error }), { status: 400 });
  }

  const { user_id, new_email } = verification.data;

  if (!user_id || !new_email) {
    return new Response(JSON.stringify({ error: 'Invalid token data' }), { status: 400 });
  }

  // Update user email
  const now = new Date().toISOString();
  await env.AUTOPROMPTR_DB
    .prepare('UPDATE users SET email = ?, updated_at = ? WHERE id = ?')
    .bind(new_email.toLowerCase(), now, user_id)
    .run();

  // Update profile email
  await env.AUTOPROMPTR_DB
    .prepare('UPDATE profiles SET email = ?, updated_at = ? WHERE id = ?')
    .bind(new_email.toLowerCase(), now, user_id)
    .run();

  return new Response(JSON.stringify({
    success: true,
    message: 'Email changed successfully',
    newEmail: new_email,
    redirect: `${env.SITE_URL}/settings?emailChanged=true`
  }));
}

/**
 * Validate token (check if valid without consuming)
 */
export async function handleValidateToken(
  request: Request,
  env: AuthEnv
): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const type = url.searchParams.get('type');

  if (!token || !type) {
    return new Response(JSON.stringify({ error: 'Token and type required' }), { status: 400 });
  }

  const now = new Date();

  const tokenRecord = await env.AUTOPROMPTR_DB
    .prepare(`
      SELECT expires_at, used_at FROM email_tokens 
      WHERE token = ? AND token_type = ?
    `)
    .bind(token, type)
    .first() as { expires_at: string; used_at: string | null } | null;

  if (!tokenRecord) {
    return new Response(JSON.stringify({ valid: false, error: 'Token not found' }));
  }

  if (tokenRecord.used_at) {
    return new Response(JSON.stringify({ valid: false, error: 'Token already used' }));
  }

  if (new Date(tokenRecord.expires_at) < now) {
    return new Response(JSON.stringify({ valid: false, error: 'Token expired' }));
  }

  return new Response(JSON.stringify({ valid: true }));
}
