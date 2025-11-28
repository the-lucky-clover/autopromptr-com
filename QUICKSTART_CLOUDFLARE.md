# 🚀 Quick Start: Cloudflare Free Tier Deployment

Deploy AutoPromptr to Cloudflare's **100% free tier** in under 10 minutes!

## One-Command Setup

```bash
cd /Users/lbs_1/autopromptr
./setup-cloudflare.sh
```

The script will guide you through:
1. Creating D1 database
2. Setting up KV namespace
3. Creating R2 bucket
4. Configuring secrets
5. Deploying the worker

## Manual Setup (if preferred)

### Prerequisites
```bash
# Install Wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### Worker Deployment
```bash
cd workers/autopromptr-worker

# Install dependencies
npm install

# Create resources (development)
npm run setup

# OR for production
npm run setup:prod

# Deploy
npm run deploy
# OR
npm run deploy:production
```

### Frontend Deployment

**Option 1: GitHub Integration (Recommended)**
1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/?to=/:account/pages)
2. Click "Create a project" → "Connect to Git"
3. Select your GitHub repository
4. Build settings:
   - Framework: **Vite**
   - Build command: `npm run build`
   - Build output: `dist`
5. Environment variables:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_WORKER_URL=https://autopromptr-worker.your-subdomain.workers.dev
   ```
6. Click "Save and Deploy"

**Option 2: CLI Deploy**
```bash
# Build frontend
npm run build

# Deploy to Pages
wrangler pages deploy dist --project-name=autopromptr
```

## Verify Deployment

### Test Worker
```bash
curl https://autopromptr-worker.YOUR-SUBDOMAIN.workers.dev/health
```

Expected response:
```json
{
  "status": "healthy",
  "environment": "cloudflare-workers-durable-objects",
  "services": {
    "d1": true,
    "kv": true,
    "r2": true,
    "durableObjects": true
  }
}
```

### Test Batch Creation
```bash
curl -X POST https://autopromptr-worker.YOUR-SUBDOMAIN.workers.dev/api/run-batch \
  -H "Content-Type: application/json" \
  -d '{
    "batch": {
      "id": "test-1",
      "name": "Test",
      "targetUrl": "https://lovable.dev",
      "prompts": [{"id": "p1", "text": "Hello", "order": 0}]
    },
    "platform": "lovable"
  }'
```

## Architecture

```
Frontend (Cloudflare Pages)
    ↓
Worker (API Gateway)
    ↓
Durable Objects (Batch Queue)
    ↓
D1 + KV + R2 (Storage)
```

## Free Tier Limits

| Service | Daily Limit | Storage |
|---------|-------------|---------|
| Workers | 100K requests | - |
| D1 | 5M reads, 100K writes | 5GB |
| KV | 100K reads, 1K writes | 1GB |
| R2 | 33K operations | 10GB |
| Durable Objects | 33K requests | - |
| Pages | Unlimited | Unlimited |

## Monitoring

```bash
# View live logs
cd workers/autopromptr-worker
npm run tail

# Query database
wrangler d1 execute autopromptr --command "SELECT * FROM batches LIMIT 10"

# Check KV
wrangler kv:key list --namespace-id YOUR_KV_ID
```

## Next Steps

1. ✅ Worker deployed
2. ✅ Frontend deployed
3. ⬜ Configure Supabase auth
4. ⬜ Add browser automation (requires paid plan)
5. ⬜ Set up monitoring/analytics

## Troubleshooting

**"Database not found"**
- Update `database_id` in `wrangler.toml`
- Run: `npm run d1:migrate`

**"KV namespace not found"**
- Update `id` in `wrangler.toml`
- Verify: `wrangler kv:namespace list`

**CORS errors**
- Check worker URL in frontend env vars
- Verify CORS headers in worker code

## Full Documentation

See [CLOUDFLARE_FREE_TIER_DEPLOYMENT.md](./CLOUDFLARE_FREE_TIER_DEPLOYMENT.md) for complete details.

## Support

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Durable Objects Guide](https://developers.cloudflare.com/durable-objects/)
- [D1 Documentation](https://developers.cloudflare.com/d1/)
