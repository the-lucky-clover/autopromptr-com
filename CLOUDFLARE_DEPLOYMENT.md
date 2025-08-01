# Cloudflare Deployment Guide

## 🚀 Complete Migration Setup

This guide provides step-by-step instructions for migrating AutoPromptr to Cloudflare Pages with Workers and D1 database, while maintaining parallel compatibility with the existing Lovable/Render.com setup.

## Phase 1: Prerequisites & Setup

### 1. Install Cloudflare CLI
```bash
npm install -g wrangler
wrangler login
```

### 2. Create Cloudflare Infrastructure
Run the automated setup script:
```bash
chmod +x scripts/cloudflare-setup.sh
./scripts/cloudflare-setup.sh
```

Or follow manual steps below:

### 3. Create D1 Databases
```bash
# Production database
wrangler d1 create autopromptr-production

# Staging database  
wrangler d1 create autopromptr-staging
```

Update `workers/autopromptr-worker/wrangler.toml` with the returned database IDs.

### 4. Create R2 Storage Buckets
```bash
# Production
wrangler r2 bucket create autopromptr-files-production

# Staging
wrangler r2 bucket create autopromptr-files-staging

# Development
wrangler r2 bucket create autopromptr-files
```

### 5. Initialize Database Schema
```bash
# Production
wrangler d1 execute autopromptr-production --file=src/services/cloudflare/d1/schemas.sql

# Staging
wrangler d1 execute autopromptr-staging --file=src/services/cloudflare/d1/schemas.sql
```

## Phase 2: Deploy Workers

### 1. Navigate to Worker Directory
```bash
cd workers/autopromptr-worker
```

### 2. Deploy to Environments
```bash
# Staging
wrangler deploy --env staging

# Production
wrangler deploy --env production
```

### 3. Set Environment Variables
In Cloudflare Dashboard > Workers > autopromptr-worker > Settings > Variables:

```
SUPABASE_URL: https://raahpoyciwuyhwlcenpy.supabase.co
SUPABASE_ANON_KEY: [your_supabase_anon_key]
SUPABASE_SERVICE_ROLE_KEY: [your_service_role_key]
```

## Phase 3: Deploy to Cloudflare Pages

### 1. Connect GitHub Repository
1. Go to https://dash.cloudflare.com/pages
2. Click "Create a project"
3. Connect your GitHub repository
4. Select the repository containing your AutoPromptr code

### 2. Configure Build Settings
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/` (leave empty if repo root)
- **Environment variables:**
  ```
  VITE_SUPABASE_URL=https://raahpoyciwuyhwlcenpy.supabase.co
  VITE_SUPABASE_ANON_KEY=[your_supabase_anon_key]
  VITE_USE_CF_WORKERS=true
  VITE_CF_WORKER_URL=https://autopromptr-worker-production.yourdomain.workers.dev
  VITE_USE_CF_PAGES_ROUTING=true
  VITE_PARALLEL_PROCESSING=false
  ```

### 3. Custom Domain (Optional)
1. Add your custom domain in Pages settings
2. Update DNS records as instructed
3. SSL will be automatically provisioned

## Phase 4: Feature Flags & Parallel Operation

### Environment Variables for Different Modes

#### Production Mode (Cloudflare Only)
```
VITE_USE_CF_WORKERS=true
VITE_USE_CF_PAGES_ROUTING=true
VITE_PARALLEL_PROCESSING=false
```

#### Parallel Mode (Both Systems)
```
VITE_USE_CF_WORKERS=true
VITE_USE_CF_PAGES_ROUTING=true
VITE_PARALLEL_PROCESSING=true
```

#### Fallback Mode (Render.com Primary)
```
VITE_USE_CF_WORKERS=false
VITE_USE_CF_PAGES_ROUTING=false
VITE_PARALLEL_PROCESSING=false
```

## Phase 5: Data Migration

### 1. Backup Current Data
```bash
# Export from Supabase
# Use your existing backup procedures
```

### 2. Migrate to D1 (Optional)
The system supports dual operation, so migration can be gradual:

1. Start with parallel processing enabled
2. Monitor both systems for consistency
3. Gradually shift traffic to Cloudflare
4. Eventually migrate data to D1 when confident

## Phase 6: Testing & Validation

### 1. Test Environments
- **Staging:** `https://autopromptr-worker-staging.yourdomain.workers.dev`
- **Production:** `https://autopromptr-worker-production.yourdomain.workers.dev`
- **Pages:** `https://your-project.pages.dev`

### 2. Health Checks
```bash
# Worker health
curl https://autopromptr-worker-production.yourdomain.workers.dev/health

# Platform list
curl https://autopromptr-worker-production.yourdomain.workers.dev/api/platforms
```

### 3. Batch Processing Test
Use the Migration Dashboard at `/migration-dashboard` to:
- Monitor system status
- Toggle feature flags
- Run health checks
- Test batch processing on both systems

## Phase 7: Monitoring & Optimization

### 1. Performance Monitoring
- Cloudflare Analytics for Pages
- Worker execution logs and metrics
- D1 query performance
- R2 storage usage

### 2. Error Handling
- Worker error logs in Cloudflare Dashboard
- Application errors in browser console
- Health status monitoring

### 3. Cost Optimization
- Monitor D1 read/write operations
- Track R2 storage and bandwidth
- Optimize Worker CPU time usage

## Important URLs

### Development & Testing
- **Migration Dashboard:** `/migration-dashboard`
- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **Workers:** https://dash.cloudflare.com/workers
- **D1 Database:** https://dash.cloudflare.com/d1
- **R2 Storage:** https://dash.cloudflare.com/r2

### Production
- **Worker URL:** `https://autopromptr-worker-production.yourdomain.workers.dev`
- **Pages URL:** `https://your-project.pages.dev`
- **Custom Domain:** `https://your-domain.com`

## Rollback Plan

If issues occur, you can quickly rollback by:

1. **Disable Cloudflare Features:**
   ```
   VITE_USE_CF_WORKERS=false
   VITE_USE_CF_PAGES_ROUTING=false
   ```

2. **Revert to Lovable/Render:**
   - Change DNS back to original hosting
   - Disable feature flags in environment variables
   - System will automatically fallback to original backend

3. **Data Consistency:**
   - If using parallel mode, data should be consistent
   - If D1 migration started, restore from Supabase backup

## Support & Troubleshooting

### Common Issues
1. **Build Failures:** Check environment variables and build logs
2. **Worker Errors:** Check Worker logs in Cloudflare Dashboard
3. **Database Issues:** Verify D1 database ID in wrangler.toml
4. **CORS Issues:** Ensure proper CORS headers in Worker

### Debug Tools
- Browser Developer Tools
- Cloudflare Worker logs
- Migration Dashboard health checks
- Network tab for API calls

### Getting Help
- Check Cloudflare documentation
- Review error logs in dashboard
- Use Migration Dashboard for system status
- Test with parallel mode first before full migration