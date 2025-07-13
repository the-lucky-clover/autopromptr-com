
# Migration to Cloudflare Pages

## Overview
This guide covers migrating your AutoPromptr application from Lovable to Cloudflare Pages.

## Prerequisites
- GitHub account
- Cloudflare account
- Your codebase exported from Lovable

## Step 1: Export from Lovable
1. Connect your Lovable project to GitHub if not already done
2. Push all your code to the GitHub repository
3. Clone the repository locally

## Step 2: Prepare for Cloudflare Pages
1. Your code is now ready with the necessary configuration files:
   - `wrangler.toml` - Cloudflare configuration
   - `_headers` - HTTP headers for security and caching
   - `_redirects` - URL rewriting for SPA routing
   - Updated environment variable handling

## Step 3: Deploy to Cloudflare Pages
1. Go to https://dash.cloudflare.com/pages
2. Click "Create a project"
3. Connect your GitHub repository
4. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/` (if repo root)

## Step 4: Environment Variables
Set these in Cloudflare Pages dashboard under Settings > Environment Variables:
```
VITE_SUPABASE_URL=https://raahpoyciwuyhwlcenpy.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 5: Domain Setup (Optional)
1. Add your custom domain in Cloudflare Pages
2. Update DNS records as instructed
3. SSL will be automatically provisioned

## Backend Services Migration Options

### Option 1: Keep Supabase (Recommended)
- ✅ No backend migration needed
- ✅ Keep all your data and functionality
- ✅ Edge functions continue to work
- ❌ Still dependent on Supabase

### Option 2: Migrate to Cloudflare
- **Database**: Migrate from Supabase to Cloudflare D1
- **Functions**: Convert Supabase Edge Functions to Cloudflare Workers
- **Storage**: Move from Supabase Storage to Cloudflare R2
- **Auth**: Implement custom auth or use third-party service

### Option 3: Hybrid Approach
- Keep Supabase for database and auth
- Move some functions to Cloudflare Workers
- Use Cloudflare R2 for file storage

## Post-Migration Checklist
- [ ] Test all functionality on the new domain
- [ ] Verify environment variables are set correctly
- [ ] Check that all API endpoints are working
- [ ] Test authentication flow
- [ ] Verify file uploads (if using Supabase Storage)
- [ ] Test responsive design on mobile
- [ ] Check performance and loading times

## Troubleshooting
- If builds fail, check the build logs in Cloudflare Pages dashboard
- Ensure all environment variables are set correctly
- Verify that your `dist` folder is being generated properly
- Check for any hardcoded localhost URLs in your code

## Benefits of Cloudflare Pages
- ✅ Excellent global CDN performance
- ✅ Automatic HTTPS and security headers
- ✅ Built-in analytics and Web Vitals
- ✅ Easy custom domain setup
- ✅ Generous free tier
- ✅ Integration with Cloudflare Workers for serverless functions
