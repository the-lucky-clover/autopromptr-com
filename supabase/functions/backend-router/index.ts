import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BACKENDS = {
  python: 'https://autopromptr-backend-python.onrender.com',
  nodejs: 'https://autopromptr-backend-nodejs.onrender.com'
};

interface BackendHealth {
  backend: string;
  healthy: boolean;
  responseTime: number;
  lastChecked: number;
}

// Simple in-memory health cache (refreshed every 30 seconds)
const healthCache = new Map<string, BackendHealth>();
const HEALTH_CACHE_TTL = 30000; // 30 seconds

async function checkBackendHealth(backendUrl: string): Promise<BackendHealth> {
  const cached = healthCache.get(backendUrl);
  const now = Date.now();
  
  if (cached && (now - cached.lastChecked) < HEALTH_CACHE_TTL) {
    return cached;
  }

  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${backendUrl}/health`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    const health: BackendHealth = {
      backend: backendUrl,
      healthy: response.ok && responseTime < 3000,
      responseTime,
      lastChecked: now
    };
    
    healthCache.set(backendUrl, health);
    return health;
  } catch (error) {
    const health: BackendHealth = {
      backend: backendUrl,
      healthy: false,
      responseTime: Date.now() - startTime,
      lastChecked: now
    };
    healthCache.set(backendUrl, health);
    return health;
  }
}

function selectBackend(targetUrl: string): string {
  // Route based on platform type
  if (targetUrl.includes('lovable.dev') || 
      targetUrl.includes('v0.dev') ||
      targetUrl.includes('claude.ai') ||
      targetUrl.includes('chatgpt.com')) {
    return BACKENDS.python; // Python excels at known platforms
  }
  return BACKENDS.nodejs; // Node.js excels at universal detection
}

async function routeWithFailover(endpoint: string, body: any): Promise<Response> {
  const targetUrl = body.batch?.targetUrl || body.targetUrl || '';
  const primaryBackend = selectBackend(targetUrl);
  const fallbackBackend = primaryBackend === BACKENDS.python ? BACKENDS.nodejs : BACKENDS.python;
  
  console.log('Routing request:', {
    targetUrl,
    primaryBackend,
    fallbackBackend,
    endpoint
  });
  
  // Check health of both backends
  const [primaryHealth, fallbackHealth] = await Promise.all([
    checkBackendHealth(primaryBackend),
    checkBackendHealth(fallbackBackend)
  ]);
  
  console.log('Backend health status:', {
    primary: primaryHealth,
    fallback: fallbackHealth
  });
  
  // Try primary backend first if healthy
  if (primaryHealth.healthy) {
    try {
      const response = await fetch(`${primaryBackend}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        console.log('Primary backend succeeded');
        return response;
      }
      
      console.log('Primary backend returned error, trying fallback');
    } catch (error) {
      console.error('Primary backend failed:', error);
    }
  }
  
  // Fallback to secondary backend
  if (fallbackHealth.healthy) {
    console.log('Using fallback backend');
    const response = await fetch(`${fallbackBackend}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    return response;
  }
  
  // Both backends unhealthy - return error
  throw new Error('All backends are currently unavailable');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, batch, batchId } = await req.json();
    
    console.log('Backend router received request:', { action, batchId });
    
    switch (action) {
      case 'process':
        const response = await routeWithFailover('/api/automation/process-batch', { batch });
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      case 'stop':
        const stopResponse = await routeWithFailover('/api/automation/stop-batch', { batchId });
        const stopData = await stopResponse.json();
        return new Response(JSON.stringify(stopData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      case 'status':
        const statusResponse = await routeWithFailover('/api/automation/batch-status', { batchId });
        const statusData = await statusResponse.json();
        return new Response(JSON.stringify(statusData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      case 'health':
        const [pythonHealth, nodejsHealth] = await Promise.all([
          checkBackendHealth(BACKENDS.python),
          checkBackendHealth(BACKENDS.nodejs)
        ]);
        
        return new Response(JSON.stringify({
          backends: {
            python: pythonHealth,
            nodejs: nodejsHealth
          },
          overall: pythonHealth.healthy || nodejsHealth.healthy ? 'healthy' : 'unhealthy'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
  } catch (error) {
    console.error('Backend router error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to route request to backend services'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
