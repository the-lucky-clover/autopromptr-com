# Flask Backend Deployment Guide

## Deploy to Render.com (Recommended)

### Prerequisites
- GitHub account
- Render.com account (free tier available)

### Step 1: Prepare Repository
1. Ensure `apps/backend-flask/requirements.txt` includes all dependencies
2. Ensure `apps/backend-flask/Dockerfile` is present

### Step 2: Deploy on Render.com

1. **Sign up/Login** to [Render.com](https://render.com)

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing this project

3. **Configure Service**
   - **Name**: `autopromptr-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your deployment branch)
   - **Root Directory**: `apps/backend-flask`
   - **Runtime**: Docker
   - **Docker Command**: Leave empty (uses Dockerfile)
   - **Plan**: Free (or upgrade for better performance)

4. **Set Environment Variables**
   Required:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   FLASK_ENV=production
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy the deployed URL (e.g., `https://autopromptr-backend.onrender.com`)

### Step 3: Update Supabase Edge Functions

Add the backend URL as a Supabase secret:
```bash
# In your Supabase dashboard
BACKEND_URL=https://autopromptr-backend.onrender.com
```

### Step 4: Test Deployment

```bash
# Health check
curl https://autopromptr-backend.onrender.com/health

# Test automation
curl -X POST https://autopromptr-backend.onrender.com/api/automation/test-automation \
  -H "Content-Type: application/json" \
  -d '{
    "target_url": "https://lovable.dev",
    "prompt": "Create a button component",
    "wait_for_completion": true
  }'
```

## Alternative: Railway.app

1. Sign up at [Railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Set root directory: `apps/backend-flask`
4. Add environment variables
5. Deploy

## Alternative: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Deploy
cd apps/backend-flask
fly launch
fly secrets set GEMINI_API_KEY=your_key
fly deploy
```

## Alternative: Self-Hosted Docker

```bash
# Build image
cd apps/backend-flask
docker build -t autopromptr-backend .

# Run container
docker run -d \
  -p 5000:5000 \
  -e GEMINI_API_KEY=your_key \
  -e FLASK_ENV=production \
  --name autopromptr-backend \
  autopromptr-backend

# Check logs
docker logs autopromptr-backend
```

## Monitoring

### Health Checks
The backend exposes `/health` endpoint for monitoring:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "service": "autopromptr-backend",
  "version": "1.0.0"
}
```

### Logs
- Render.com: View in dashboard → Logs tab
- Railway: View in dashboard
- Docker: `docker logs autopromptr-backend`

## Scaling

### Horizontal Scaling
- Render.com: Upgrade plan for autoscaling
- Railway: Enable autoscaling in settings
- Docker: Use Docker Swarm or Kubernetes

### Performance Tips
1. **Playwright Optimization**: Set `headless=True` (already configured)
2. **Caching**: Browser context is reused for same batch
3. **Timeouts**: Adjust `max_wait_time` in `TargetCompletionDetector`
4. **Retries**: Configure `max_retries` in batch options

## Troubleshooting

### Issue: Playwright fails to start
```
Solution: Ensure Dockerfile installs Playwright dependencies
```

### Issue: Timeout errors
```
Solution: Increase timeout in target_completion_detector.py
self.max_wait_time = 600  # 10 minutes
```

### Issue: Memory errors
```
Solution: Upgrade to paid tier or optimize batch size
Process batches in smaller chunks
```

## Security

1. **API Keys**: Always use environment variables
2. **CORS**: Restrict origins in production
3. **Rate Limiting**: Add rate limiting middleware
4. **Authentication**: Implement JWT validation for sensitive endpoints

## Cost Estimates

- **Render.com Free**: 750 hours/month, limited resources
- **Render.com Starter**: $7/month, better performance
- **Railway.app**: Pay-as-you-go, ~$5-20/month
- **Fly.io**: Pay-as-you-go, ~$5-15/month
