#!/bin/bash
echo "🚀 Setting up Cloudflare infrastructure..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "📦 Installing Wrangler CLI..."
    npm install -g wrangler
fi

# Login to Cloudflare (if not already logged in)
if ! wrangler whoami &> /dev/null; then
    echo "🔐 Please login to Cloudflare..."
    wrangler login
fi

echo "🗄️ Creating D1 databases..."

# Create D1 databases
wrangler d1 create autopromptr-production || echo "Production database already exists"
wrangler d1 create autopromptr-staging || echo "Staging database already exists"

echo "📦 Creating R2 storage buckets..."

# Create R2 buckets
wrangler r2 bucket create autopromptr-files-production || echo "Production files bucket already exists"
wrangler r2 bucket create autopromptr-files-staging || echo "Staging files bucket already exists"
wrangler r2 bucket create autopromptr-files || echo "Files bucket already exists"

echo "🔧 Initializing D1 schemas..."

# Execute schema on databases
wrangler d1 execute autopromptr-production --file=src/services/cloudflare/d1/schemas.sql
wrangler d1 execute autopromptr-staging --file=src/services/cloudflare/d1/schemas.sql

# Execute enhanced schema
wrangler d1 execute autopromptr-production --file=src/services/cloudflare/d1/enhanced-schemas.sql
wrangler d1 execute autopromptr-staging --file=src/services/cloudflare/d1/enhanced-schemas.sql

echo "🌐 Deploying Cloudflare Workers..."

# Deploy workers
cd workers/autopromptr-worker
wrangler deploy --env staging
wrangler deploy --env production
cd ../..

echo "✅ Cloudflare infrastructure setup complete!"
echo ""
echo "📋 Next steps for Cloudflare Pages:"
echo "1. Go to https://dash.cloudflare.com/pages"
echo "2. Click 'Create a project'"
echo "3. Connect your GitHub repository"
echo "4. Set build command: npm run build"
echo "5. Set build output directory: dist"
echo "6. Add environment variables:"
echo "   - VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY"
echo "   - VITE_CLOUDFLARE_WORKER_URL"
echo "   - VITE_AUTOMATION_URL"
echo "   - VITE_AGENTS_URL"
echo "   - VITE_SMTP_URL"
echo "   - VITE_WEBSOCKET_URL"
echo ""
echo "🔍 View your resources:"
echo "wrangler d1 list"
echo "wrangler r2 bucket list"