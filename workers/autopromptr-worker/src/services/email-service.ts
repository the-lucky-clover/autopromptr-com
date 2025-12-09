/**
 * Email Service for AutoPromptr
 * Supports multiple providers with MailChannels as default (free for Cloudflare Workers)
 * 
 * Providers:
 * - MailChannels (free with Cloudflare Workers - no API key needed)
 * - Resend (optional - requires RESEND_API_KEY)
 * - Custom SMTP (optional - requires SMTP_* secrets)
 */

export interface EmailConfig {
  from: string;
  fromName: string;
  replyTo?: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: string;
}

export interface EmailEnv {
  // MailChannels (default - free)
  DKIM_DOMAIN?: string;
  DKIM_SELECTOR?: string;
  DKIM_PRIVATE_KEY?: string;
  
  // Resend (optional)
  RESEND_API_KEY?: string;
  
  // Custom SMTP (optional)
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_SECURE?: string;
  
  // General config
  EMAIL_FROM?: string;
  EMAIL_FROM_NAME?: string;
  SITE_URL: string;
}

// Email templates
const templates = {
  verification: (link: string, siteName: string) => ({
    subject: `Verify your email for ${siteName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🚀 ${siteName}</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
          <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email</a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy this link: <a href="${link}" style="color: #667eea;">${link}</a></p>
          <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      </body>
      </html>
    `,
    text: `Verify your email for ${siteName}\n\nClick this link to verify: ${link}\n\nThis link expires in 24 hours.`
  }),

  passwordReset: (link: string, siteName: string) => ({
    subject: `Reset your password for ${siteName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🔐 ${siteName}</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
          <p>We received a request to reset your password. Click the button below to choose a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy this link: <a href="${link}" style="color: #f5576c;">${link}</a></p>
          <p style="color: #666; font-size: 14px;">This link expires in 1 hour.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.</p>
        </div>
      </body>
      </html>
    `,
    text: `Reset your password for ${siteName}\n\nClick this link to reset: ${link}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, ignore this email.`
  }),

  magicLink: (link: string, siteName: string) => ({
    subject: `Sign in to ${siteName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sign In Link</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✨ ${siteName}</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Sign In With Magic Link</h2>
          <p>Click the button below to sign in to your account - no password needed!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Sign In</a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy this link: <a href="${link}" style="color: #11998e;">${link}</a></p>
          <p style="color: #666; font-size: 14px;">This link expires in 15 minutes and can only be used once.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">If you didn't request this sign in link, you can safely ignore this email.</p>
        </div>
      </body>
      </html>
    `,
    text: `Sign in to ${siteName}\n\nClick this link to sign in: ${link}\n\nThis link expires in 15 minutes and can only be used once.`
  }),

  emailChange: (link: string, newEmail: string, siteName: string) => ({
    subject: `Confirm your email change for ${siteName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirm Email Change</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📧 ${siteName}</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Confirm Your New Email</h2>
          <p>You requested to change your email address to: <strong>${newEmail}</strong></p>
          <p>Click the button below to confirm this change:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Confirm Email Change</a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy this link: <a href="${link}" style="color: #4facfe;">${link}</a></p>
          <p style="color: #666; font-size: 14px;">This link expires in 1 hour.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">If you didn't request this change, please secure your account immediately.</p>
        </div>
      </body>
      </html>
    `,
    text: `Confirm your email change for ${siteName}\n\nYou requested to change your email to: ${newEmail}\n\nClick this link to confirm: ${link}\n\nThis link expires in 1 hour.`
  })
};

/**
 * Send email via MailChannels (free for Cloudflare Workers)
 * Requires SPF record: v=spf1 a mx include:relay.mailchannels.net ~all
 */

interface MailChannelsPersonalization {
  to: Array<{ email: string }>;
  dkim_domain?: string;
  dkim_selector?: string;
  dkim_private_key?: string;
}

interface MailChannelsPayload {
  personalizations: MailChannelsPersonalization[];
  from: {
    email: string;
    name: string;
  };
  subject: string;
  content: Array<{ type: string; value: string }>;
  reply_to?: { email: string };
}

