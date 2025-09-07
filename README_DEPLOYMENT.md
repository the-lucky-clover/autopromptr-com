# AutoPromptr Deployment Guide

## Quick Start

### 1. Backend (Flask + Gemini AI)
```bash
cd apps/backend-flask
pip install -r requirements.txt
export GEMINI_API_KEY="your-key-here"
python app.py
```

### 2. CLI Tool
```bash
cd apps/cli
npm install
npm run build
npm link  # Makes 'autopromptr' command available globally
```

### 3. Frontend (React)
```bash
npm install
npm run dev
```

## Usage Examples

### CLI Usage
```bash
# Test connection
autopromptr test connection

# Create batch from file
autopromptr batch create prompts.json -n "My Batch"

# Run batch
autopromptr batch run <job-id> --watch

# List all batches
autopromptr batch list
```

### Web Dashboard
- Visit `http://localhost:8080` for the web interface
- Use FlaskBackendDashboard component to manage batches

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │   CLI Tool      │    │  Electron App   │
│   (React)       │    │   (Node.js)     │    │   (Desktop)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                         ┌───────▼───────┐
                         │ Flask Backend │
                         │ (Python)      │
                         └───────┬───────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
            ┌───────▼──────┐ ┌───▼────┐ ┌────▼────┐
            │ Gemini AI    │ │ Local  │ │ Web     │
            │ Service      │ │ Tools  │ │ Automation│
            └──────────────┘ └────────┘ └─────────┘
```

## Key Features Implemented

✅ **Core Infrastructure**
- Flask backend with REST API
- Google Gemini AI integration  
- Comprehensive CLI tool
- React dashboard integration

✅ **Batch Management**
- Create, run, monitor, stop batches
- Export results (JSON/YAML/CSV)
- Real-time progress tracking
- Error handling and retries

✅ **Multi-Platform Ready**
- Web interface
- CLI commands
- Electron desktop app
- RESTful API for integrations

## Next Steps (Phase 2)

🔄 **Universal Injection System**
- Browser extensions for ChatGPT/Claude
- IDE plugins (VS Code, JetBrains)
- Generic keystroke automation
- Cross-platform deployment

This is your "Postman for Prompts" foundation - ready to scale!