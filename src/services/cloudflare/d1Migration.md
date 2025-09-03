# Cloudflare D1 Migration Guide

## Step-by-Step Migration Instructions

### 1. Setup Cloudflare D1 Database

```bash
# Create a new D1 database
wrangler d1 create autopromptr-db

# Note the database_id from the output and update wrangler.toml:
[[d1_databases]]
binding = "DB"
database_name = "autopromptr-db"
database_id = "your-database-id"
```

### 2. Create Database Schema

```sql
-- users table for authentication
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  email_verified BOOLEAN DEFAULT FALSE,
  metadata JSON
);

-- batches table for prompt automation
CREATE TABLE batches (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  target_url TEXT NOT NULL,
  platform TEXT,
  prompts JSON NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- batch_executions table for tracking runs
CREATE TABLE batch_executions (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  started_at DATETIME,
  completed_at DATETIME,
  results JSON,
  error_message TEXT,
  screenshots JSON,
  FOREIGN KEY (batch_id) REFERENCES batches(id)
);

-- activity_logs table for recent activity
CREATE TABLE activity_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  batch_id TEXT,
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (batch_id) REFERENCES batches(id)
);

-- email_templates table for auth emails
CREATE TABLE email_templates (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'verification', 'password_reset', 'magic_link'
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_batches_user_id ON batches(user_id);
CREATE INDEX idx_batch_executions_batch_id ON batch_executions(batch_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
```

### 3. Execute Schema Migration

```bash
# Apply the schema to your D1 database
wrangler d1 execute autopromptr-db --file=./schema.sql

# For remote (production) database
wrangler d1 execute autopromptr-db --file=./schema.sql --remote
```

### 4. Setup Email Infrastructure

#### A. Install Resend for Email Service
```bash
npm install resend
```

#### B. Configure Email Templates
```sql
-- Insert default email templates
INSERT INTO email_templates (id, type, subject, html_content) VALUES 
('verification', 'verification', 'Verify Your Email - AutoPromptr', 
'<h1>Welcome to AutoPromptr!</h1><p>Click <a href="{{verification_url}}">here</a> to verify your email.</p>'),
('password_reset', 'password_reset', 'Reset Your Password - AutoPromptr',
'<h1>Password Reset</h1><p>Click <a href="{{reset_url}}">here</a> to reset your password.</p>'),
('magic_link', 'magic_link', 'Sign In to AutoPromptr',
'<h1>Magic Link Login</h1><p>Click <a href="{{magic_url}}">here</a> to sign in securely.</p>');
```

### 5. Environment Variables

Add to your `.env` or Cloudflare Workers environment:

```bash
# Email Service
RESEND_API_KEY=re_xxxxxxxxxx

# Database
DATABASE_URL=your-d1-database-url

# Auth Configuration
JWT_SECRET=your-super-secret-jwt-key
AUTH_REDIRECT_URL=https://yourdomain.com/auth/callback

# SMTP Configuration (if using custom SMTP)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=your-resend-api-key
```

### 6. Migration from Supabase

#### A. Export Existing Data
```typescript
// scripts/export-supabase-data.ts
import { supabase } from '../src/integrations/supabase/client';

async function exportData() {
  // Export users
  const { data: users } = await supabase.from('profiles').select('*');
  
  // Export batches
  const { data: batches } = await supabase.from('batches').select('*');
  
  // Save to JSON files for import
  await Bun.write('./exports/users.json', JSON.stringify(users));
  await Bun.write('./exports/batches.json', JSON.stringify(batches));
}
```

#### B. Import to D1
```typescript
// scripts/import-to-d1.ts
import { d1Client } from '../src/services/cloudflare/d1/client';

async function importData() {
  const users = await Bun.file('./exports/users.json').json();
  const batches = await Bun.file('./exports/batches.json').json();
  
  // Import users
  for (const user of users) {
    await d1Client.execute(
      'INSERT INTO users (id, email, created_at) VALUES (?, ?, ?)',
      [user.id, user.email, user.created_at]
    );
  }
  
  // Import batches
  for (const batch of batches) {
    await d1Client.execute(
      'INSERT INTO batches (id, user_id, name, target_url, prompts, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [batch.id, batch.user_id, batch.name, batch.target_url, JSON.stringify(batch.prompts), batch.created_at]
    );
  }
}
```

