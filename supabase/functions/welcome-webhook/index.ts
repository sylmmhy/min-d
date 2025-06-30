/*
# Welcome Webhook Edge Function

This Edge Function handles Spline API calls for the "Welcome Journey" feature.
When called, it triggers the welcome modal on the frontend.

## Usage
- URL: https://[your-project].supabase.co/functions/v1/welcome-webhook
- Method: POST
- Triggers: Welcome modal with "欢迎启航" content
*/

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface WelcomeWebhookPayload {
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

    // Parse the request body (optional for this endpoint)
    let payload: WelcomeWebhookPayload = {}
    try {
      const body = await req.text()
      if (body) {
        payload = JSON.parse(body)
      }
    } catch (error) {
      // If JSON parsing fails, continue with empty payload
      console.log('No JSON payload or invalid JSON, continuing with empty payload')
    }

    console.log('=== WELCOME WEBHOOK CALLED ===')
    console.log('Payload received:', JSON.stringify(payload, null, 2))
    console.log('Timestamp:', new Date().toISOString())

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create the welcome event data
    const eventData = {
      type: 'spline_welcome_trigger',
      payload: {
        ...payload,
        number: 2, // Explicitly set for compatibility
        modalType: 'welcome',
        uiAction: 'show_welcome',
        message: '欢迎启航',
        apiEndpoint: 'welcome-webhook',
        timestamp: new Date().toISOString(),
        source: 'welcome-webhook'
      },
      timestamp: new Date().toISOString(),
      source: 'spline'
    }

    console.log('=== BROADCASTING WELCOME EVENT ===')
    console.log('Event data:', JSON.stringify(eventData, null, 2))

    // Broadcast to realtime channel
    const channel = supabase.channel('spline-events')
    
    const broadcastResult = await channel.send({
      type: 'broadcast',
      event: 'spline_interaction',
      payload: eventData
    })

    console.log('Broadcast result:', broadcastResult)

    // Prepare welcome-specific response
    const apiResponse = {
      success: true,
      status: 'welcome',
      message: '欢迎启航',
      action: 'show_welcome_modal',
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      content: {
        title: '欢迎启航',
        description: '系统会调用传感器来监测你是否当下在做重要的事情。当你做和目标有关的事情的时候，会吹起不同的意念之风，推进你的小船帮你到达目的地。',
        type: 'welcome',
        modalType: 'welcome'
      },
      receivedPayload: payload,
      processedAs: {
        eventType: 'spline_welcome_trigger',
        modalType: 'welcome',
        uiAction: 'show_welcome'
      }
    }

    console.log('=== WELCOME API RESPONSE ===')
    console.log(JSON.stringify(apiResponse, null, 2))

    return new Response(
      JSON.stringify(apiResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('=== ERROR IN WELCOME WEBHOOK ===')
    console.error('Error details:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString(),
        endpoint: 'welcome-webhook'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})