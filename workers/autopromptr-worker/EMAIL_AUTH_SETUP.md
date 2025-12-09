# Email Authentication Setup Guide

## 🚀 Free Tier SMTP with Cloudflare Workers + MailChannels

AutoPromptr uses **MailChannels** for sending emails - it's **completely free** when used with Cloudflare Workers. No API keys needed!

## Supported Email Features

| Feature | Endpoint | Method |
|---------|----------|--------|
| Email Verification | `/api/auth/verify-email` | GET |
| Password Reset | `/api/auth/forgot-password` | POST |
| Reset Password | `/api/auth/reset-password` | POST |
| Magic Link Login | `/api/auth/magic-link` | POST |
| Verify Magic Link | `/api/auth/verify-magic-link` | GET |
| Change Email | `/api/auth/change-email` | POST |
| Confirm Email Change | `/api/auth/confirm-email-change` | GET |
| Resend Verification | `/api/auth/resend-verification` | POST |
| Validate Token | `/api/auth/validate-token` | GET |

## 📧 Email Provider Options

### Option 1: MailChannels (FREE - Recommended)

MailChannels allows Cloudflare Workers to send emails for free. Setup requires DNS records only.

#### Step 1: Add SPF Record

Add this TXT record to your domain's DNS:

```text
Type: TXT
Name: @
Value: v=spf1 a mx include:relay.mailchannels.net ~all
```

#### Step 2: Add Domain Lockdown Record (Recommended)

Prevents other Workers from sending emails as your domain:

```text
Type: TXT
Name: _mailchannels
Value: v=mc1 cfid=autopromptr-worker.your-subdomain.workers.dev
```

Replace `your-subdomain` with your actual Cloudflare Workers subdomain.

#### Step 3: Optional - Add DKIM (Highly Recommended)

DKIM signing improves deliverability. Generate a key pair:

```bash
# Generate DKIM key pair
openssl genrsa -out dkim_private.pem 2048
openssl rsa -in dkim_private.pem -pubout -out dkim_public.pem

# Get the public key for DNS (remove headers and newlines)
cat dkim_public.pem | grep -v "PUBLIC KEY" | tr -d '\n'
```

Add DNS record:

```text
Type: TXT
Name: mailchannels._domainkey
Value: v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY_HERE
```

Set secrets:

```bash
wrangler secret put DKIM_DOMAIN
# Enter: autopromptr.com

wrangler secret put DKIM_SELECTOR
# Enter: mailchannels

wrangler secret put DKIM_PRIVATE_KEY
# Enter: (paste your private key, base64 encoded)
```

### Option 2: Resend (Paid - Better Deliverability)

For production with high email volume, use Resend:

