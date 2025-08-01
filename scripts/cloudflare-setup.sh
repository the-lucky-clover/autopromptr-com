#!/bin/bash

echo "🚀 Setting up Cloudflare Infrastructure for AutoPromptr..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
    echo "✅ Wrangler CLI installed"
fi

# Authenticate with Cloudflare (if not already done)
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "Please authenticate with Cloudflare:"
    wrangler login
fi

echo "✅ Authenticated with Cloudflare"

# Create D1 databases
echo "📊 Creating D1 databases..."

# Production database
echo "Creating production database..."
wrangler d1 create autopromptr-production
echo "Please update wrangler.toml with the production database ID"

# Staging database
echo "Creating staging database..."
wrangler d1 create autopromptr-staging
echo "Please update wrangler.toml with the staging database ID"

# Create R2 buckets
echo "📁 Creating R2 storage buckets..."

# Production bucket
wrangler r2 bucket create autopromptr-files-production
echo "✅ Created production R2 bucket: autopromptr-files-production"

# Staging bucket
wrangler r2 bucket create autopromptr-files-staging
echo "✅ Created staging R2 bucket: autopromptr-files-staging

# Development bucket
wrangler r2 bucket create autopromptr-files
echo "✅ Created development R2 bucket: autopromptr-files"

# Initialize D1 database schema
echo "🗄️ Initializing D1 database schemas..."

# Apply schema to production
wrangler d1 execute autopromptr-production --file=src/services/cloudflare/d1/schemas.sql
echo "✅ Applied schema to production database"

# Apply schema to staging
wrangler d1 execute autopromptr-staging --file=src/services/cloudflare/d1/schemas.sql
echo "✅ Applied schema to staging database"

# Deploy Workers
echo "🔧 Deploying Cloudflare Workers..."

cd workers/autopromptr-worker

# Deploy to staging
wrangler deploy --env staging
echo "✅ Deployed to staging environment"

# Deploy to production
wrangler deploy --env production
echo "✅ Deployed to production environment"

cd ../..

# Set up Pages project
echo "🌐 Setting up Cloudflare Pages..."
echo ""
echo "Next steps for Cloudflare Pages:"
echo "1. Go to https://dash.cloudflare.com/pages"
echo "2. Click 'Create a project'"
echo "3. Connect your GitHub repository"
echo "4. Configure build settings:"
echo "   - Build command: npm run build"
echo "   - Build output directory: dist"
echo "   - Root directory: /"
echo ""
echo "5. Add environment variables:"
echo "   - VITE_SUPABASE_URL: https://raahpoyciwuyhwlcenpy.supabase.co"
echo "   - VITE_SUPABASE_ANON_KEY: [your_supabase_anon_key]"
echo "   - VITE_USE_CF_WORKERS: true"
echo "   - VITE_CF_WORKER_URL: https://autopromptr-worker.yourdomain.workers.dev"
echo ""

echo "🎉 Cloudflare infrastructure setup complete!"
echo ""
echo "📋 Summary:"
echo "✅ D1 databases created and initialized"
echo "✅ R2 storage buckets created"
echo "✅ Workers deployed to staging and production"
echo "🔄 Pages deployment ready (manual step required)"
echo ""
echo "🔗 Important URLs:"
echo "- Staging Worker: https://autopromptr-worker-staging.yourdomain.workers.dev"
echo "- Production Worker: https://autopromptr-worker-production.yourdomain.workers.dev"
echo "- Cloudflare Dashboard: https://dash.cloudflare.com"
echo ""
echo "⚠️  Don't forget to:"
echo "1. Update wrangler.toml with actual database IDs"
echo "2. Set environment variables in Cloudflare Workers dashboard"
echo "3. Configure custom domain for Workers if needed"
echo "4. Set up Cloudflare Pages deployment"