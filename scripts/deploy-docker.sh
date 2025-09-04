#!/bin/bash
echo "🚀 Deploying AutoPromptr Docker Stack..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Set environment
ENVIRONMENT=${1:-development}

echo "📦 Building Docker images..."
if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose -f docker/docker-compose.prod.yml build
    echo "🚀 Starting production stack..."
    docker-compose -f docker/docker-compose.prod.yml up -d
else
    docker-compose -f docker/docker-compose.yml build
    echo "🔧 Starting development stack..."
    docker-compose -f docker/docker-compose.yml up -d
fi

echo "✅ Docker stack deployed successfully!"
echo "🌐 Services available at:"
echo "  - Frontend: http://localhost:5173"
echo "  - Automation: http://localhost:3000"
echo "  - SMTP: http://localhost:2525"
echo "  - Agents: http://localhost:3001"
echo "  - WebSocket: ws://localhost:8080"

echo "📊 Check status with: docker-compose ps"