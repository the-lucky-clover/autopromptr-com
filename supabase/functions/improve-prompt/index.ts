import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_API_KEY = 'AIzaSyB2ZEWgS5tUQS1e0gdSazmP2SjWZ78uk9A';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, context } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the system message for prompt improvement
    const systemMessage = `You are an AI prompt optimization expert. Your task is to improve user prompts to make them more effective, clear, and specific for AI assistants.

Guidelines for improvement:
1. Make prompts more specific and actionable
2. Add context and constraints where helpful
3. Structure the prompt for clarity
4. Remove ambiguity
5. Ensure the prompt will produce consistent, high-quality results

${context ? `Additional context about the project: ${context}` : ''}

Please improve the following prompt and return ONLY the improved version without any explanations or additional text:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemMessage}\n\nOriginal prompt: "${prompt}"`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google AI API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to improve prompt', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      return new Response(
        JSON.stringify({ error: 'Invalid response from Google AI API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const improvedPrompt = data.candidates[0].content.parts[0].text.trim();

    return new Response(
      JSON.stringify({ improvedPrompt, originalPrompt: prompt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in improve-prompt function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});