1. Sign up at [resend.com](https://resend.com)
2. Add and verify your domain
3. Get your API key
4. Set the secret:

```bash
wrangler secret put RESEND_API_KEY
# Enter: re_xxxxxxxxxxxx
```

The worker will automatically use Resend when the API key is configured.

## ⚙️ Configuration

### Environment Variables

Set in `wrangler.toml`:

```toml
[vars]
SITE_URL = "https://autopromptr.pages.dev"
EMAIL_FROM = "noreply@autopromptr.com"
EMAIL_FROM_NAME = "AutoPromptr"
```

### Secrets (via CLI)

```bash
# Required
wrangler secret put JWT_SECRET

# Optional - for Resend
wrangler secret put RESEND_API_KEY

# Optional - for DKIM with MailChannels
wrangler secret put DKIM_DOMAIN
wrangler secret put DKIM_SELECTOR
wrangler secret put DKIM_PRIVATE_KEY
```

## 🔧 API Usage Examples

### Sign Up (sends verification email)

```javascript
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securepassword123',
    metadata: { name: 'John Doe' }
  })
});

// Response includes message about verification email
```

### Request Password Reset

```javascript
const response = await fetch('/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com'
  })
});

// Response is always success to prevent email enumeration
```

### Reset Password with Token

```javascript
const response = await fetch('/api/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'token-from-email-link',
    password: 'newSecurePassword123'
  })
});
```

### Request Magic Link Login

```javascript
const response = await fetch('/api/auth/magic-link', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com'
  })
});
```

### Request Email Change (requires auth)

```javascript
const response = await fetch('/api/auth/change-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    newEmail: 'newemail@example.com',
    password: 'currentPassword123'
  })
});
```

### Validate Token

```javascript
const response = await fetch(
  '/api/auth/validate-token?token=xxx&type=password_reset'
);
const { valid, error } = await response.json();
```

## 🔒 Security Features

### Rate Limiting

| Action | Limit | Window |
|--------|-------|--------|
| Email sends per address | 5 | 1 hour |
| Password reset requests | 3 | 1 hour |
| Magic link requests | 10 | 1 hour |
| Email change requests | 3 | 1 hour |

### Token Expiration

| Token Type | Expiration |
|------------|------------|
| Email Verification | 24 hours |
| Password Reset | 1 hour |
| Magic Link | 15 minutes |
| Email Change | 1 hour |

### Security Best Practices

- Tokens are single-use (marked as used after consumption)
- Previous tokens of same type are invalidated on new request
- Password reset responses don't reveal if email exists
- Email change requires current password verification
- All tokens include IP address and user agent logging
- Sessions can be invalidated on password reset

## 📊 Database Schema

New tables added for email auth:

```sql
-- Email tokens (verification, reset, magic link, email change)
CREATE TABLE email_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  token_type TEXT NOT NULL,
  new_email TEXT,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  ip_address TEXT,
  user_agent TEXT
);

-- Email send logs (for debugging and rate limiting)
CREATE TABLE email_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  email_type TEXT NOT NULL,
  status TEXT NOT NULL,
  provider TEXT,
  message_id TEXT,
  error_message TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  ip_address TEXT
);

-- Rate limits
CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER DEFAULT 1,
  window_start TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

## 🚀 Deployment

### 1. Update Schema

```bash
cd workers/autopromptr-worker

# Development
npm run d1:migrate

# Production
npm run d1:migrate:prod
```

### 2. Add DNS Records

Add the SPF and optional DKIM records to your domain.

### 3. Set Secrets

```bash
wrangler secret put JWT_SECRET
# And any optional secrets for DKIM or Resend
```

### 4. Deploy

```bash
npm run deploy
# or
npm run deploy:production
```

## 🧪 Testing

### Development Mode

When neither `RESEND_API_KEY` nor `DKIM_DOMAIN` is set, the worker runs in development mode:

- Email verification is auto-confirmed on signup
- Session is returned immediately
- No emails are actually sent

### Test Email Flow

1. Sign up with a test email
2. Check the `email_tokens` table for the token
3. Call the verify endpoint with the token
4. Check the `email_logs` table for send status

```bash
# Query tokens (development)
wrangler d1 execute autopromptr --command "SELECT * FROM email_tokens ORDER BY created_at DESC LIMIT 5"

# Query email logs
wrangler d1 execute autopromptr --command "SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 10"
```

## 🎨 Email Templates

Beautiful, responsive HTML email templates are included for:

- ✅ Email Verification (purple gradient)
- 🔐 Password Reset (pink gradient)
- ✨ Magic Link Login (green gradient)
- 📧 Email Change Confirmation (blue gradient)

All templates:

- Mobile responsive
- Include plain text fallback
- Feature your site branding
- Have clear call-to-action buttons
- Include security disclaimers

## 🔍 Troubleshooting

### Emails Not Sending

1. Check DNS records are propagated: `dig TXT yourdomain.com`
2. Check email logs: `SELECT * FROM email_logs WHERE status = 'failed'`
3. Verify SITE_URL is correct in wrangler.toml

### Emails Going to Spam

1. Add DKIM signing (see setup above)
2. Add DMARC record: `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com`
3. Ensure SPF record is correct
4. Use a proper "from" email address

### Token Invalid Errors

1. Token may be expired - check `expires_at`
2. Token may be used - check `used_at`
3. Wrong token type - ensure `token_type` matches endpoint

### Rate Limited

1. Wait for the window to reset (1 hour)
2. Check `rate_limits` table for current counts
3. In development, manually reset: `DELETE FROM rate_limits WHERE key LIKE 'email:%'`