async function sendViaMailChannels(
  options: EmailOptions,
  config: EmailConfig,
  env: EmailEnv
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const payload: MailChannelsPayload = {
    personalizations: [
      {
        to: [{ email: options.to }],
        ...(env.DKIM_DOMAIN && env.DKIM_SELECTOR && env.DKIM_PRIVATE_KEY ? {
          dkim_domain: env.DKIM_DOMAIN,
          dkim_selector: env.DKIM_SELECTOR,
          dkim_private_key: env.DKIM_PRIVATE_KEY
        } : {})
      }
    ],
    from: {
      email: config.from,
      name: config.fromName
    },
    subject: options.subject,
    content: [
      { type: 'text/plain', value: options.text || options.html.replace(/<[^>]*>/g, '') },
      { type: 'text/html', value: options.html }
    ]
  };

  if (config.replyTo) {
    payload.reply_to = { email: config.replyTo };
  }

  try {
    const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.status === 202) {
      return { success: true, messageId: crypto.randomUUID() };
    }

    const error = await response.text();
    console.error('MailChannels error:', error);
    return { success: false, error: `MailChannels error: ${response.status} - ${error}` };
  } catch (err) {
    console.error('MailChannels exception:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Send email via Resend API
 */

interface ResendResponse {
  id?: string;
  message?: string;
}

async function sendViaResend(
  options: EmailOptions,
  config: EmailConfig,
  env: EmailEnv
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!env.RESEND_API_KEY) {
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${config.fromName} <${config.from}>`,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        ...(config.replyTo ? { reply_to: config.replyTo } : {})
      })
    });

    const data = await response.json() as ResendResponse;

    if (response.ok && data.id) {
      return { success: true, messageId: data.id };
    }

    return { success: false, error: data.message || 'Resend error' };
  } catch (err) {
    console.error('Resend exception:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Main email sending function with fallback support
 */
export async function sendEmail(
  options: EmailOptions,
  env: EmailEnv
): Promise<{ success: boolean; messageId?: string; error?: string; provider?: string }> {
  const config: EmailConfig = {
    from: env.EMAIL_FROM || 'noreply@autopromptr.com',
    fromName: env.EMAIL_FROM_NAME || 'AutoPromptr',
    replyTo: env.EMAIL_FROM
  };

  // Try Resend first if configured (more reliable)
  if (env.RESEND_API_KEY) {
    const result = await sendViaResend(options, config, env);
    if (result.success) {
      return { ...result, provider: 'resend' };
    }
    console.warn('Resend failed, falling back to MailChannels:', result.error);
  }

  // Fallback to MailChannels (free)
  const result = await sendViaMailChannels(options, config, env);
  return { ...result, provider: 'mailchannels' };
}

/**
 * Token generation and management
 */
export function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export function generateOTP(): string {
  const array = new Uint8Array(3);
  crypto.getRandomValues(array);
  const num = ((array[0] << 16) | (array[1] << 8) | array[2]) % 1000000;
  return num.toString().padStart(6, '0');
}

/**
 * Email type-specific send functions
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  env: EmailEnv
): Promise<EmailSendResult> {
  const siteName = env.EMAIL_FROM_NAME || 'AutoPromptr';
  const link = `${env.SITE_URL}/auth/verify?token=${token}&type=signup`;
  const template = templates.verification(link, siteName);

  return sendEmail({ to: email, ...template }, env);
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  env: EmailEnv
): Promise<EmailSendResult> {
  const siteName = env.EMAIL_FROM_NAME || 'AutoPromptr';
  const link = `${env.SITE_URL}/auth/reset-password?token=${token}`;
  const template = templates.passwordReset(link, siteName);

  return sendEmail({ to: email, ...template }, env);
}

export async function sendMagicLinkEmail(
  email: string,
  token: string,
  env: EmailEnv
): Promise<EmailSendResult> {
  const siteName = env.EMAIL_FROM_NAME || 'AutoPromptr';
  const link = `${env.SITE_URL}/auth/magic-link?token=${token}`;
  const template = templates.magicLink(link, siteName);

  return sendEmail({ to: email, ...template }, env);
}

export async function sendEmailChangeConfirmation(
  currentEmail: string,
  newEmail: string,
  token: string,
  env: EmailEnv
): Promise<EmailSendResult> {
  const siteName = env.EMAIL_FROM_NAME || 'AutoPromptr';
  const link = `${env.SITE_URL}/auth/confirm-email-change?token=${token}`;
  const template = templates.emailChange(link, newEmail, siteName);

  // Send to current email for security
  return sendEmail({ to: currentEmail, ...template }, env);
}

export { templates };
