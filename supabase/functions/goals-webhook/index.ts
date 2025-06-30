/*
# Goals Webhook Edge Function

This Edge Function handles the "Life Goals" modal trigger from Spline.
*/

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    let payload: any = {}
    try {
      const rawBody = await req.text()
      console.log('Goals webhook - Raw body:', rawBody)
      
      if (rawBody && rawBody.trim() !== '') {
        payload = JSON.parse(rawBody)
      }
    } catch (error) {
      console.error('Goals webhook - JSON parsing error:', error)
    }

    console.log('🎯 GOALS WEBHOOK TRIGGERED')
    console.log('Received payload:', JSON.stringify(payload, null, 2))

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create event data for goals modal
    const eventData = {
      type: 'spline_goals_trigger',
      payload: {
        ...payload,
        modalType: 'goals',
        number: 1,
        action: 'goals_api',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      source: 'spline-goals'
    }

    console.log('🎯 Broadcasting goals event:', JSON.stringify(eventData, null, 2))

    // Broadcast the event
    const channel = supabase.channel('spline-events')
    const broadcastResult = await channel.send({
      type: 'broadcast',
      event: 'spline_interaction',
      payload: eventData
    })

    console.log('✅ Goals webhook processed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Life goals modal triggered successfully',
        eventType: 'goals',
        modalType: 'goals',
        eventId: crypto.randomUUID()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('❌ Error in goals-webhook function:', error)
    
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