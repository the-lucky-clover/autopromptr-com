# Cloudflare Free Tier Deployment Guide

## 🚀 Complete Free Tier Architecture

AutoPromptr now runs **100% on Cloudflare's free tier** using:

- **Durable Objects** (replaces Queues - not free) - State management & batch coordination
- **D1 Database** - 5GB storage, 5M reads/day, 100K writes/day
- **KV Storage** - 100K reads/day, 1K writes/day, 1GB storage  
- **R2 Storage** - 10GB storage, 1M operations/month
- **Workers** - 100K requests/day
- **Pages** - Unlimited static hosting

## Prerequisites

1. **Cloudflare Account** (free tier)
2. **Wrangler CLI** installed globally:
   ```bash
   npm install -g wrangler
   ```
3. **Wrangler Login**:
   ```bash
   wrangler login
   ```

## 🛠️ Setup Steps

### 1. Navigate to Worker Directory
```bash
cd /Users/lbs_1/autopromptr/workers/autopromptr-worker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create D1 Database
```bash
# Development
npm run d1:create

# Production
npm run d1:create:prod
```

Copy the `database_id` from the output and update `wrangler.toml`:
```toml
[[d1_databases]]
binding = "AUTOPROMPTR_DB"
database_name = "autopromptr"
database_id = "YOUR_DATABASE_ID_HERE"
```

### 4. Run Database Migrations
```bash
# Development
npm run d1:migrate

# Production  
npm run d1:migrate:prod
```

### 5. Create KV Namespace
```bash
# Development
npm run kv:create

# Production
npm run kv:create:prod
```

Copy the `id` from output and update `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "AUTOPROMPTR_KV"
id = "YOUR_KV_ID_HERE"
```

### 6. Create R2 Bucket
```bash
# Development
npm run r2:create

# Production
npm run r2:create:prod
```

### 7. Set Secrets
```bash
# Supabase URL
wrangler secret put SUPABASE_URL
# Enter: https://your-project.supabase.co

# Supabase Anon Key
wrangler secret put SUPABASE_ANON_KEY
# Enter: your-anon-key

# (Optional) Service Role Key for admin operations
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# Enter: your-service-role-key
```

### 8. Test Locally
```bash
npm run dev
```

Visit http://localhost:8787/health to verify it's running.

### 9. Deploy to Cloudflare
```bash
# Development
npm run deploy

# Production
npm run deploy:production
```

## 🌐 Frontend Deployment (Cloudflare Pages)

### Option A: Connect GitHub Repository

1. Go to Cloudflare Dashboard → Pages
2. Click "Create a project" → "Connect to Git"
3. Select `the-lucky-clover/autopromptr-com`
4. Configure build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Add environment variables:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_WORKER_URL=https://autopromptr-worker.your-subdomain.workers.dev
   ```
6. Click "Save and Deploy"

### Option B: Direct Deploy via Wrangler

```bash
cd /Users/lbs_1/autopromptr
npm run build
wrangler pages deploy dist --project-name=autopromptr
```

## 📊 Verifying Deployment

### Check Worker Health
```bash
curl https://autopromptr-worker.your-subdomain.workers.dev/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-11-27T...",
  "environment": "cloudflare-workers-durable-objects",
  "services": {
    "d1": true,
    "kv": true,
    "r2": true,
    "durableObjects": true
  }
}
```

### Test Batch Endpoint
```bash
curl -X POST https://autopromptr-worker.your-subdomain.workers.dev/api/run-batch \
  -H "Content-Type: application/json" \
  -d '{
    "batch": {
      "id": "test-batch-1",
      "name": "Test Batch",
      "targetUrl": "https://lovable.dev",
      "prompts": [
        {"id": "p1", "text": "Create a hello world app", "order": 0}
      ]
    },
    "platform": "lovable"
  }'
```

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Cloudflare Pages                      │
│              (Frontend - React/Vite)                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Cloudflare Worker (Main)                   │
│         - API Routes                                    │
│         - Request Router                                │
└────────┬──────────────────────┬─────────────────────────┘
         │                      │
         ▼                      ▼
┌─────────────────┐    ┌──────────────────────────────────┐
│ Durable Objects │    │    Cloudflare Services           │
│  (BatchQueue)   │    │  - D1 Database                   │
│                 │    │  - KV Storage                    │
│ - State Mgmt    │    │  - R2 Storage                    │
│ - Processing    │    │  - Supabase (external)           │
└─────────────────┘    └──────────────────────────────────┘
```

## 🔧 Monitoring & Debugging

### View Real-time Logs
```bash
npm run tail
```

### Query D1 Database
```bash
# List all batches
wrangler d1 execute autopromptr --command "SELECT * FROM batches LIMIT 10"

# Check batch status
wrangler d1 execute autopromptr --command "SELECT id, status, created_at FROM batches WHERE status='processing'"

# View prompts for a batch
wrangler d1 execute autopromptr --command "SELECT * FROM prompts WHERE batch_id='YOUR_BATCH_ID'"
```

### Check KV Contents
```bash
wrangler kv:key list --namespace-id YOUR_KV_ID
wrangler kv:key get "key-name" --namespace-id YOUR_KV_ID
```

### List R2 Objects
```bash
wrangler r2 object list autopromptr-files
```

## 📈 Free Tier Limits

| Service | Limit | Notes |
|---------|-------|-------|
| Workers | 100K requests/day | More than enough for MVP |
| D1 Reads | 5M/day | ~58 reads/second |
| D1 Writes | 100K/day | ~1.1 writes/second |
| D1 Storage | 5GB | Plenty for batch metadata |
| KV Reads | 100K/day | Good for config/cache |
| KV Writes | 1K/day | Use D1 for frequent writes |
| R2 Storage | 10GB | For screenshots/artifacts |
| R2 Operations | 1M/month | ~33K/day |
| Durable Objects | 1M requests/month | ~33K/day |
| Pages | Unlimited | Static hosting |

## 🚨 Troubleshooting

### "Database not found" error
- Verify `database_id` in `wrangler.toml` matches created database
- Run migrations: `npm run d1:migrate`

### "KV namespace not found"
- Verify `id` in `wrangler.toml` matches created namespace
- Check with: `wrangler kv:namespace list`

### "Durable Object not found"
- Ensure `[[durable_objects.bindings]]` is configured in `wrangler.toml`
- Redeploy: `npm run deploy`

### CORS errors from frontend
- Check Worker CORS headers are allowing your Pages domain
- Update `Access-Control-Allow-Origin` in worker code

## 🔐 Security Best Practices

1. **Never commit secrets** - Always use `wrangler secret put`
2. **Use environment-specific configs** - Separate dev/prod databases
3. **Enable RLS** - Use Supabase Row Level Security policies
4. **Rotate keys regularly** - Update secrets periodically
5. **Monitor usage** - Set up Cloudflare Analytics

## 🎉 Next Steps

1. **Configure Supabase** - Set up authentication and RLS policies
2. **Add Browser Automation** - Integrate Puppeteer/Playwright (requires paid plan)
3. **Implement Rate Limiting** - Use KV for request throttling
4. **Set up Analytics** - Track batch success rates
5. **Add Webhooks** - Notify on batch completion

## 📚 Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Durable Objects Guide](https://developers.cloudflare.com/durable-objects/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [KV Storage Docs](https://developers.cloudflare.com/kv/)
- [R2 Storage Docs](https://developers.cloudflare.com/r2/)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
