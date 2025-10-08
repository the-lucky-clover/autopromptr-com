import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const FAQ_KNOWLEDGE = `
AutoPromptr FAQ:

Q: What is AutoPromptr?
A: AutoPromptr is an AI prompt automation platform that enables batch processing and deployment of prompts across AI coding platforms like Lovable.dev, v0.dev, and local development environments.

Q: What platforms does AutoPromptr support?
A: We support remote platforms (Lovable.dev, v0.dev, Replit, CodeSandbox) and local platforms (Cursor, Windsurf, GitHub Copilot, bolt.diy, VS Code).

Q: How do I create a batch?
A: Navigate to the Batch Processor from your dashboard, click "Create New Batch", enter prompts (one per line), select your target platform, and click "Create Batch".

Q: How does the automation work?
A: Our system queues your prompts and sends them one-at-a-time to your selected platform using browser automation (for remote) or our Electron companion app (for local IDEs).

Q: What is the Electron companion app?
A: It's a desktop application that runs locally and enables AutoPromptr to inject prompts into local coding assistants like Cursor and Windsurf.

Q: How do I get support?
A: You can create a support ticket through this chat by saying "create support ticket" or email us at support@autopromptr.com.

Q: Is AutoPromptr open source?
A: Yes! AutoPromptr is released under the MIT License. Check our GitHub repository for the source code.

Q: What are the system requirements?
A: A modern web browser for the web app. For local automation, you'll need our Electron companion app (Windows, Mac, or Linux).
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, action } = await req.json();
    
    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    let userId: string | null = null;
    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Handle special actions
    if (action === 'logout') {
      return new Response(JSON.stringify({ 
        action: 'logout',
        message: 'Logging you out...' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'show_terms' || action === 'show_privacy') {
      return new Response(JSON.stringify({ 
        action: action,
        message: `Opening ${action === 'show_terms' ? 'Terms of Service' : 'Privacy Policy'}...` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'create_ticket') {
      const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || 'No description provided';
      
      // Log support ticket to database
      if (userId) {
        await supabase.from('automation_logs').insert({
          user_id: userId,
          level: 'info',
          message: 'Support ticket created',
          metadata: {
            type: 'support_ticket',
            description: lastUserMessage,
            timestamp: new Date().toISOString()
          }
        });
      }

      return new Response(JSON.stringify({ 
        action: 'ticket_created',
        message: `Support ticket created successfully! We'll contact you at your registered email. Reference: ${crypto.randomUUID().substring(0, 8).toUpperCase()}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Regular chat with Lovable AI
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: `You are AutoPromptr Support AI, a helpful assistant specializing in AutoPromptr's AI automation platform.

Your capabilities:
- Answer questions about AutoPromptr features and usage
- Provide troubleshooting assistance
- Help users understand batch processing and prompt automation
- Guide users through the platform

Use this FAQ knowledge base to answer questions:
${FAQ_KNOWLEDGE}

Special commands you can trigger:
- If user wants to log out, respond with "logout_requested"
- If user wants to see Terms of Service, respond with "show_terms_requested"
- If user wants to see Privacy Policy, respond with "show_privacy_requested"
- If user wants to create a support ticket, respond with "create_ticket_requested"

Keep responses concise, friendly, and helpful. Focus on AutoPromptr-specific information.`
          },
          ...messages
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'trigger_action',
              description: 'Trigger special actions like logout, showing legal documents, or creating support tickets',
              parameters: {
                type: 'object',
                properties: {
                  action: {
                    type: 'string',
                    enum: ['logout', 'show_terms', 'show_privacy', 'create_ticket'],
                    description: 'The action to trigger'
                  },
                  message: {
                    type: 'string',
                    description: 'Message to show to the user'
                  }
                },
                required: ['action', 'message'],
                additionalProperties: false
              }
            }
          }
        ]
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a moment.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI service credits depleted. Please contact support@autopromptr.com' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error('AI service error');
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message;

    // Check if AI triggered an action via tool calling
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolCall = assistantMessage.tool_calls[0];
      const args = JSON.parse(toolCall.function.arguments);
      
      return new Response(JSON.stringify({ 
        action: args.action,
        message: args.message,
        content: assistantMessage.content
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check content for action triggers
    const content = assistantMessage.content.toLowerCase();
    if (content.includes('logout_requested')) {
      return new Response(JSON.stringify({ 
        action: 'logout',
        message: 'I can help you log out. Click the logout button that will appear.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (content.includes('show_terms_requested')) {
      return new Response(JSON.stringify({ 
        action: 'show_terms',
        message: 'Opening Terms of Service...' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (content.includes('show_privacy_requested')) {
      return new Response(JSON.stringify({ 
        action: 'show_privacy',
        message: 'Opening Privacy Policy...' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (content.includes('create_ticket_requested')) {
      return new Response(JSON.stringify({ 
        action: 'create_ticket',
        message: 'I\'ll create a support ticket for you. Please describe your issue in detail.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      content: assistantMessage.content 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Support chatbot error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
