import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecurityAuditRequest {
  action: 'audit_batch' | 'audit_user_activity' | 'check_vulnerabilities';
  batchId?: string;
  userId?: string;
  timeRange?: {
    start: string;
    end: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin privileges
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_super_user, role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.is_super_user || profile?.role === 'admin' || profile?.role === 'sysop';
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin privileges required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const request: SecurityAuditRequest = await req.json();

    let auditResult;

    switch (request.action) {
      case 'audit_batch':
        auditResult = await auditBatch(supabase, request.batchId!);
        break;
      
      case 'audit_user_activity':
        auditResult = await auditUserActivity(supabase, request.userId!, request.timeRange);
        break;
      
      case 'check_vulnerabilities':
        auditResult = await checkVulnerabilities(supabase);
        break;
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Log audit action
    await supabase.rpc('log_security_event', {
      event_type: 'security_audit_performed',
      event_data: {
        action: request.action,
        performed_by: user.id,
        timestamp: new Date().toISOString()
      }
    });

    return new Response(
      JSON.stringify({ success: true, data: auditResult }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Security audit error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function auditBatch(supabase: any, batchId: string) {
  console.log(`Auditing batch: ${batchId}`);
  
  // Get batch details
  const { data: batch } = await supabase
    .from('batches')
    .select('*')
    .eq('id', batchId)
    .single();

  if (!batch) {
    throw new Error('Batch not found');
  }

  // Get related prompts
  const { data: prompts } = await supabase
    .from('prompts')
    .select('*')
    .eq('batch_id', batchId);

  // Get security events for this batch
  const { data: securityEvents } = await supabase
    .from('security_events')
    .select('*')
    .contains('event_data', { batchId });

  // Analyze security risks
  const risks = [];
  
  // Check for suspicious URLs
  if (batch.settings?.targetUrlOverride) {
    const url = batch.settings.targetUrlOverride.toLowerCase();
    const suspiciousPatterns = ['localhost', '127.0.0.1', '192.168.', '10.', '172.'];
    
    if (suspiciousPatterns.some(pattern => url.includes(pattern))) {
      risks.push({
        level: 'high',
        type: 'suspicious_url',
        description: 'Batch targets potentially unsafe local/private address'
      });
    }
  }

  // Check for dangerous prompt content
  if (prompts) {
    const dangerousPatterns = [/exec/gi, /eval/gi, /system/gi, /shell/gi];
    
    prompts.forEach((prompt: any) => {
      if (dangerousPatterns.some(pattern => pattern.test(prompt.prompt_text))) {
        risks.push({
          level: 'medium',
          type: 'dangerous_prompt',
          description: `Prompt ${prompt.id} contains potentially dangerous code patterns`,
          promptId: prompt.id
        });
      }
    });
  }

  return {
    batch,
    prompts: prompts?.length || 0,
    securityEvents: securityEvents?.length || 0,
    risks,
    riskLevel: risks.length > 0 ? Math.max(...risks.map(r => r.level === 'high' ? 3 : r.level === 'medium' ? 2 : 1)) : 0
  };
}

async function auditUserActivity(supabase: any, userId: string, timeRange?: { start: string; end: string }) {
  console.log(`Auditing user activity: ${userId}`);
  
  const startDate = timeRange?.start || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const endDate = timeRange?.end || new Date().toISOString();

  // Get user's security events
  const { data: securityEvents } = await supabase
    .from('security_events')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false });

  // Get user's batches
  const { data: batches } = await supabase
    .from('batches')
    .select('id, name, platform, status, created_at')
    .eq('created_by', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  // Analyze patterns
  const eventTypes = {};
  const platformUsage = {};
  let suspiciousActivity = [];

  securityEvents?.forEach((event: any) => {
    eventTypes[event.event_type] = (eventTypes[event.event_type] || 0) + 1;
    
    // Flag suspicious patterns
    if (event.event_type.includes('failed') || event.event_type.includes('exceeded')) {
      suspiciousActivity.push({
        timestamp: event.created_at,
        type: event.event_type,
        data: event.event_data
      });
    }
  });

  batches?.forEach((batch: any) => {
    platformUsage[batch.platform] = (platformUsage[batch.platform] || 0) + 1;
  });

  return {
    timeRange: { startDate, endDate },
    totalEvents: securityEvents?.length || 0,
    totalBatches: batches?.length || 0,
    eventTypes,
    platformUsage,
    suspiciousActivity,
    riskScore: suspiciousActivity.length > 10 ? 'high' : suspiciousActivity.length > 5 ? 'medium' : 'low'
  };
}

async function checkVulnerabilities(supabase: any) {
  console.log('Checking system vulnerabilities');
  
  const vulnerabilities = [];

  // Check for users without proper verification
  const { data: unverifiedUsers } = await supabase
    .from('profiles')
    .select('id, created_at')
    .is('avatar_url', null)
    .limit(10);

  if (unverifiedUsers && unverifiedUsers.length > 0) {
    vulnerabilities.push({
      type: 'unverified_users',
      level: 'low',
      count: unverifiedUsers.length,
      description: 'Users without complete profiles detected'
    });
  }

  // Check for excessive failed authentication attempts
  const { data: failedAuths, count: failedAuthCount } = await supabase
    .from('security_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'auth_failure')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (failedAuthCount && failedAuthCount > 50) {
    vulnerabilities.push({
      type: 'excessive_auth_failures',
      level: 'medium',
      count: failedAuthCount,
      description: 'High number of authentication failures in last 24 hours'
    });
  }

  // Check for batches with suspicious patterns
  const { data: suspiciousBatches } = await supabase
    .from('batches')
    .select('id, name, created_at')
    .contains('settings', { targetUrlOverride: 'localhost' })
    .limit(5);

  if (suspiciousBatches && suspiciousBatches.length > 0) {
    vulnerabilities.push({
      type: 'suspicious_batches',
      level: 'medium',
      count: suspiciousBatches.length,
      description: 'Batches targeting localhost detected',
      examples: suspiciousBatches.map((b: any) => ({ id: b.id, name: b.name }))
    });
  }

  const overallRisk = vulnerabilities.some(v => v.level === 'high') ? 'high' :
                     vulnerabilities.some(v => v.level === 'medium') ? 'medium' : 'low';

  return {
    vulnerabilities,
    totalVulnerabilities: vulnerabilities.length,
    overallRisk,
    lastChecked: new Date().toISOString(),
    recommendations: generateRecommendations(vulnerabilities)
  };
}

function generateRecommendations(vulnerabilities: any[]) {
  const recommendations = [];

  vulnerabilities.forEach(vuln => {
    switch (vuln.type) {
      case 'unverified_users':
        recommendations.push('Implement email verification requirements');
        break;
      case 'excessive_auth_failures':
        recommendations.push('Review and strengthen rate limiting for authentication');
        break;
      case 'suspicious_batches':
        recommendations.push('Add validation to prevent localhost targeting in production');
        break;
    }
  });

  return recommendations;
}