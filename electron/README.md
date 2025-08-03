# AutoPromptr Companion - Local Electron App

A cross-platform desktop companion app for AutoPromptr that enables local text prompt enrichment and deployment outside the controlled SaaS environment.

## Features

- **Cross-Platform Support**: Windows, macOS, and Linux
- **Local Server**: Built-in HTTP server for local automation
- **Prompt Enhancement**: Local AI-powered prompt improvement
- **Local Automation**: Direct integration with local IDEs (Cursor, Windsurf, VS Code)
- **SaaS Bridge**: Connect to remote AutoPromptr instances
- **Offline Capability**: Works without internet connection

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Building from Source

1. Clone the repository
2. Navigate to the electron directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run in development mode:
```bash
npm run dev
```

### Building for Production

Build for all platforms:
```bash
npm run build:all
```

Build for specific platforms:
```bash
npm run build:win    # Windows
npm run build:mac    # macOS  
npm run build:linux  # Linux
```

## Architecture

### Main Process (`main.js`)
- Creates the application window
- Manages the local HTTP server (port 3001)
- Handles IPC communication
- Manages file dialogs and external links

### Renderer Process (`renderer.js`)
- User interface logic
- API communication with local server
- Status management and updates

### Preload Script (`preload.js`)
- Secure bridge between main and renderer processes
- Exposes safe APIs to the renderer

### Local Server
The companion app runs a local HTTP server on `http://localhost:3001` with these endpoints:

- `GET /health` - Health check
- `POST /enhance-prompt` - Enhance text prompts
- `POST /process-batch` - Process prompt batches
- `POST /local-automation` - Send automation to local apps

## Local IDE Integration

### Supported IDEs
- **Cursor IDE**: `/cursor`
- **Windsurf IDE**: `/windsurf`  
- **VS Code**: `/vscode`
- **Custom Path**: User-defined paths

### Usage
1. Open the companion app
2. Enter your prompt in the enhancement section
3. Select target IDE or enter custom path
4. Click "Send to Local App"

## Security Features

- Context isolation enabled
- Node integration disabled in renderer
- Secure IPC communication
- Local-only server binding
- Input validation and sanitization

## API Endpoints

### Health Check
```http
GET http://localhost:3001/health
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "platform": "win32"
}
```

### Enhance Prompt
```http
POST http://localhost:3001/enhance-prompt
Content-Type: application/json

{
  "prompt": "Create a login form",
  "context": "React TypeScript project"
}
```

Response:
```json
{
  "success": true,
  "enhancedPrompt": "Enhanced: Create a login form\n\nContext: React TypeScript project",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Process Batch
```http
POST http://localhost:3001/process-batch
Content-Type: application/json

{
  "prompts": [
    {"id": "1", "text": "Create component", "order": 0},
    {"id": "2", "text": "Add styling", "order": 1}
  ],
  "targetUrl": "http://localhost:3000",
  "settings": {}
}
```

### Local Automation
```http
POST http://localhost:3001/local-automation
Content-Type: application/json

{
  "targetPath": "/cursor",
  "prompts": [
    {"id": "1", "text": "Create a new React component", "order": 0}
  ]
}
```

## Deployment

### Windows
- Builds to `.exe` installer using NSIS
- Requires code signing for distribution
- Supports both 32-bit and 64-bit

### macOS  
- Builds to `.dmg` installer
- Requires Apple Developer account for notarization
- Universal binary support (Intel + Apple Silicon)

### Linux
- Builds to AppImage format
- Works on most Linux distributions
- No installation required

## Troubleshooting

### Port 3001 Already in Use
If port 3001 is occupied, change `LOCAL_PORT` in `main.js`

### Connection Issues
- Check firewall settings
- Ensure no other AutoPromptr instances are running
- Verify antivirus is not blocking the app

### Build Issues
- Ensure Node.js 18+ is installed
- Clear node_modules and reinstall dependencies
- Check platform-specific build requirements

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run in development mode:
   ```bash
   npm run dev
   ```

3. The app will open with DevTools enabled

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on all target platforms
5. Submit a pull request

## License

MIT License - see LICENSE file for details