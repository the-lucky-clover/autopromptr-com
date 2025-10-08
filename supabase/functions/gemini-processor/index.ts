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
    const { prompt_id, prompt_text, batch_id, context } = await req.json();

    if (!prompt_text) {
      return new Response(
        JSON.stringify({ error: 'Prompt text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update prompt status to processing
    if (prompt_id) {
      await supabase
        .from('prompts')
        .update({
          status: 'processing',
          processing_started_at: new Date().toISOString(),
        })
        .eq('id', prompt_id);
    }

    // Enhance prompt with context if provided
    let enhancedPrompt = prompt_text;
    if (context) {
      enhancedPrompt = `
Context: ${JSON.stringify(context, null, 2)}

Task: ${prompt_text}

Please provide a clear, actionable response that considers the given context.
`;
    }

    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: enhancedPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Update prompt with result
    if (prompt_id) {
      await supabase
        .from('prompts')
        .update({
          status: 'completed',
          result: generatedText,
          processed_at: new Date().toISOString(),
        })
        .eq('id', prompt_id);

      // Log automation event
      await supabase
        .from('automation_logs')
        .insert({
          batch_id,
          prompt_text,
          response_text: generatedText,
          ai_assistant_type: 'gemini',
          success_status: 'completed',
          level: 'info',
          message: 'Prompt processed successfully',
          metadata: {
            model: 'gemini-1.5-flash',
            prompt_tokens: enhancedPrompt.split(' ').length,
            completion_tokens: generatedText.split(' ').length,
          },
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        response: generatedText,
        usage: {
          prompt_tokens: enhancedPrompt.split(' ').length,
          completion_tokens: generatedText.split(' ').length,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Gemini processor error:', error);
    
    // Update prompt status to failed if prompt_id provided
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseKey) {
      try {
        const body = await req.json();
        const { prompt_id, batch_id, prompt_text } = body;
        
        if (prompt_id) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          await supabase
            .from('prompts')
            .update({
              status: 'failed',
              error_message: error.message,
              processed_at: new Date().toISOString(),
            })
            .eq('id', prompt_id);

          // Log error
          await supabase
            .from('automation_logs')
            .insert({
              batch_id,
              prompt_text,
              ai_assistant_type: 'gemini',
              success_status: 'failed',
              level: 'error',
              message: `Gemini processing failed: ${error.message}`,
            });
        }
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
