import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth } from './auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authResult = await validateAuth(req);
    if (authResult instanceof Response) {
      return authResult; // Return error response
    }
    const { user } = authResult;

    const { message, context, task_type } = await req.json();
    
    const GEMINI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    let systemPrompt = '';
    switch (task_type) {
      case 'research':
        systemPrompt = 'You are an autonomous research agent. Conduct thorough research on the given topic and provide detailed findings with sources.';
        break;
      case 'code_review':
        systemPrompt = 'You are a senior code reviewer. Analyze the provided code for bugs, security issues, performance problems, and suggest improvements.';
        break;
      case 'refactor':
        systemPrompt = 'You are a code refactoring specialist. Improve code structure, readability, and maintainability while preserving functionality.';
        break;
      case 'write_code':
        systemPrompt = 'You are an expert software developer. Write clean, efficient, and well-documented code based on the requirements.';
        break;
      default:
        systemPrompt = 'You are a helpful AI assistant with expertise in research, coding, and problem-solving.';
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nUser: ${message}${context ? `\n\nContext: ${context}` : ''}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
    
    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        task_type,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});