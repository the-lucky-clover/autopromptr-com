import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BACKEND_URL = "https://autopromptr-backend.onrender.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { batch, platform = "web", options = {} } = await req.json();

    if (!batch || !Array.isArray(batch.prompts) || batch.prompts.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid batch: missing prompts" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resp = await fetch(`${BACKEND_URL}/api/run-batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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