# AutoPromptr Backend Deployment Guide

## Overview
This guide explains how to deploy the AutoPromptr backend service that provides browser automation capabilities for the batch processing system.

## Backend Architecture
The backend is a Node.js service using Puppeteer for browser automation. It provides the actual functionality to:
- Open web browsers programmatically  
- Navigate to target URLs (ChatGPT, Claude, Lovable, etc.)
- Find and interact with text input elements
- Type prompts and submit them
- Capture screenshots for verification

## Deployment Options

### Option 1: Render.com (Recommended)
Render.com provides free hosting with good performance for Puppeteer applications.

#### Steps:
1. **Create a new Web Service on Render.com**
2. **Connect your GitHub repository**
3. **Configure the service:**
   ```yaml
   Name: autopromptr-backend
   Environment: Node
   Build Command: npm install
   Start Command: node src/services/automation/backend/renderBackend.js
   ```

4. **Add environment variables:**
   ```
   NODE_ENV=production
   PORT=10000
   ```

5. **Update package.json dependencies:**
   ```json
   {
     "dependencies": {
       "express": "^4.18.2",
       "puppeteer": "^21.5.0", 
       "cors": "^2.8.5"
     }
   }
   ```

#### Render.com Configuration
- **Instance Type**: Free tier is sufficient for testing
- **Auto-Deploy**: Enable for main branch
- **Health Check Path**: `/health`

### Option 2: Railway.app
Alternative deployment platform with similar capabilities.

#### Steps:
1. Create new project on Railway
2. Connect GitHub repository
3. Add environment variables
4. Deploy automatically

### Option 3: Local Development
For local testing and development.

#### Setup:
```bash
# Install dependencies
npm install express puppeteer cors

# Run locally
node src/services/automation/backend/renderBackend.js
```

## Backend Endpoints

### Health Check
```
GET /health
Response: { "status": "healthy", "timestamp": "..." }
```

### Automation Endpoint
```
POST /api/automate
Body: {
  "targetUrl": "https://chat.openai.com",
  "promptText": "Hello, please help me with...",
  "waitForIdle": true,
  "maxRetries": 3,
  "timeout": 30000
}
Response: {
  "success": true,
  "message": "Prompt submitted successfully", 
  "screenshot": "data:image/png;base64,..."
}
```

### Connection Test
```
POST /api/test-connection
Body: { "targetUrl": "https://chat.openai.com" }
Response: { "success": true, "message": "Connection test successful" }
```

## Frontend Integration

The frontend automatically connects to the deployed backend:

```typescript
// In BrowserAutomationService
constructor(baseUrl?: string) {
  this.baseUrl = baseUrl || 'https://autopromptr-backend.onrender.com';
}
```

Update the baseUrl to match your deployed service.

## Supported Platforms

The backend can automate text input for any web-based AI platform:

- **ChatGPT** (chat.openai.com)
- **Claude** (claude.ai) 
- **Lovable** (lovable.dev)
- **Cursor** (local development)
- **Any textarea/contentEditable element**

## Troubleshooting

### Common Issues:

1. **Puppeteer fails to launch**
   - Ensure correct args for headless mode
   - Check memory limits on hosting platform

2. **Cannot find input elements**
   - Add target-specific selectors
   - Increase wait times for dynamic content

3. **Submission fails**
   - Verify submit button selectors
   - Try multiple submission methods

4. **Timeouts**
   - Increase timeout values
   - Check network connectivity

### Debug Mode:
Enable detailed logging by setting debug level in batch settings:
```javascript
debugLevel: 'verbose'
```

## Security Considerations

- **Never store sensitive data** in the backend
- **Validate all inputs** from frontend
- **Rate limit requests** to prevent abuse
- **Use HTTPS** for all communications
- **Implement authentication** for production use

## Monitoring

Monitor the backend health using:
- Render.com dashboard metrics
- Health check endpoint responses
- Application logs

## Scaling

For production use:
- Upgrade to paid hosting tier
- Implement request queuing
- Add load balancing
- Use persistent browser instances
- Implement caching strategies

## Updates

To update the backend:
1. Push changes to GitHub repository
2. Auto-deploy will trigger (if enabled)
3. Verify health check passes
4. Test automation functionality

The backend is now ready to handle real browser automation for your batch processing system!