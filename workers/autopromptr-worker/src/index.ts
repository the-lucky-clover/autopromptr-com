import { BatchQueue } from './durable-objects/BatchQueue';

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  AUTOPROMPTR_DB: D1Database;
  AUTOPROMPTR_KV: KVNamespace;
  AUTOPROMPTR_STORAGE: R2Bucket;
  BATCH_QUEUE: DurableObjectNamespace;
  BROWSER?: Fetcher; // Cloudflare Browser Rendering API
}

export { BatchQueue };

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Health check
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          environment: 'cloudflare-workers-durable-objects',
          services: {
            d1: !!env.AUTOPROMPTR_DB,
            kv: !!env.AUTOPROMPTR_KV,
            r2: !!env.AUTOPROMPTR_STORAGE,
            durableObjects: !!env.BATCH_QUEUE
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Run batch - routes to Durable Object
      if (url.pathname === '/api/run-batch' && request.method === 'POST') {
        const body = await request.json() as any;
        const { batch, platform } = body;
        
        // Get Durable Object instance for this batch
        const id = env.BATCH_QUEUE.idFromName(batch.id);
        const stub = env.BATCH_QUEUE.get(id);
        
        // Forward request to Durable Object
        const doRequest = new Request('http://do/queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            batchId: batch.id,
            prompts: batch.prompts || [],
            targetUrl: batch.targetUrl,
            platform
          })
        });
        
        const doResponse = await stub.fetch(doRequest);
        const result = await doResponse.json();
        
        // Save to D1 for persistence
        await env.AUTOPROMPTR_DB
          .prepare('INSERT OR REPLACE INTO batches (id, status, created_at) VALUES (?, ?, ?)')
          .bind(batch.id, 'processing', new Date().toISOString())
          .run();
        
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get batch status
      if (url.pathname.startsWith('/api/batch/') && url.pathname.endsWith('/status')) {
        const batchId = url.pathname.split('/')[3];
        
        const id = env.BATCH_QUEUE.idFromName(batchId);
        const stub = env.BATCH_QUEUE.get(id);
        
        const doRequest = new Request(`http://do/status/${batchId}`, {
          method: 'GET'
        });
        
        const doResponse = await stub.fetch(doRequest);
        return new Response(await doResponse.text(), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Stop batch
      if (url.pathname.startsWith('/api/batch/') && url.pathname.endsWith('/stop') && request.method === 'POST') {
        const batchId = url.pathname.split('/')[3];
        
        const id = env.BATCH_QUEUE.idFromName(batchId);
        const stub = env.BATCH_QUEUE.get(id);
        
        const doRequest = new Request('http://do/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ batchId })
        });
        
        const doResponse = await stub.fetch(doRequest);
        return new Response(await doResponse.text(), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get supported platforms
      if (url.pathname === '/api/platforms') {
        const platforms = [
          { id: 'lovable', name: 'Lovable.dev', type: 'web', supported: true },
          { id: 'v0', name: 'v0.dev', type: 'web', supported: true },
          { id: 'chatgpt', name: 'ChatGPT', type: 'web', supported: true },
          { id: 'claude', name: 'Claude.ai', type: 'web', supported: true },
          { id: 'cursor', name: 'Cursor', type: 'local', supported: false },
          { id: 'windsurf', name: 'Windsurf', type: 'local', supported: false }
        ];

        return new Response(JSON.stringify(platforms), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // List all batches from D1
      if (url.pathname === '/api/batches' && request.method === 'GET') {
        const { results } = await env.AUTOPROMPTR_DB
          .prepare('SELECT * FROM batches ORDER BY created_at DESC LIMIT 50')
          .all();

        return new Response(JSON.stringify(results), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders 
      });

    } catch (error) {
      console.error('Cloudflare Worker error:', error);
      
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },
};
