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

interface HealthCheck {
  backend: string;
  url: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  timestamp: string;
  error?: string;
}

async function performHealthCheck(name: string, url: string): Promise<HealthCheck> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (response.ok) {
      status = responseTime < 3000 ? 'healthy' : 'degraded';
    } else {
      status = 'unhealthy';
    }
    
    return {
      backend: name,
      url,
      status,
      responseTime,
      timestamp
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      backend: name,
      url,
      status: 'unhealthy',
      responseTime,
      timestamp,
      error: error.message
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Health monitor - checking all backends');
    
    // Check all backends in parallel
    const [pythonHealth, nodejsHealth] = await Promise.all([
      performHealthCheck('python', BACKENDS.python),
      performHealthCheck('nodejs', BACKENDS.nodejs)
    ]);
    
    const healthyBackends = [pythonHealth, nodejsHealth].filter(h => h.status === 'healthy');
    const degradedBackends = [pythonHealth, nodejsHealth].filter(h => h.status === 'degraded');
    const unhealthyBackends = [pythonHealth, nodejsHealth].filter(h => h.status === 'unhealthy');
    
    const overallStatus = 
      healthyBackends.length >= 1 ? 'healthy' :
      degradedBackends.length >= 1 ? 'degraded' :
      'unhealthy';
    
    const result = {
      overall: overallStatus,
      backends: {
        python: pythonHealth,
        nodejs: nodejsHealth
      },
      summary: {
        healthy: healthyBackends.length,
        degraded: degradedBackends.length,
        unhealthy: unhealthyBackends.length,
        total: 2
      },
      recommendations: [] as string[]
    };
    
    // Add recommendations
    if (unhealthyBackends.length > 0) {
      result.recommendations.push(`${unhealthyBackends.length} backend(s) are down`);
    }
    if (degradedBackends.length > 0) {
      result.recommendations.push(`${degradedBackends.length} backend(s) experiencing slow response times`);
    }
    if (healthyBackends.length === 0) {
      result.recommendations.push('CRITICAL: All backends are unavailable');
    }
    
    console.log('Health check complete:', result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Health monitor error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      overall: 'unhealthy'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
