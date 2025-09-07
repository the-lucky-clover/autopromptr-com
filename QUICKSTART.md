# AutoPromptr Quick Start 🚀

Your "Postman for Prompts" system is ready! Here's how to get it running in 60 seconds:

## 1. Start the Backend (30 seconds)

```bash
# Make scripts executable
chmod +x start-backend.sh test-system.sh

# Set your Gemini API key (get one at https://makersuite.google.com/app/apikey)
export GEMINI_API_KEY="your-gemini-api-key-here"

# Start the Flask backend
./start-backend.sh
```

The backend will be running at `http://localhost:5000`

## 2. Test the System (30 seconds)

In a new terminal:
```bash
# Test all endpoints
./test-system.sh
```

This will:
- ✅ Check health status
- ✅ Test Gemini AI integration  
- ✅ Create a sample batch job
- ✅ Run the batch and check results
- ✅ List all batches

## 3. Use the CLI Tool (Optional)

```bash
cd apps/cli
npm install && npm run build
npm link  # Makes 'autopromptr' command global

# Test CLI
autopromptr test connection
autopromptr batch create example-prompts.json -n "My First Batch"
```

## 4. Frontend Integration

The React frontend already has `FlaskBackendClient` ready to connect:

```typescript
import { flaskBackend } from '@/services/flaskBackend';

// Create batch
const result = await flaskBackend.createBatch("Test Batch", [
  { text: "What is AI?", platform: "gemini" }
]);

// Run batch  
await flaskBackend.runBatch(result.job_id);
```

## API Endpoints

- `GET /health` - System health check
- `POST /api/batches` - Create new batch
- `POST /api/batches/{id}/run` - Run batch
- `GET /api/batches/{id}/status` - Check status
- `GET /api/batches` - List all batches
- `POST /api/test/gemini` - Test AI integration

## What You Have Now

🎯 **Complete "Postman for Prompts" System:**
- ✅ REST API for batch prompt management
- ✅ Google Gemini AI integration
- ✅ Web automation (Playwright)
- ✅ CLI tool for command-line usage
- ✅ React frontend integration ready
- ✅ Real-time job tracking
- ✅ Error handling and retries

## Next Steps

1. **Test the basic system** with the provided scripts
2. **Create your first real batch** with your prompts
3. **Integrate with your React frontend** using the existing components
4. **Scale up** - add more AI providers, web automation targets, etc.

Your universal prompt automation system is ready to rock! 🚀