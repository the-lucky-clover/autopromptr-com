
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnhancementRequest {
  prompt: string;
  targetPlatform?: string;
  enhancementType?: 'individual' | 'batch';
  batchContext?: string[];
}

interface EnhancementResponse {
  enhancedPrompt: string;
  suggestions: string[];
  qualityScore: number;
  processingMethod: 'mistral' | 'google' | 'fallback';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, targetPlatform, enhancementType = 'individual', batchContext = [] }: EnhancementRequest = await req.json();
    
    const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY');
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    
    if (!MISTRAL_API_KEY && !GOOGLE_API_KEY) {
      throw new Error('No AI API keys configured');
    }

    let enhancedPrompt = '';
    let processingMethod: 'mistral' | 'google' | 'fallback' = 'fallback';
    let suggestions: string[] = [];

    // Try Mistral AI first (primary)
    if (MISTRAL_API_KEY) {
      try {
        console.log('🤖 Attempting Mistral AI enhancement...');
        const result = await enhanceWithMistral(prompt, targetPlatform, enhancementType, batchContext, MISTRAL_API_KEY);
        enhancedPrompt = result.enhancedPrompt;
        suggestions = result.suggestions;
        processingMethod = 'mistral';
        console.log('✅ Mistral AI enhancement successful');
      } catch (mistralError) {
        console.warn('⚠️ Mistral AI failed, trying Google fallback:', mistralError);
        
        // Fallback to Google Flash 2.5
        if (GOOGLE_API_KEY) {
          try {
            const result = await enhanceWithGoogle(prompt, targetPlatform, enhancementType, batchContext, GOOGLE_API_KEY);
            enhancedPrompt = result.enhancedPrompt;
            suggestions = result.suggestions;
            processingMethod = 'google';
            console.log('✅ Google fallback enhancement successful');
          } catch (googleError) {
            console.error('❌ Both AI services failed:', googleError);
            throw new Error('All AI enhancement services unavailable');
          }
        } else {
          throw mistralError;
        }
      }
    } else if (GOOGLE_API_KEY) {
      // Use Google if Mistral not available
      const result = await enhanceWithGoogle(prompt, targetPlatform, enhancementType, batchContext, GOOGLE_API_KEY);
      enhancedPrompt = result.enhancedPrompt;
      suggestions = result.suggestions;
      processingMethod = 'google';
    }

    // Calculate quality score
    const qualityScore = calculateQualityScore(prompt, enhancedPrompt);

    const response: EnhancementResponse = {
      enhancedPrompt: enhancedPrompt.trim(),
      suggestions,
      qualityScore,
      processingMethod
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Enhancement error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        enhancedPrompt: null,
        suggestions: ['Enhancement service temporarily unavailable'],
        qualityScore: 0,
        processingMethod: 'fallback'
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

async function enhanceWithMistral(
  prompt: string, 
  targetPlatform?: string, 
  enhancementType?: string,
  batchContext?: string[],
  apiKey?: string
) {
  const contextInfo = batchContext && batchContext.length > 0 
    ? `\n\nBatch context (other prompts in this batch): ${batchContext.slice(0, 3).join('; ')}`
    : '';

  const platformInfo = targetPlatform 
    ? `\n\nTarget platform: ${targetPlatform} - optimize for this platform's automation capabilities.`
    : '';

  const systemPrompt = `You are an AI automation prompt enhancement specialist. Your task is to improve prompts for better AI automation results.

Enhancement Guidelines:
- Make prompts more specific and actionable
- Add clear context and constraints
- Optimize for ${targetPlatform || 'web automation'} platforms
- Use precise, automation-friendly language
- Include success criteria when relevant
- Maintain the original intent while improving clarity

${enhancementType === 'batch' ? 'This is part of a batch - ensure consistency with other prompts.' : ''}
${platformInfo}${contextInfo}

Return ONLY the improved prompt without explanations.`;

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Enhance this automation prompt: "${prompt}"` }
      ],
      temperature: 0.3,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Mistral API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const enhancedPrompt = data.choices?.[0]?.message?.content || prompt;

  return {
    enhancedPrompt,
    suggestions: [
      'Enhanced with Mistral AI for automation clarity',
      'Optimized for platform-specific automation',
      'Improved actionable language and specificity'
    ]
  };
}

async function enhanceWithGoogle(
  prompt: string, 
  targetPlatform?: string, 
  enhancementType?: string,
  batchContext?: string[],
  apiKey?: string
) {
  const contextInfo = batchContext && batchContext.length > 0 
    ? `\n\nBatch context: ${batchContext.slice(0, 3).join('; ')}`
    : '';

  const platformInfo = targetPlatform 
    ? `\n\nTarget: ${targetPlatform}`
    : '';

  const enhancementPrompt = `Enhance this automation prompt for better AI processing results. Make it more specific, actionable, and automation-friendly while preserving the original intent.${platformInfo}${contextInfo}

Original prompt: "${prompt}"

Return only the enhanced prompt:`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: enhancementPrompt }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 600,
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Google API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const enhancedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text || prompt;

  return {
    enhancedPrompt,
    suggestions: [
      'Enhanced with Google Flash 2.5 for automation optimization',
      'Improved clarity and actionable instructions',
      'Platform-optimized language and structure'
    ]
  };
}

function calculateQualityScore(original: string, enhanced: string): number {
  let score = 50; // Base score
  
  // Length improvement (more detailed is often better)
  if (enhanced.length > original.length * 1.2) score += 20;
  
  // Specific automation keywords
  const automationKeywords = ['click', 'enter', 'submit', 'navigate', 'wait', 'verify', 'check'];
  const keywordMatches = automationKeywords.filter(keyword => 
    enhanced.toLowerCase().includes(keyword) && !original.toLowerCase().includes(keyword)
  ).length;
  score += keywordMatches * 5;
  
  // Structure improvements (bullet points, numbers, clear steps)
  if (enhanced.includes('1.') || enhanced.includes('•') || enhanced.includes('-')) score += 15;
  
  // Specificity indicators
  if (enhanced.includes('specific') || enhanced.includes('exactly') || enhanced.includes('precisely')) score += 10;
  
  return Math.min(Math.max(score, 0), 100);
}
