#!/bin/bash

# AutoPromptr Cloudflare Free Tier Setup Script
# Automates the entire deployment process

set -e  # Exit on error

echo "🚀 AutoPromptr Cloudflare Free Tier Setup"
echo "=========================================="
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Check if logged in
echo "📝 Checking Wrangler authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "🔐 Please log in to Cloudflare:"
    wrangler login
fi

echo ""
echo "✅ Wrangler authenticated"
echo ""

# Navigate to worker directory
cd "$(dirname "$0")/workers/autopromptr-worker"

echo "📦 Installing worker dependencies..."
npm install

echo ""
echo "🗄️  Creating D1 Database..."
echo ""
echo "Choose environment:"
echo "1) Development"
echo "2) Production"
echo "3) Both"
read -p "Enter choice (1-3): " db_choice

case $db_choice in
    1)
        echo "Creating development database..."
        npm run d1:create
        echo ""
        echo "⚠️  Copy the database_id from above and update wrangler.toml"
        read -p "Press Enter after updating wrangler.toml..."
        npm run d1:migrate
        ;;
    2)
        echo "Creating production database..."
        npm run d1:create:prod
        echo ""
        echo "⚠️  Copy the database_id from above and update wrangler.toml [env.production] section"
        read -p "Press Enter after updating wrangler.toml..."
        npm run d1:migrate:prod
        ;;
    3)
        echo "Creating development database..."
        npm run d1:create
        echo ""
        echo "⚠️  Copy the database_id from above and update wrangler.toml"
        read -p "Press Enter after updating wrangler.toml..."
        
        echo "Creating production database..."
        npm run d1:create:prod
        echo ""
        echo "⚠️  Copy the database_id from above and update wrangler.toml [env.production] section"
        read -p "Press Enter after updating wrangler.toml..."
        
        npm run d1:migrate
        npm run d1:migrate:prod
        ;;
esac

echo ""
echo "🔑 Creating KV Namespace..."
case $db_choice in
    1)
        npm run kv:create
        echo "⚠️  Copy the id from above and update wrangler.toml [[kv_namespaces]] binding"
        read -p "Press Enter after updating wrangler.toml..."
        ;;
    2)
        npm run kv:create:prod
        echo "⚠️  Copy the id from above and update wrangler.toml [[env.production.kv_namespaces]]"
        read -p "Press Enter after updating wrangler.toml..."
        ;;
    3)
        npm run kv:create
        echo "⚠️  Copy the id from above and update wrangler.toml [[kv_namespaces]] binding"
        read -p "Press Enter after updating wrangler.toml..."
        
        npm run kv:create:prod
        echo "⚠️  Copy the id from above and update wrangler.toml [[env.production.kv_namespaces]]"
        read -p "Press Enter after updating wrangler.toml..."
        ;;
esac

echo ""
echo "📦 Creating R2 Bucket..."
case $db_choice in
    1)
        npm run r2:create
        ;;
    2)
        npm run r2:create:prod
        ;;
    3)
        npm run r2:create
        npm run r2:create:prod
        ;;
esac

echo ""
echo "🔐 Setting up secrets..."
echo ""
read -p "Enter Supabase URL: " supabase_url
echo "$supabase_url" | wrangler secret put SUPABASE_URL

echo ""
read -p "Enter Supabase Anon Key: " supabase_anon
echo "$supabase_anon" | wrangler secret put SUPABASE_ANON_KEY

echo ""
read -p "Enter Supabase Service Role Key (optional, press Enter to skip): " supabase_service
if [ -n "$supabase_service" ]; then
    echo "$supabase_service" | wrangler secret put SUPABASE_SERVICE_ROLE_KEY
fi

echo ""
echo "🧪 Testing local deployment..."
npm run dev &
DEV_PID=$!
sleep 5

echo ""
echo "Testing health endpoint..."
curl -s http://localhost:8787/health | jq .

echo ""
echo "Stopping dev server..."
kill $DEV_PID

echo ""
echo "🚀 Deploying to Cloudflare..."
read -p "Deploy now? (y/n): " deploy_choice

if [ "$deploy_choice" = "y" ]; then
    case $db_choice in
        1)
            npm run deploy
            ;;
        2)
            npm run deploy:production
            ;;
        3)
            npm run deploy
            npm run deploy:production
            ;;
    esac
    
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "Worker URLs:"
    wrangler deployments list
fi

echo ""
echo "=========================================="
echo "🎉 Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Visit Cloudflare Dashboard → Workers to see your deployed worker"
echo "2. Test your worker: curl https://YOUR-WORKER.workers.dev/health"
echo "3. Deploy frontend to Cloudflare Pages"
echo "4. Update VITE_WORKER_URL in Pages environment variables"
echo ""
echo "For frontend deployment, see: CLOUDFLARE_FREE_TIER_DEPLOYMENT.md"
echo ""
