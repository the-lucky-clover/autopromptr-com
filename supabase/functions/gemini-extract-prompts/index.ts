import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze the following text and extract individual prompts. Look for patterns like "Prompt 1:", "Prompt 2:", etc., or numbered lists, or distinct instruction blocks. Extract each prompt as a separate item. If no clear prompt markers exist, intelligently split the text into logical prompt segments based on context and meaning.

Text to analyze:
${text}

Return the result as a JSON array of strings, where each string is a complete prompt. Only return the JSON array, no other text.`
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 0.8,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('No response generated from Gemini');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Try to parse as JSON
    let extractedPrompts;
    try {
      // Clean the response in case it has markdown formatting
      const cleanedText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
      extractedPrompts = JSON.parse(cleanedText);
    } catch (parseError) {
      // If JSON parsing fails, try to extract prompts manually
      const lines = generatedText.split('\n').filter(line => line.trim().length > 0);
      extractedPrompts = lines.map(line => line.replace(/^[\d\-\*\+\.\)]\s*/, '').trim());
    }

    // Ensure we return an array
    if (!Array.isArray(extractedPrompts)) {
      extractedPrompts = [generatedText];
    }

    // Filter out empty prompts and limit to reasonable number
    const filteredPrompts = extractedPrompts
      .filter(prompt => prompt && prompt.trim().length > 10)
      .slice(0, 100);

    return new Response(JSON.stringify({ 
      success: true, 
      prompts: filteredPrompts 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gemini-extract-prompts function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});