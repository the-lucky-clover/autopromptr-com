#!/bin/bash
echo "🔧 Setting up AutoPromptr Development Environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first."
    echo "Download from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please update Docker Desktop."
    exit 1
fi

echo "✅ Docker is installed and ready"

# Create necessary directories
echo "📁 Creating development directories..."
mkdir -p logs
mkdir -p data/screenshots
mkdir -p data/profiles
mkdir -p data/recordings

# Set up environment variables for development
echo "⚙️ Setting up environment variables..."
if [ ! -f .env.development ]; then
    cat > .env.development << EOF
# Development Environment Variables
NODE_ENV=development

# Service URLs (Docker containers)
VITE_AUTOMATION_URL=http://localhost:3000
VITE_AGENTS_URL=http://localhost:3001
VITE_SMTP_URL=http://localhost:2525
VITE_WEBSOCKET_URL=ws://localhost:8080

# Cloudflare Workers (local)
VITE_CLOUDFLARE_WORKER_URL=http://localhost:8787

# Supabase (your existing config)
VITE_SUPABASE_URL=https://raahpoyciwuyhwlcenpy.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Development flags
VITE_USE_DOCKER_SERVICES=true
VITE_DEBUG_MODE=true
EOF
    echo "✅ Created .env.development file"
    echo "⚠️  Please update VITE_SUPABASE_ANON_KEY in .env.development"
else
    echo "✅ .env.development already exists"
fi

echo "🏗️ Building Docker images..."
docker compose -f docker/docker-compose.yml build

echo "🚀 Starting development services..."
docker compose -f docker/docker-compose.yml up -d

echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."
services=("automation:3000" "agents:3001" "smtp:2525" "websocket:8080")
all_healthy=true

for service in "${services[@]}"; do
    name="${service%:*}"
    port="${service#*:}"
    
    if curl -f "http://localhost:$port/health" &> /dev/null; then
        echo "✅ $name service is healthy"
    else
        echo "❌ $name service is not responding"
        all_healthy=false
    fi
done

if [ "$all_healthy" = true ]; then
    echo ""
    echo "🎉 Development environment is ready!"
    echo ""
    echo "🌐 Available services:"
    echo "  - Frontend Dev Server: http://localhost:5173 (npm run dev)"
    echo "  - Automation Service: http://localhost:3000"
    echo "  - Agents Service: http://localhost:3001"
    echo "  - SMTP Service: http://localhost:2525"
    echo "  - WebSocket Service: ws://localhost:8080"
    echo "  - Cloudflare Workers: http://localhost:8787 (wrangler dev)"
    echo ""
    echo "📊 Management commands:"
    echo "  - View logs: docker compose -f docker/docker-compose.yml logs -f"
    echo "  - Stop services: docker compose -f docker/docker-compose.yml down"
    echo "  - Restart services: docker compose -f docker/docker-compose.yml restart"
    echo ""
    echo "🚀 Start the frontend with: npm run dev"
else
    echo ""
    echo "⚠️  Some services are not healthy. Check the logs:"
    echo "docker compose -f docker/docker-compose.yml logs"
fi