# AutoPromptr Docker + Cloudflare Deployment Guide

## Quick Start

```bash
# 1. Deploy Cloudflare infrastructure
./scripts/cloudflare-setup.sh

# 2. Deploy Docker services  
./scripts/deploy-docker.sh production

# 3. Deploy to Cloudflare Pages
./scripts/deploy-cloudflare.sh
```

## Complete System Architecture

### Services:
- **Frontend**: React + Vite (Cloudflare Pages)
- **API Gateway**: Cloudflare Workers + D1
- **Automation**: Docker + Playwright + Universal Platform Detection  
- **SMTP**: Multi-provider email service
- **WebSocket**: Real-time updates
- **Agents**: AI orchestration with computer vision

### Universal Platform Support:
- **Existing**: v0.dev, Lovable, Cursor, Windsurf, ChatGPT, Claude, Replit
- **Future**: Automatic AI-powered detection of new coding platforms

### Key Features:
✅ Magic link authentication  
✅ Universal text-to-code platform detection  
✅ Docker containerization for consistency  
✅ Real-time WebSocket updates  
✅ Multi-provider SMTP with templates  
✅ Computer vision for unknown platform detection  
✅ Enterprise-grade scalability and security  

## Production Deployment

The system automatically scales, detects new platforms, and provides enterprise-grade reliability with Docker containers, Cloudflare edge computing, and AI-powered automation.