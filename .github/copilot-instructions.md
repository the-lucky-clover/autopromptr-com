# AutoPromptr AI Coding Instructions

## Project Overview

AutoPromptr is a **three-tier smart prompt injection system** for batch automation of AI coding assistants. The motto: **"If it's a fucking AI chatbot text input that turns conversational speech into code locally or remotely - we support it."**

## Architecture Tiers

1. **Tier 1: Lovable Cloud** - Supabase DB, Edge Functions, Auth (control plane)
2. **Tier 2: Automation Backend** - Flask/Python on Render/Railway with Playwright for web automation
3. **Tier 3: Local Companion** - Electron app for desktop AI tools (Cursor, Windsurf, VS Code)

## Tech Stack

- **Frontend**: Vite + React + TypeScript + shadcn/ui + Tailwind
- **State**: Supabase (PostgreSQL) + Local Storage fallback
- **Automation**: Playwright (web) + Electron (desktop)
- **Backend**: Flask + Python for browser automation

## Key Directories

- `src/pages/` - React pages (Dashboard, BatchProcessor, PromptLibrary, etc.)
- `src/components/` - Reusable UI components (shadcn/ui based)
- `src/services/` - Business logic (batchDatabase, mvpBatchRunner, flaskBackend, etc.)
- `src/types/` - TypeScript interfaces (Batch, TextPrompt, Platform)
- `apps/backend-flask/` - Python Flask automation backend
- `electron/` - Local companion app for desktop AI tools
- `supabase/` - Database schema and edge functions

## Critical Files

- `src/types/batch.ts` - Core type definitions (Batch, TextPrompt, PromptResult)
- `src/services/mvpBatchRunner.ts` - Frontend batch execution via Supabase Edge Functions
- `src/services/batchDatabase.ts` - Supabase database operations
- `apps/backend-flask/services/target_completion_detector.py` - Smart waiting logic (400+ lines)
- `apps/backend-flask/services/playwright_service.py` - Web automation engine

## Code Patterns

### Creating a Batch
```typescript
const batch: Batch = {
  id: crypto.randomUUID(),
  name: "My Batch",
  targetUrl: "https://lovable.dev",
  prompts: [{ id: "1", text: "Build a todo app", order: 0 }],
  status: 'pending',
  platform: 'lovable',
  createdAt: new Date(),
  settings: { waitForIdle: true, maxRetries: 3 }
};
```

### Running a Batch
```typescript
import { MVPBatchRunner } from '@/services/mvpBatchRunner';

const runner = new MVPBatchRunner();
const result = await runner.runBatch(batch, {
  waitForCompletion: true,
  onProgress: (progress) => console.log(progress)
});
```

### Database Operations
```typescript
import { saveBatchToDatabase } from '@/services/batchDatabase';
await saveBatchToDatabase(batch);
```

## Supabase Integration

- Auth: `supabase.auth.getUser()` for user context
- Database: Tables `batches` and `prompts` with RLS policies
- Edge Functions: `backend-router`, `batch-orchestrator`, `enhance-prompt`

## Supported Platforms

**Web (Playwright)**: lovable.dev, v0.dev, ChatGPT, Claude.ai, any AI chatbot
**Desktop (Electron)**: Cursor, Windsurf, VS Code (Continue, Cline, Kilocode)

## Smart Waiting Detection

The `TargetCompletionDetector` (Python) monitors platform-specific signals:
- Spinner/loading indicators disappearing
- "Stop generating" buttons becoming disabled
- Network idle detection
- Custom platform selectors (`.generation-complete`, etc.)

Polls every 1-2 seconds until completion or timeout (default 300s).

## Development Commands

```bash
npm run dev          # Start Vite dev server (port 8080)
npm run build        # Production build
npm run lint         # ESLint
```

## Important Conventions

- All dates stored as ISO strings in DB, converted to `Date` objects in frontend
- Batch IDs use `crypto.randomUUID()`
- Status flow: `pending` → `running` → `completed|failed|stopped`
- Error handling: Always wrap Supabase calls in try-catch
- Logging: Use `console.log` with emoji prefixes (🚀, ✅, ❌, 🔧)

## Common Gotchas

1. **Auth Required**: Most routes require `supabase.auth.getUser()` check
2. **RLS Policies**: Supabase tables have Row Level Security - always filter by `user_id`
3. **Backend URL**: Use `VITE_BACKEND_URL` env var or fetch from Supabase secrets
4. **CORS**: Flask backend must allow origin from Lovable.dev domain
5. **Playwright**: Headless mode required in production, headed for local dev

## Adding New AI Platforms

1. Add platform detection in `target_completion_detector.py`
2. Define completion selectors and wait logic
3. Test with sample prompts
4. Update `SUPPORTED_PLATFORMS` constant

## Testing

- Use `/backend-test` page for backend connectivity
- Use `/backend-health` for system monitoring
- Manual testing: Create batch → Add prompts → Run automation

## Deployment

- **Frontend**: Auto-deploy via Lovable.dev (connected to this repo)
- **Backend**: Deploy Flask app to Render/Railway/Fly.io (see `BACKEND_DEPLOYMENT.md`)
- **Electron**: Build with `npm run build:electron` (platform-specific)
