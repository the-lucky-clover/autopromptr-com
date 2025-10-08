import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { pathname } = new URL(req.url);
    const method = req.method;

    // Route: POST /batch-orchestrator/create
    if (pathname.endsWith('/create') && method === 'POST') {
      const { name, description, prompts, platform, settings } = await req.json();

      if (!name || !prompts || prompts.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Name and prompts are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create batch in database
      const { data: batch, error: batchError } = await supabase
        .from('batches')
        .insert({
          name,
          description: description || '',
          platform: platform || 'web',
          settings: settings || {},
          status: 'pending',
          created_by: user.id,
        })
        .select()
        .single();

      if (batchError) {
        throw batchError;
      }

      // Create prompts
      const promptsToInsert = prompts.map((p: any, index: number) => ({
        batch_id: batch.id,
        prompt_text: typeof p === 'string' ? p : p.text,
        order_index: index,
        status: 'pending',
      }));

      const { error: promptsError } = await supabase
        .from('prompts')
        .insert(promptsToInsert);

      if (promptsError) {
        throw promptsError;
      }

      return new Response(
        JSON.stringify({
          job_id: batch.id,
          status: 'created',
          message: `Batch "${name}" created successfully`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: POST /batch-orchestrator/run/:batchId
    if (pathname.includes('/run/') && method === 'POST') {
      const batchId = pathname.split('/run/')[1];

      // Update batch status to processing
      const { error: updateError } = await supabase
        .from('batches')
        .update({
          status: 'processing',
          started_at: new Date().toISOString(),
        })
        .eq('id', batchId)
        .eq('created_by', user.id);

      if (updateError) {
        throw updateError;
      }

      // Invoke gemini-processor for each prompt
      const { data: prompts } = await supabase
        .from('prompts')
        .select('*')
        .eq('batch_id', batchId)
        .order('order_index');

      if (prompts && prompts.length > 0) {
        // Process prompts asynchronously
        Promise.all(
          prompts.map(async (prompt) => {
            try {
              await supabase.functions.invoke('gemini-processor', {
                body: {
                  prompt_id: prompt.id,
                  prompt_text: prompt.prompt_text,
                  batch_id: batchId,
                },
              });
            } catch (error) {
              console.error(`Failed to process prompt ${prompt.id}:`, error);
            }
          })
        );
      }

      return new Response(
        JSON.stringify({
          message: `Batch ${batchId} execution started`,
          job_id: batchId,
          status: 'running',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: POST /batch-orchestrator/stop/:batchId
    if (pathname.includes('/stop/') && method === 'POST') {
      const batchId = pathname.split('/stop/')[1];

      const { error: updateError } = await supabase
        .from('batches')
        .update({
          status: 'stopped',
          stopped_at: new Date().toISOString(),
        })
        .eq('id', batchId)
        .eq('created_by', user.id);

      if (updateError) {
        throw updateError;
      }

      return new Response(
        JSON.stringify({
          status: 'stopped',
          job_id: batchId,
          message: 'Batch stopped successfully',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: GET /batch-orchestrator/status/:batchId
    if (pathname.includes('/status/') && method === 'GET') {
      const batchId = pathname.split('/status/')[1];

      const { data: batch, error: batchError } = await supabase
        .from('batches')
        .select('*')
        .eq('id', batchId)
        .eq('created_by', user.id)
        .single();

      if (batchError) {
        throw batchError;
      }

      const { data: prompts } = await supabase
        .from('prompts')
        .select('*')
        .eq('batch_id', batchId)
        .order('order_index');

      const totalPrompts = prompts?.length || 0;
      const completedPrompts = prompts?.filter(p => p.status === 'completed').length || 0;
      const failedPrompts = prompts?.filter(p => p.status === 'failed').length || 0;
      const processingPrompts = prompts?.filter(p => p.status === 'processing').length || 0;

      return new Response(
        JSON.stringify({
          job: {
            id: batch.id,
            name: batch.name,
            description: batch.description,
            status: batch.status,
            platform: batch.platform,
            created_at: batch.created_at,
            started_at: batch.started_at,
            completed_at: batch.completed_at,
            stopped_at: batch.stopped_at,
          },
          progress: {
            total: totalPrompts,
            completed: completedPrompts,
            failed: failedPrompts,
            processing: processingPrompts,
            pending: totalPrompts - completedPrompts - failedPrompts - processingPrompts,
            percentage: totalPrompts > 0 ? (completedPrompts / totalPrompts) * 100 : 0,
          },
          tasks: prompts?.map(p => ({
            id: p.id,
            prompt: p.prompt_text,
            status: p.status,
            result: p.result,
            error: p.error_message,
            created_at: p.created_at,
            completed_at: p.processed_at,
          })),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: GET /batch-orchestrator/list
    if (pathname.endsWith('/list') && method === 'GET') {
      const { data: activeBatches } = await supabase
        .from('batches')
        .select('*, prompts(count)')
        .eq('created_by', user.id)
        .in('status', ['pending', 'processing'])
        .order('created_at', { ascending: false });

      const { data: historyBatches } = await supabase
        .from('batches')
        .select('*, prompts(count)')
        .eq('created_by', user.id)
        .in('status', ['completed', 'failed', 'stopped'])
        .order('created_at', { ascending: false })
        .limit(10);

      return new Response(
        JSON.stringify({
          active_jobs: activeBatches || [],
          job_history: historyBatches || [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Batch orchestrator error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
