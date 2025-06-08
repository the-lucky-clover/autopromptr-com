
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get batch ID from URL path
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const batchId = pathParts[pathParts.length - 1]

    if (!batchId || batchId === 'batch-exists') {
      return new Response(
        JSON.stringify({ error: 'Batch ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Checking if batch exists: ${batchId}`)

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Query the batches table to check if batch exists
    const { data, error } = await supabase
      .from('batches')
      .select('id')
      .eq('id', batchId)
      .single()

    if (error) {
      console.error('Database error:', error)
      
      // If it's a "not found" error, return exists: false
      if (error.code === 'PGRST116') {
        console.log(`Batch not found: ${batchId}`)
        return new Response(
          JSON.stringify({ exists: false }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      // For other database errors, return 500
      return new Response(
        JSON.stringify({ error: 'Database query failed', details: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // If we get here, the batch exists
    console.log(`Batch found: ${batchId}`)
    return new Response(
      JSON.stringify({ exists: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
