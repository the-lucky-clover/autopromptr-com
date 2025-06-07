
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SyslogMessage {
  timestamp?: string;
  severity?: number;
  facility?: number;
  hostname?: string;
  app_name?: string;
  proc_id?: string;
  msg_id?: string;
  message: string;
  structured_data?: any;
  raw_message?: string;
  batch_id?: string;
}

// Parse RFC 5424 syslog format
function parseSyslogMessage(rawMessage: string): SyslogMessage {
  console.log('Parsing syslog message:', rawMessage);
  
  // Basic RFC 5424 format: <priority>version timestamp hostname app-name procid msgid structured-data msg
  const rfc5424Regex = /^<(\d+)>(\d+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S*)\s*(.*)$/;
  const match = rawMessage.match(rfc5424Regex);
  
  if (match) {
    const [, priority, version, timestamp, hostname, appName, procId, msgId, structuredData, message] = match;
    const priorityNum = parseInt(priority);
    const facility = Math.floor(priorityNum / 8);
    const severity = priorityNum % 8;
    
    return {
      timestamp,
      severity,
      facility,
      hostname: hostname !== '-' ? hostname : undefined,
      app_name: appName !== '-' ? appName : undefined,
      proc_id: procId !== '-' ? procId : undefined,
      msg_id: msgId !== '-' ? msgId : undefined,
      message: message || rawMessage,
      structured_data: structuredData !== '-' ? { data: structuredData } : undefined,
      raw_message: rawMessage
    };
  }
  
  // Fallback: treat entire message as content
  return {
    message: rawMessage,
    raw_message: rawMessage
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let syslogData: SyslogMessage;

    if (req.method === 'POST') {
      const contentType = req.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        // Handle JSON payload (for testing or structured data)
        syslogData = await req.json();
      } else {
        // Handle raw syslog text
        const rawMessage = await req.text();
        syslogData = parseSyslogMessage(rawMessage);
      }

      console.log('Processed syslog data:', syslogData);

      // Extract batch_id from message content if present
      const batchIdMatch = syslogData.message.match(/batch[_-]?id[:\s]+([a-f0-9-]{36})/i);
      if (batchIdMatch) {
        syslogData.batch_id = batchIdMatch[1];
      }

      // Insert into database
      const { data, error } = await supabase
        .from('render_syslog')
        .insert({
          batch_id: syslogData.batch_id || null,
          timestamp: syslogData.timestamp ? new Date(syslogData.timestamp).toISOString() : new Date().toISOString(),
          severity: syslogData.severity || 6,
          facility: syslogData.facility || 16,
          hostname: syslogData.hostname,
          app_name: syslogData.app_name,
          proc_id: syslogData.proc_id,
          msg_id: syslogData.msg_id,
          message: syslogData.message,
          structured_data: syslogData.structured_data,
          raw_message: syslogData.raw_message
        });

      if (error) {
        console.error('Database insert error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to store syslog message' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log('Successfully stored syslog message:', data);

      return new Response(
        JSON.stringify({ success: true, id: data?.[0]?.id }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Syslog receiver error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
