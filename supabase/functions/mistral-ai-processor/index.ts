import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MistralRequest {
  type: 'text-inference' | 'web-search' | 'web-scrape' | 'ai-processing';
  prompt: string;
  url?: string;
  searchQuery?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface WebScrapeResult {
  title: string;
  content: string;
  url: string;
  metadata: {
    wordCount: number;
    extractedAt: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!mistralApiKey) {
    console.error('MISTRAL_API_KEY not found in environment variables');
    return new Response(JSON.stringify({ error: 'Mistral API key not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const requestData: MistralRequest = await req.json();
    console.log('Processing request:', { type: requestData.type, prompt: requestData.prompt?.substring(0, 100) });

    let result;

    switch (requestData.type) {
      case 'text-inference':
        result = await processTextInference(requestData);
        break;
      case 'web-search':
        result = await processWebSearch(requestData);
        break;
      case 'web-scrape':
        result = await processWebScrape(requestData);
        break;
      case 'ai-processing':
        result = await processAITask(requestData);
        break;
      default:
        throw new Error(`Unsupported request type: ${requestData.type}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in mistral-ai-processor:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      type: 'processing_error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processTextInference(request: MistralRequest) {
  console.log('🤖 Processing text inference with Mistral AI');
  
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${mistralApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: request.model || 'mistral-large-latest',
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful AI assistant specialized in text analysis and inference. Provide clear, accurate, and helpful responses.'
        },
        { role: 'user', content: request.prompt }
      ],
      max_tokens: request.maxTokens || 1000,
      temperature: request.temperature || 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Mistral API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  
  return {
    type: 'text-inference',
    result: data.choices[0].message.content,
    model: request.model || 'mistral-large-latest',
    usage: data.usage,
    processedAt: new Date().toISOString()
  };
}

async function processWebSearch(request: MistralRequest) {
  console.log('🔍 Processing web search request');
  
  // First, perform web search (using a simple search approach)
  const searchResults = await performWebSearch(request.searchQuery || request.prompt);
  
  // Then use Mistral to analyze and summarize the search results
  const analysisPrompt = `
    Analyze these web search results and provide a comprehensive summary:
    
    Search Query: ${request.searchQuery || request.prompt}
    
    Search Results:
    ${searchResults.map((result, index) => `
    ${index + 1}. Title: ${result.title}
       URL: ${result.url}
       Snippet: ${result.snippet}
    `).join('\n')}
    
    Please provide:
    1. A comprehensive summary of the key information found
    2. Analysis of the most relevant and credible sources
    3. Key insights and trends identified
    4. Any gaps or limitations in the available information
  `;

  const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${mistralApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: request.model || 'mistral-large-latest',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert web researcher and analyst. Provide thorough analysis of search results.'
        },
        { role: 'user', content: analysisPrompt }
      ],
      max_tokens: request.maxTokens || 1500,
      temperature: request.temperature || 0.3,
    }),
  });

  if (!mistralResponse.ok) {
    const errorData = await mistralResponse.text();
    throw new Error(`Mistral API error: ${mistralResponse.status} - ${errorData}`);
  }

  const mistralData = await mistralResponse.json();

  return {
    type: 'web-search',
    query: request.searchQuery || request.prompt,
    searchResults,
    analysis: mistralData.choices[0].message.content,
    model: request.model || 'mistral-large-latest',
    usage: mistralData.usage,
    processedAt: new Date().toISOString()
  };
}

async function processWebScrape(request: MistralRequest) {
  console.log('🕷️ Processing web scraping request');
  
  if (!request.url) {
    throw new Error('URL is required for web scraping');
  }

  // Scrape the webpage
  const scrapeResult = await scrapeWebpage(request.url);
  
  // Use Mistral to analyze and process the scraped content
  const analysisPrompt = `
    Analyze this webpage content and extract key information based on this request: "${request.prompt}"
    
    URL: ${request.url}
    Title: ${scrapeResult.title}
    Content: ${scrapeResult.content.substring(0, 8000)}...
    
    Please provide:
    1. Key information relevant to the request
    2. Main topics and themes
    3. Important data points or statistics
    4. Actionable insights
    5. Summary of the most valuable content
  `;

  const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${mistralApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: request.model || 'mistral-large-latest',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert content analyst. Extract and analyze key information from web content.'
        },
        { role: 'user', content: analysisPrompt }
      ],
      max_tokens: request.maxTokens || 1500,
      temperature: request.temperature || 0.3,
    }),
  });

  if (!mistralResponse.ok) {
    const errorData = await mistralResponse.text();
    throw new Error(`Mistral API error: ${mistralResponse.status} - ${errorData}`);
  }

  const mistralData = await mistralResponse.json();

  return {
    type: 'web-scrape',
    url: request.url,
    scrapeResult,
    analysis: mistralData.choices[0].message.content,
    model: request.model || 'mistral-large-latest',
    usage: mistralData.usage,
    processedAt: new Date().toISOString()
  };
}

async function processAITask(request: MistralRequest) {
  console.log('🧠 Processing general AI task');
  
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${mistralApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: request.model || 'mistral-large-latest',
      messages: [
        { 
          role: 'system', 
          content: 'You are a powerful AI assistant capable of complex reasoning, analysis, and problem-solving. Provide detailed and accurate responses.'
        },
        { role: 'user', content: request.prompt }
      ],
      max_tokens: request.maxTokens || 2000,
      temperature: request.temperature || 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Mistral API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  
  return {
    type: 'ai-processing',
    result: data.choices[0].message.content,
    model: request.model || 'mistral-large-latest',
    usage: data.usage,
    processedAt: new Date().toISOString()
  };
}

async function performWebSearch(query: string): Promise<WebSearchResult[]> {
  // Simple web search implementation using DuckDuckGo API (no API key required)
  try {
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    const results: WebSearchResult[] = [];
    
    // Process related topics and abstract
    if (data.Abstract && data.AbstractURL) {
      results.push({
        title: data.Heading || 'Main Result',
        url: data.AbstractURL,
        snippet: data.Abstract
      });
    }
    
    // Process related topics
    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, 5)) {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(' - ')[0] || 'Related Topic',
            url: topic.FirstURL,
            snippet: topic.Text
          });
        }
      }
    }
    
    // If no results, return a placeholder
    if (results.length === 0) {
      results.push({
        title: 'Search completed',
        url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        snippet: `Search performed for: ${query}. You may need to perform a manual search for more specific results.`
      });
    }
    
    return results;
  } catch (error) {
    console.warn('Web search failed:', error);
    return [{
      title: 'Search unavailable',
      url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
      snippet: `Unable to perform automated search for: ${query}`
    }];
  }
}

async function scrapeWebpage(url: string): Promise<WebScrapeResult> {
  try {
    console.log('Scraping webpage:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MistralAI-Processor/1.0)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Simple text extraction from HTML
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'No title found';
    
    // Remove scripts, styles, and extract text content
    let content = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Limit content length
    if (content.length > 10000) {
      content = content.substring(0, 10000) + '...';
    }
    
    return {
      title,
      content,
      url,
      metadata: {
        wordCount: content.split(' ').length,
        extractedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Web scraping failed:', error);
    throw new Error(`Failed to scrape webpage: ${error.message}`);
  }
}