/**
 * AutoPromptr Cloudflare Worker
 * Complete backend replacement for Supabase
 * Handles: Auth, Database (D1), Storage (R2), KV, Durable Objects, Email
 */

import { BatchQueue } from './durable-objects/BatchQueue';
import {
  handleRequestVerification,
  handleVerifyEmail,
  handleRequestPasswordReset,
  handleResetPassword,
  handleRequestMagicLink,
  handleVerifyMagicLink,
  handleRequestEmailChange,
  handleConfirmEmailChange,
  handleValidateToken
} from './handlers/auth-email-handler';
import {
  sendVerificationEmail,
  generateSecureToken
} from './services/email-service';

export interface Env {
  AUTOPROMPTR_DB: D1Database;
  AUTOPROMPTR_KV: KVNamespace;
  AUTOPROMPTR_STORAGE: R2Bucket;
  BATCH_QUEUE: DurableObjectNamespace;
  JWT_SECRET: string;
  RESEND_API_KEY?: string;
  SITE_URL: string;
  EMAIL_FROM?: string;
  EMAIL_FROM_NAME?: string;
  DKIM_DOMAIN?: string;
  DKIM_SELECTOR?: string;
  DKIM_PRIVATE_KEY?: string;
}

export { BatchQueue };

// JWT utilities
const encoder = new TextEncoder();

async function generateJWT(payload: any, secret: string, expiresIn: number = 86400): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresIn;
  const fullPayload = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };
  
  const base64Header = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const base64Payload = btoa(JSON.stringify(fullPayload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const data = encoder.encode(`${base64Header}.${base64Payload}`);
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, data);
  const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  return `${base64Header}.${base64Payload}.${base64Signature}`;
}

async function verifyJWT(token: string, secret: string): Promise<any | null> {
  try {
    const [header, payload, signature] = token.split('.');
    const data = encoder.encode(`${header}.${payload}`);
    
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const sig = Uint8Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sig, data);
    
    if (!valid) return null;
    
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return decoded;
  } catch {
    return null;
  }
}

async function hashPassword(password: string): Promise<string> {
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const jsonResponse = (data: any, status = 200) => 
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });

const errorResponse = (message: string, status = 400) =>
  jsonResponse({ error: message }, status);

