import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlatformInfo {
  platform: string;
  confidence: number;
  chat_selectors: string[];
  submit_methods: string[];
  metadata?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const platformInfo: PlatformInfo = detectPlatform(url);

    return new Response(
      JSON.stringify(platformInfo),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Platform detection error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function detectPlatform(url: string): PlatformInfo {
  const urlLower = url.toLowerCase();
  const urlObj = new URL(url);
  const hostname = urlObj.hostname.toLowerCase();
  const pathname = urlObj.pathname.toLowerCase();

  // ChatGPT / OpenAI
  if (hostname.includes('openai.com') || hostname.includes('chatgpt.com')) {
    return {
      platform: 'chatgpt',
      confidence: 0.95,
      chat_selectors: [
        '#prompt-textarea',
        'textarea[data-id]',
        '[data-testid="textbox"]',
        'textarea[placeholder*="Message"]',
      ],
      submit_methods: ['Enter', 'button[data-testid="send-button"]'],
      metadata: {
        type: 'ai-chat',
        provider: 'openai',
        supports_streaming: true,
      },
    };
  }

  // Claude / Anthropic
  if (hostname.includes('anthropic.com') || hostname.includes('claude.ai')) {
    return {
      platform: 'claude',
      confidence: 0.95,
      chat_selectors: [
        'div[contenteditable="true"]',
        'textarea[placeholder*="Talk"]',
        'textarea',
      ],
      submit_methods: ['Enter', 'button[type="submit"]', 'button[aria-label*="Send"]'],
      metadata: {
        type: 'ai-chat',
        provider: 'anthropic',
        supports_streaming: true,
      },
    };
  }

  // Lovable
  if (hostname.includes('lovable.dev') || hostname.includes('lovable.app')) {
    return {
      platform: 'lovable',
      confidence: 0.95,
      chat_selectors: [
        'textarea[placeholder*="Message"]',
        'textarea[placeholder*="Chat"]',
        '.chat-input textarea',
      ],
      submit_methods: ['Enter', '.send-button', 'button[type="submit"]'],
      metadata: {
        type: 'development-platform',
        provider: 'lovable',
        supports_streaming: true,
      },
    };
  }

  // v0.dev (Vercel)
  if (hostname.includes('v0.dev')) {
    return {
      platform: 'v0',
      confidence: 0.95,
      chat_selectors: [
        'textarea[placeholder*="Describe"]',
        'textarea[placeholder*="message"]',
        'textarea',
      ],
      submit_methods: ['Enter', 'button[type="submit"]'],
      metadata: {
        type: 'development-platform',
        provider: 'vercel',
        supports_streaming: true,
      },
    };
  }

  // Cursor
  if (hostname.includes('cursor.sh') || pathname.includes('cursor')) {
    return {
      platform: 'cursor',
      confidence: 0.90,
      chat_selectors: [
        'textarea[placeholder*="Ask"]',
        'textarea',
        '.editor-input',
      ],
      submit_methods: ['Enter', 'button[aria-label*="Submit"]'],
      metadata: {
        type: 'ide',
        provider: 'cursor',
        supports_streaming: true,
      },
    };
  }

  // Windsurf
  if (hostname.includes('windsurf') || urlLower.includes('windsurf')) {
    return {
      platform: 'windsurf',
      confidence: 0.85,
      chat_selectors: [
        'textarea',
        'input[type="text"]',
        '.chat-input',
      ],
      submit_methods: ['Enter', 'button[type="submit"]'],
      metadata: {
        type: 'ide',
        provider: 'windsurf',
      },
    };
  }

  // Google Gemini
  if (hostname.includes('gemini.google.com') || hostname.includes('bard.google.com')) {
    return {
      platform: 'gemini',
      confidence: 0.95,
      chat_selectors: [
        'textarea[placeholder*="Enter"]',
        '.ql-editor',
        'textarea',
      ],
      submit_methods: ['Enter', 'button[aria-label*="Send"]'],
      metadata: {
        type: 'ai-chat',
        provider: 'google',
        supports_streaming: true,
      },
    };
  }

  // Perplexity
  if (hostname.includes('perplexity.ai')) {
    return {
      platform: 'perplexity',
      confidence: 0.95,
      chat_selectors: [
        'textarea[placeholder*="Ask"]',
        'textarea',
      ],
      submit_methods: ['Enter', 'button[type="submit"]'],
      metadata: {
        type: 'ai-search',
        provider: 'perplexity',
        supports_streaming: true,
      },
    };
  }

  // You.com
  if (hostname.includes('you.com')) {
    return {
      platform: 'you',
      confidence: 0.90,
      chat_selectors: [
        'textarea[placeholder*="Ask"]',
        'input[type="search"]',
        'textarea',
      ],
      submit_methods: ['Enter', 'button[type="submit"]'],
      metadata: {
        type: 'ai-search',
        provider: 'you',
      },
    };
  }

  // Generic AI chat interface
  if (
    urlLower.includes('chat') ||
    urlLower.includes('ai') ||
    urlLower.includes('assistant')
  ) {
    return {
      platform: 'generic-chat',
      confidence: 0.60,
      chat_selectors: [
        'textarea[placeholder*="message"]',
        'textarea[placeholder*="Message"]',
        'textarea',
        'input[type="text"]',
        'div[contenteditable="true"]',
      ],
      submit_methods: ['Enter', 'button[type="submit"]', 'button:has-text("Send")'],
      metadata: {
        type: 'generic-chat',
        provider: 'unknown',
      },
    };
  }

  // Unknown platform
  return {
    platform: 'unknown',
    confidence: 0.30,
    chat_selectors: [
      'textarea',
      'input[type="text"]',
      'div[contenteditable="true"]',
    ],
    submit_methods: ['Enter', 'button[type="submit"]'],
    metadata: {
      type: 'unknown',
      provider: 'unknown',
      note: 'Platform not recognized. Using generic selectors.',
    },
  };
}
