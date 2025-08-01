
import { AutoSubmissionService } from './autoSubmissionService';
import { BatchHandler } from './batch-handler';
import { initializeD1Database, healthCheckD1 } from './d1-setup';

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  AUTOPROMPTR_DB?: D1Database;
  AUTOPROMPTR_STORAGE?: R2Bucket;
}

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
      // Health check endpoint
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          environment: 'cloudflare-workers'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Run batch endpoint
      if (url.pathname === '/api/run-batch' && request.method === 'POST') {
        const { batch, platform, ...options } = await request.json();
        
        console.log('Cloudflare Worker processing batch:', batch.id);
        
        // Simulate batch processing
        const result = {
          batchId: batch.id,
          status: 'started',
          platform,
          timestamp: new Date().toISOString(),
          worker: 'cloudflare'
        };

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Stop batch endpoint
      if (url.pathname.startsWith('/api/batch/') && url.pathname.endsWith('/stop') && request.method === 'POST') {
        const batchId = url.pathname.split('/')[3];
        
        const result = {
          batchId,
          status: 'stopped',
          timestamp: new Date().toISOString(),
          worker: 'cloudflare'
        };

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get platforms endpoint
      if (url.pathname === '/api/platforms') {
        const platforms = [
          { id: 'lovable', name: 'Lovable.dev', type: 'web' },
          { id: 'v0', name: 'v0.dev', type: 'web' },
          { id: 'cursor', name: 'Cursor', type: 'local' },
          { id: 'windsurf', name: 'Windsurf', type: 'local' }
        ];

        return new Response(JSON.stringify(platforms), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Batch status endpoint
      if (url.pathname.startsWith('/api/batch/') && url.pathname.endsWith('/status')) {
        const batchId = url.pathname.split('/')[3];
        
        const status = {
          batchId,
          status: 'processing',
          progress: { completed: 0, total: 1, percentage: 0 },
          timestamp: new Date().toISOString(),
          worker: 'cloudflare'
        };

        return new Response(JSON.stringify(status), {
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
