/*
# Spline Webhook Edge Function

This Edge Function receives POST requests from Spline when buttons are clicked,
and broadcasts the data to connected clients via Supabase Realtime.

## Features
- Receives JSON data from Spline API calls
- Validates incoming requests
- Broadcasts events to Supabase Realtime channel
- Handles CORS for cross-origin requests
- Supports multiple API endpoints for different interactions
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
  apiEndpoint?: string;
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

    // Log the received payload for debugging
    console.log('Received payload from Spline:', JSON.stringify(payload, null, 2))

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Broadcast the event to all connected clients
    const channel = supabase.channel('spline-events')
    
    // Determine event type based on payload - be very specific about number comparison
    let eventType = 'spline_button_click'
    let modalType = 'unknown'
    
    console.log('Analyzing payload:')
    console.log('- payload.number:', payload.number, typeof payload.number)
    console.log('- payload.action:', payload.action)
    console.log('- payload.apiEndpoint:', payload.apiEndpoint)
    
    // Check for exact number match
    if (payload.number === 2) {
      eventType = 'spline_welcome_trigger'
      modalType = 'welcome'
      console.log('Detected: Welcome modal trigger (number === 2)')
    } else if (payload.number === 1) {
      eventType = 'spline_goals_trigger'
      modalType = 'goals'
      console.log('Detected: Goals modal trigger (number === 1)')
    } else if (payload.action === 'second_api' || payload.apiEndpoint === 'welcome') {
      eventType = 'spline_welcome_trigger'
      modalType = 'welcome'
      console.log('Detected: Welcome modal trigger (action/endpoint)')
    } else if (payload.action === 'first_api' || payload.apiEndpoint === 'goals') {
      eventType = 'spline_goals_trigger'
      modalType = 'goals'
      console.log('Detected: Goals modal trigger (action/endpoint)')
    } else {
      // Default to goals modal for unknown events
      eventType = 'spline_goals_trigger'
      modalType = 'goals'
      console.log('Detected: Unknown event, defaulting to goals modal')
    }
    
    const eventData = {
      type: eventType,
      payload: {
        ...payload,
        modalType: modalType, // Add explicit modal type
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      source: 'spline'
    }

    console.log('Broadcasting event:', JSON.stringify(eventData, null, 2))

    // Send the event to the realtime channel
    await channel.send({
      type: 'broadcast',
      event: 'spline_interaction',
      payload: eventData
    })

    console.log('Spline webhook processed successfully')

    // Return success response with appropriate message
    let responseMessage = 'Event broadcasted successfully'
    if (eventType === 'spline_welcome_trigger') {
      responseMessage = 'Welcome journey initiated successfully'
    } else if (eventType === 'spline_goals_trigger') {
      responseMessage = 'Life goals modal triggered successfully'
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: responseMessage,
        eventId: crypto.randomUUID(),
        eventType: eventType,
        modalType: modalType,
        receivedPayload: payload
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