# AutoPromptr Companion Build Instructions

This repository includes a standalone Electron companion app that enables local prompt injection from the web app.

Prerequisites:
- Node.js 18+
- macOS: Xcode Command Line Tools
- Windows: Visual Studio Build Tools (C++), PowerShell
- Linux: build-essential, libX11-dev, libxkbfile-dev

Install dependencies:

```
cd electron
npm install
```

Run in development:
```
npm run start
```

Build installers:
```
# macOS (.dmg)
npm run build:mac

# Windows (.exe / NSIS)
npm run build:win

# Linux (.AppImage)
npm run build:linux

# All platforms (from their respective OS)
npm run build:all
```

Notes:
- Code signing is optional but recommended for production distribution.
- The app exposes a local HTTP service on http://localhost:3001 for the web client to send prompts.
- Ensure the companion app is running to enable local prompt injection.