async function getUserFromToken(request: Request, env: Env): Promise<any | null> {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  
  const token = auth.slice(7);
  const payload = await verifyJWT(token, env.JWT_SECRET);
  
  if (!payload?.userId) return null;
  
  const user = await env.AUTOPROMPTR_DB
    .prepare('SELECT * FROM users WHERE id = ?')
    .bind(payload.userId)
    .first();
  
  return user;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Health check
      if (url.pathname === '/health') {
        return jsonResponse({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          environment: 'cloudflare-workers',
          services: {
            d1: !!env.AUTOPROMPTR_DB,
            kv: !!env.AUTOPROMPTR_KV,
            r2: !!env.AUTOPROMPTR_STORAGE,
            durableObjects: !!env.BATCH_QUEUE
          }
        });
      }

      // ============ AUTH ENDPOINTS ============
      
      if (url.pathname === '/api/auth/signup' && request.method === 'POST') {
        const body = await request.json() as any;
        const { email, password, redirectUrl, metadata } = body;
        
        if (!email || !password) {
          return errorResponse('Email and password required');
        }

        if (password.length < 8) {
          return errorResponse('Password must be at least 8 characters');
        }
        
        const existing = await env.AUTOPROMPTR_DB
          .prepare('SELECT id FROM users WHERE email = ?')
          .bind(email.toLowerCase())
          .first();
        
        if (existing) {
          return errorResponse('User already registered');
        }
        
        const userId = crypto.randomUUID();
        const passwordHash = await hashPassword(password);
        const now = new Date().toISOString();
        
        await env.AUTOPROMPTR_DB
          .prepare(`INSERT INTO users (id, email, password_hash, created_at, updated_at, user_metadata) VALUES (?, ?, ?, ?, ?, ?)`)
          .bind(userId, email.toLowerCase(), passwordHash, now, now, JSON.stringify(metadata || {}))
          .run();
        
        await env.AUTOPROMPTR_DB
          .prepare(`INSERT INTO profiles (id, email, full_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`)
          .bind(userId, email.toLowerCase(), metadata?.name || null, now, now)
          .run();
        
        // Generate verification token and send email
        const verificationToken = generateSecureToken();
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        
        await env.AUTOPROMPTR_DB
          .prepare(`
            INSERT INTO email_tokens (id, user_id, email, token, token_type, expires_at) 
            VALUES (?, ?, ?, ?, 'verification', ?)
          `)
          .bind(crypto.randomUUID(), userId, email.toLowerCase(), verificationToken, tokenExpiry)
          .run();

        // Also store in KV for fast lookup
        await env.AUTOPROMPTR_KV.put(`verify:${verificationToken}`, userId, { expirationTtl: 86400 });
        
        // Send verification email (or auto-confirm in dev mode)
        const isDev = !env.RESEND_API_KEY && !env.DKIM_DOMAIN;
        
        if (isDev) {
          // Auto-confirm in development mode
          await env.AUTOPROMPTR_DB
            .prepare('UPDATE users SET email_confirmed_at = ? WHERE id = ?')
            .bind(now, userId)
            .run();
        } else {
          // Send verification email
          const emailResult = await sendVerificationEmail(email, verificationToken, env);
          if (!emailResult.success) {
            console.error('Failed to send verification email:', emailResult.error);
          }
        }
        
        const user = {
          id: userId,
          email: email.toLowerCase(),
          email_confirmed_at: isDev ? now : null,
          created_at: now,
          user_metadata: metadata || {}
        };
        
        const accessToken = await generateJWT({ userId, email: user.email }, env.JWT_SECRET);
        
        return jsonResponse({
          user,
          session: isDev ? { access_token: accessToken, expires_at: Math.floor(Date.now() / 1000) + 86400, user } : null,
          message: isDev ? 'Account created and verified' : 'Please check your email to verify your account'
        });
      }
      
      if (url.pathname === '/api/auth/signin' && request.method === 'POST') {
        const body = await request.json() as any;
        const { email, password } = body;
        
        if (!email || !password) {
          return errorResponse('Email and password required');
        }
        
        const user = await env.AUTOPROMPTR_DB
          .prepare('SELECT * FROM users WHERE email = ?')
          .bind(email.toLowerCase())
          .first() as any;
        
        if (!user) {
          return errorResponse('Invalid login credentials', 401);
        }
        
        const passwordHash = await hashPassword(password);
        if (user.password_hash !== passwordHash) {
          return errorResponse('Invalid login credentials', 401);
        }
        
        if (!user.email_confirmed_at) {
          return errorResponse('Email not confirmed', 401);
        }
        
        const accessToken = await generateJWT({ userId: user.id, email: user.email }, env.JWT_SECRET);
        
        const userData = {
          id: user.id,
          email: user.email,
          email_confirmed_at: user.email_confirmed_at,
          created_at: user.created_at,
          user_metadata: user.user_metadata ? JSON.parse(user.user_metadata) : {}
        };
        
        return jsonResponse({
          user: userData,
          session: { access_token: accessToken, expires_at: Math.floor(Date.now() / 1000) + 86400, user: userData }
        });
      }
      
      if (url.pathname === '/api/auth/signout' && request.method === 'POST') {
        return jsonResponse({ success: true });
      }
      
      if (url.pathname === '/api/auth/verify' && request.method === 'GET') {
        const user = await getUserFromToken(request, env);
        if (!user) {
          return jsonResponse({ valid: false });
        }
        return jsonResponse({
          valid: true,
          user: { id: user.id, email: user.email, email_confirmed_at: user.email_confirmed_at, created_at: user.created_at, user_metadata: user.user_metadata ? JSON.parse(user.user_metadata) : {} }
        });
      }
      
      if (url.pathname === '/api/auth/resend-verification' && request.method === 'POST') {
        return handleRequestVerification(request, env);
      }

      // ============ EMAIL AUTH ENDPOINTS ============

      // Verify email with token (GET for link clicks)
      if (url.pathname === '/api/auth/verify-email' && request.method === 'GET') {
        return handleVerifyEmail(request, env);
      }

      // Request password reset
      if (url.pathname === '/api/auth/forgot-password' && request.method === 'POST') {
        return handleRequestPasswordReset(request, env);
      }

      // Reset password with token
      if (url.pathname === '/api/auth/reset-password' && request.method === 'POST') {
        return handleResetPassword(request, env);
      }

      // Request magic link login
      if (url.pathname === '/api/auth/magic-link' && request.method === 'POST') {
        return handleRequestMagicLink(request, env);
      }

      // Verify magic link and create session (GET for link clicks)
      if (url.pathname === '/api/auth/verify-magic-link' && request.method === 'GET') {
        return handleVerifyMagicLink(request, env, generateJWT);
      }

      // Request email change (requires auth)
      if (url.pathname === '/api/auth/change-email' && request.method === 'POST') {
        const user = await getUserFromToken(request, env);
        if (!user) {
          return errorResponse('Authentication required', 401);
        }
        return handleRequestEmailChange(request, env, user);
      }

      // Confirm email change (GET for link clicks)
      if (url.pathname === '/api/auth/confirm-email-change' && request.method === 'GET') {
        return handleConfirmEmailChange(request, env);
      }

      // Validate token (check without consuming)
      if (url.pathname === '/api/auth/validate-token' && request.method === 'GET') {
        return handleValidateToken(request, env);
      }

      // ============ DATABASE ENDPOINTS ============
      
      if (url.pathname === '/api/db/query' && request.method === 'GET') {
        const table = url.searchParams.get('table');
        const columns = url.searchParams.get('columns') || '*';
        const filters = JSON.parse(url.searchParams.get('filters') || '[]');
        const orderBy = url.searchParams.get('orderBy');
        const limit = url.searchParams.get('limit');
        
        if (!table) return errorResponse('Table required');
        
        let query = `SELECT ${columns} FROM ${table}`;
        const bindings: any[] = [];
        
        if (filters.length > 0) {
          const whereClauses = filters.map((f: string) => {
            const [col, op, val] = f.split(':');
            bindings.push(JSON.parse(val));
            const sqlOp = op === 'eq' ? '=' : op === 'neq' ? '!=' : op === 'gt' ? '>' : '<';
            return `${col} ${sqlOp} ?`;
          });
          query += ` WHERE ${whereClauses.join(' AND ')}`;
        }
        
        if (orderBy) {
          const [col, dir] = orderBy.split(':');
          query += ` ORDER BY ${col} ${dir.toUpperCase()}`;
        }
        
        if (limit) query += ` LIMIT ${parseInt(limit)}`;
        
        const { results } = await env.AUTOPROMPTR_DB.prepare(query).bind(...bindings).all();
        return jsonResponse(results);
      }
      
      if (url.pathname === '/api/db/insert' && request.method === 'POST') {
        const user = await getUserFromToken(request, env);
        const body = await request.json() as any;
        const { table, data, returning } = body;
        
        if (!table || !data || data.length === 0) return errorResponse('Table and data required');
        
        const results = [];
        for (const row of data) {
          if (user && !row.user_id) row.user_id = user.id;
          const columns = Object.keys(row);
          const placeholders = columns.map(() => '?').join(', ');
          const values = Object.values(row);
          
          await env.AUTOPROMPTR_DB.prepare(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`).bind(...values).run();
          if (returning) results.push(row);
        }
        
        return jsonResponse(returning ? results : { success: true });
      }
      
      if (url.pathname === '/api/db/update' && request.method === 'PUT') {
        const body = await request.json() as any;
        const { table, data, filters } = body;
        
        if (!table || !data) return errorResponse('Table and data required');
        
        const setClauses = Object.keys(data).map(k => `${k} = ?`).join(', ');
        const setValues = Object.values(data);
        
        let query = `UPDATE ${table} SET ${setClauses}`;
        const bindings = [...setValues];
        
        if (filters && filters.length > 0) {
          const whereClauses = filters.map((f: string) => {
            const [col, , val] = f.split(':');
            bindings.push(JSON.parse(val));
            return `${col} = ?`;
          });
          query += ` WHERE ${whereClauses.join(' AND ')}`;
        }
        
        await env.AUTOPROMPTR_DB.prepare(query).bind(...bindings).run();
        return jsonResponse({ success: true });
      }
      
      if (url.pathname === '/api/db/delete' && request.method === 'DELETE') {
        const body = await request.json() as any;
        const { table, filters } = body;
        
        if (!table || !filters || filters.length === 0) return errorResponse('Table and filters required');
        
        const bindings: any[] = [];
        const whereClauses = filters.map((f: string) => {
          const [col, , val] = f.split(':');
          bindings.push(JSON.parse(val));
          return `${col} = ?`;
        });
        
        await env.AUTOPROMPTR_DB.prepare(`DELETE FROM ${table} WHERE ${whereClauses.join(' AND ')}`).bind(...bindings).run();
        return jsonResponse({ success: true });
      }
      
      if (url.pathname === '/api/db/rpc' && request.method === 'POST') {
        const body = await request.json() as any;
        const { function: funcName, params } = body;
        
        if (funcName === 'get_user_role') {
          const { results } = await env.AUTOPROMPTR_DB.prepare('SELECT role FROM user_roles WHERE user_id = ?').bind(params.user_id_param).all();
          return jsonResponse(results[0]?.role || 'user');
        }
        
        return errorResponse(`Unknown function: ${funcName}`);
      }

      // ============ FUNCTIONS ENDPOINTS ============
      
      if (url.pathname.startsWith('/api/functions/')) {
        const functionName = url.pathname.replace('/api/functions/', '');
        
        switch (functionName) {
          case 'send-contact-email':
            return jsonResponse({ success: true, message: 'Email queued' });
          case 'backend-router':
            return jsonResponse({ message: 'Use /api/run-batch instead' });
          case 'get-backend-url':
            return jsonResponse({ url: url.origin });
          default:
            return errorResponse(`Unknown function: ${functionName}`, 404);
        }
      }

      // ============ STORAGE ENDPOINTS ============
      
      if (url.pathname.match(/^\/api\/storage\/[^/]+\/upload$/) && request.method === 'POST') {
        const bucket = url.pathname.split('/')[3];
        const path = url.searchParams.get('path');
        
        if (!path) return errorResponse('Path required');
        
        const data = await request.arrayBuffer();
        await env.AUTOPROMPTR_STORAGE.put(`${bucket}/${path}`, data, {
          httpMetadata: { contentType: request.headers.get('Content-Type') || 'application/octet-stream' }
        });
        
        return jsonResponse({ success: true, path: `${bucket}/${path}` });
      }
      
      if (url.pathname.match(/^\/api\/storage\/[^/]+\/download$/) && request.method === 'GET') {
        const bucket = url.pathname.split('/')[3];
        const path = url.searchParams.get('path');
        
        if (!path) return errorResponse('Path required');
        
        const object = await env.AUTOPROMPTR_STORAGE.get(`${bucket}/${path}`);
        if (!object) return errorResponse('File not found', 404);
        
        return new Response(object.body, {
          headers: {
            ...corsHeaders,
            'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream'
          }
        });
      }
      
      if (url.pathname.match(/^\/api\/storage\/[^/]+\/public$/) && request.method === 'GET') {
        const bucket = url.pathname.split('/')[3];
        const path = url.searchParams.get('path');
        
        if (!path) return errorResponse('Path required');
        
        return jsonResponse({
          publicUrl: `${url.origin}/api/storage/${bucket}/download?path=${encodeURIComponent(path)}`
        });
      }
      
      if (url.pathname.match(/^\/api\/storage\/[^/]+\/remove$/) && request.method === 'DELETE') {
        const bucket = url.pathname.split('/')[3];
        const body = await request.json() as any;
        const { paths } = body;
        
        if (!paths || paths.length === 0) return errorResponse('Paths required');
        
        for (const path of paths) {
          await env.AUTOPROMPTR_STORAGE.delete(`${bucket}/${path}`);
        }
        
        return jsonResponse({ success: true });
      }

      // ============ BATCH ENDPOINTS ============
      
      if (url.pathname === '/api/run-batch' && request.method === 'POST') {
        const body = await request.json() as any;
        const { batch, platform } = body;
        
        const id = env.BATCH_QUEUE.idFromName(batch.id);
        const stub = env.BATCH_QUEUE.get(id);
        
        const doRequest = new Request('http://do/queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            batchId: batch.id,
            prompts: batch.prompts || [],
            targetUrl: batch.targetUrl,
            platform
          })
        });
        
        const doResponse = await stub.fetch(doRequest);
        const result = await doResponse.json();
        
        await env.AUTOPROMPTR_DB
          .prepare('INSERT OR REPLACE INTO batches (id, status, created_at) VALUES (?, ?, ?)')
          .bind(batch.id, 'processing', new Date().toISOString())
          .run();
        
        return jsonResponse(result);
      }
      
      if (url.pathname.startsWith('/api/batch/') && url.pathname.endsWith('/status')) {
        const batchId = url.pathname.split('/')[3];
        
        const id = env.BATCH_QUEUE.idFromName(batchId);
        const stub = env.BATCH_QUEUE.get(id);
        
        const doRequest = new Request(`http://do/status/${batchId}`, { method: 'GET' });
        const doResponse = await stub.fetch(doRequest);
        
        return new Response(await doResponse.text(), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      if (url.pathname.startsWith('/api/batch/') && url.pathname.endsWith('/stop') && request.method === 'POST') {
        const batchId = url.pathname.split('/')[3];
        
        const id = env.BATCH_QUEUE.idFromName(batchId);
        const stub = env.BATCH_QUEUE.get(id);
        
        const doRequest = new Request('http://do/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ batchId })
        });
        
        const doResponse = await stub.fetch(doRequest);
        return new Response(await doResponse.text(), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get supported platforms
      if (url.pathname === '/api/platforms') {
        const platforms = [
          { id: 'lovable', name: 'Lovable.dev', type: 'web', supported: true },
          { id: 'v0', name: 'v0.dev', type: 'web', supported: true },
          { id: 'chatgpt', name: 'ChatGPT', type: 'web', supported: true },
          { id: 'claude', name: 'Claude.ai', type: 'web', supported: true },
          { id: 'cursor', name: 'Cursor', type: 'local', supported: false },
          { id: 'windsurf', name: 'Windsurf', type: 'local', supported: false }
        ];

        return new Response(JSON.stringify(platforms), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // List all batches from D1
      if (url.pathname === '/api/batches' && request.method === 'GET') {
        const { results } = await env.AUTOPROMPTR_DB
          .prepare('SELECT * FROM batches ORDER BY created_at DESC LIMIT 50')
          .all();

        return new Response(JSON.stringify(results), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders 
      });

    } catch (error) {
      console.error('Cloudflare Worker error:', error);
      
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },
};
