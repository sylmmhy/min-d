/*
# Spline Webhook Edge Function

This Edge Function receives POST requests from Spline when buttons are clicked,
and broadcasts the data to connected clients via Supabase Realtime.

## Features
- Receives JSON data from Spline API calls
- Validates incoming requests
- Broadcasts events to Supabase Realtime channel
- Handles CORS for cross-origin requests
*/

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface SplineWebhookPayload {
  number?: number;
  action?: string;
  buttonId?: string;
  [key: string]: any;
}

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      })
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse the request body
    let payload: SplineWebhookPayload
    try {
      payload = await req.json()
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Broadcast the event to all connected clients
    const channel = supabase.channel('spline-events')
    
    const eventData = {
      type: 'spline_button_click',
      payload: payload,
      timestamp: new Date().toISOString(),
      source: 'spline'
    }

    // Send the event to the realtime channel
    await channel.send({
      type: 'broadcast',
      event: 'spline_interaction',
      payload: eventData
    })

    console.log('Spline webhook received:', eventData)

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Event broadcasted successfully',
        eventId: crypto.randomUUID()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in spline-webhook function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})