### 7. Update Application Code

#### A. Replace Supabase Client
```typescript
// src/services/database.ts
import { d1Client } from './cloudflare/d1/client';

export const database = {
  users: {
    async create(userData: any) {
      return await d1Client.execute(
        'INSERT INTO users (id, email, email_verified) VALUES (?, ?, ?)',
        [userData.id, userData.email, userData.email_verified]
      );
    },
    async findByEmail(email: string) {
      return await d1Client.queryFirst(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
    }
  },
  
  batches: {
    async create(batchData: any) {
      return await d1Client.execute(
        'INSERT INTO batches (id, user_id, name, target_url, prompts) VALUES (?, ?, ?, ?, ?)',
        [batchData.id, batchData.user_id, batchData.name, batchData.target_url, JSON.stringify(batchData.prompts)]
      );
    },
    async findByUserId(userId: string) {
      return await d1Client.query(
        'SELECT * FROM batches WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
    }
  }
};
```

### 8. Email Authentication Setup

#### A. Create Auth Edge Function
```typescript
// workers/auth-handler/index.ts
import { Resend } from 'resend';
import { d1Client } from './d1-client';

const resend = new Resend(env.RESEND_API_KEY);

export default {
  async fetch(request: Request, env: Env) {
    const { pathname } = new URL(request.url);
    
    switch (pathname) {
      case '/auth/signup':
        return handleSignup(request, env);
      case '/auth/signin':
        return handleSignin(request, env);
      case '/auth/verify':
        return handleVerification(request, env);
      case '/auth/reset':
        return handlePasswordReset(request, env);
      default:
        return new Response('Not found', { status: 404 });
    }
  }
};

async function handleSignup(request: Request, env: Env) {
  const { email, password } = await request.json();
  
  // Create user in D1
  const userId = crypto.randomUUID();
  await d1Client.execute(
    'INSERT INTO users (id, email, email_verified) VALUES (?, ?, ?)',
    [userId, email, false]
  );
  
  // Send verification email
  const verificationToken = generateJWT({ userId, type: 'verification' });
  await resend.emails.send({
    from: 'AutoPromptr <auth@yourdomain.com>',
    to: email,
    subject: 'Verify Your Email',
    html: `<a href="https://yourdomain.com/auth/verify?token=${verificationToken}">Verify Email</a>`
  });
  
  return Response.json({ success: true });
}
```

### 9. Testing Migration

```bash
# Test D1 connection
wrangler d1 execute autopromptr-db --command "SELECT COUNT(*) FROM users"

# Test email sending
curl -X POST https://your-worker.workers.dev/auth/test-email \
  -d '{"email": "test@example.com"}'

# Verify data integrity
wrangler d1 execute autopromptr-db --command "SELECT * FROM batches LIMIT 5"
```

### 10. Production Deployment

```bash
# Deploy Workers with D1 bindings
wrangler deploy

# Update DNS to point to Workers
# Configure custom domain in Cloudflare Dashboard

# Monitor migration
wrangler tail your-worker-name
```

## Benefits of D1 Migration

- ✅ **Zero Cold Starts**: D1 is serverless but has no cold start delays
- ✅ **Global Distribution**: Data replicated across Cloudflare's edge network  
- ✅ **Cost Effective**: Pay per request, not per hour
- ✅ **Integrated Email**: Built-in SMTP with Resend integration
- ✅ **Enhanced Security**: Automatic encryption and DDoS protection
- ✅ **Better Performance**: Sub-50ms query times globally

## Rollback Plan

If issues occur:
1. Switch DNS back to original deployment
2. Re-enable Supabase in environment variables
3. Restore from D1 backup: `wrangler d1 restore autopromptr-db`
4. Monitor logs and fix issues before re-attempting migration