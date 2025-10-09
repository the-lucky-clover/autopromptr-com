import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BACKEND_URL = Deno.env.get("BACKEND_URL");
const MAX_PROMPTS_PER_BATCH = 100;
const MAX_PROMPT_LENGTH = 5000;
const ALLOWED_PLATFORMS = ["lovable", "v0", "cursor", "windsurf", "chatgpt", "claude", "web"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // CRITICAL: Verify JWT authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('Missing authorization header');
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.warn('Authentication failed:', authError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('User authenticated:', user.id);

    if (!BACKEND_URL) {
      console.error("BACKEND_URL not configured");
      return new Response(JSON.stringify({ error: "Backend configuration missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!BACKEND_URL.startsWith("https://")) {
      console.error("BACKEND_URL must use HTTPS");
      return new Response(JSON.stringify({ error: "Invalid backend configuration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { batch, platform = "web", options = {} } = await req.json();

    if (!batch || !Array.isArray(batch.prompts) || batch.prompts.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid batch: missing prompts" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate batch size
    if (batch.prompts.length > MAX_PROMPTS_PER_BATCH) {
      return new Response(JSON.stringify({ 
        error: `Batch size exceeds maximum of ${MAX_PROMPTS_PER_BATCH} prompts` 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate platform
    if (!ALLOWED_PLATFORMS.includes(platform)) {
      return new Response(JSON.stringify({ error: "Invalid platform specified" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate each prompt
    for (const prompt of batch.prompts) {
      if (!prompt.prompt_text || typeof prompt.prompt_text !== "string") {
        return new Response(JSON.stringify({ error: "Invalid prompt text" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (prompt.prompt_text.length > MAX_PROMPT_LENGTH) {
        return new Response(JSON.stringify({ 
          error: `Prompt text must be less than ${MAX_PROMPT_LENGTH} characters` 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Sanitize prompt text
      prompt.prompt_text = prompt.prompt_text.trim();
    }

    // Validate target URL if present
    if (batch.settings?.targetUrlOverride) {
      try {
        const url = new URL(batch.settings.targetUrlOverride);
        if (!["http:", "https:"].includes(url.protocol)) {
          return new Response(JSON.stringify({ error: "Target URL must use HTTP or HTTPS" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch {
        return new Response(JSON.stringify({ error: "Invalid target URL format" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // CRITICAL: Verify batch ownership
    if (batch.id) {
      const { data: batchData, error: batchError } = await supabase
        .from('batches')
        .select('created_by')
        .eq('id', batch.id)
        .single();

      if (batchError || !batchData) {
        console.error('Failed to fetch batch:', batchError?.message);
        return new Response(JSON.stringify({ error: 'Batch not found' }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (batchData.created_by !== user.id) {
        console.warn('Batch ownership verification failed');
        return new Response(JSON.stringify({ error: 'Forbidden: batch not owned by user' }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Log telemetry for rate limiting
      try {
        await supabase.from('telemetry_events').insert({
          user_id: user.id,
          event_type: 'prompt_dispatch_called',
          batch_id: batch.id,
          platform,
          metadata: { options }
        });
      } catch (telemetryError) {
        console.error('Failed to log telemetry:', telemetryError);
      }
    }

    const resp = await fetch(`${BACKEND_URL}/api/run-batch`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-User-ID": user.id,
        "X-Batch-ID": batch.id || ''
      },
      body: JSON.stringify({ batch, platform, options }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("prompt-dispatch backend error:", resp.status, text);
      return new Response(JSON.stringify({ error: "Backend dispatch failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(resp.body, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("prompt-dispatch error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});