/*
# Spline Webhook Edge Function with Logging

This Edge Function receives POST requests from Spline when buttons are clicked,
logs all events to spline_event_logs table for debugging, and broadcasts the 
data to connected clients via Supabase Realtime.

## Features
- Receives JSON data from Spline API calls
- Logs all events to spline_event_logs table for debugging
- Validates incoming requests
- Broadcasts events to Supabase Realtime channel
- Handles CORS for cross-origin requests
- Supports multiple API endpoints for different interactions
- Now supports both authenticated and anonymous requests
*/

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
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
  let logId: string | null = null;
  
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

    // Log request headers for debugging
    console.log('=== REQUEST HEADERS ===')
    console.log('Authorization:', req.headers.get('authorization'))
    console.log('Content-Type:', req.headers.get('content-type'))
    console.log('User-Agent:', req.headers.get('user-agent'))
    console.log('Origin:', req.headers.get('origin'))

    // Parse the request body
    let payload: SplineWebhookPayload
    try {
      payload = await req.json()
    } catch (error) {
      console.error('JSON parsing error:', error)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Log the received payload for debugging
    console.log('=== SPLINE WEBHOOK RECEIVED ===')
    console.log('Raw payload:', JSON.stringify(payload, null, 2))
    console.log('Payload number:', payload.number, 'Type:', typeof payload.number)
    console.log('Payload action:', payload.action)

    // Initialize Supabase client with service role key for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Determine event type and modal type based on payload
    let eventType = 'spline_button_click'
    let modalType = 'goals' // default
    let responseMessage = 'Event processed'
    let uiAction = 'show_goals'

    // Very explicit number checking with detailed logging
    console.log('=== DECISION LOGIC ===')
    
    if (payload.number === 2) {
      eventType = 'spline_welcome_trigger'
      modalType = 'welcome'
      responseMessage = '欢迎启航'
      uiAction = 'show_welcome'
      console.log('✅ DECISION: Welcome modal (number === 2)')
    } else if (payload.number === 1) {
      eventType = 'spline_goals_trigger'
      modalType = 'goals'
      responseMessage = '人生目标设定'
      uiAction = 'show_goals'
      console.log('✅ DECISION: Goals modal (number === 1)')
    } else if (payload.action === 'welcome' || payload.action === 'second_api') {
      eventType = 'spline_welcome_trigger'
      modalType = 'welcome'
      responseMessage = '欢迎启航'
      uiAction = 'show_welcome'
      console.log('✅ DECISION: Welcome modal (action-based)')
    } else if (payload.action === 'goals' || payload.action === 'first_api') {
      eventType = 'spline_goals_trigger'
      modalType = 'goals'
      responseMessage = '人生目标设定'
      uiAction = 'show_goals'
      console.log('✅ DECISION: Goals modal (action-based)')
    } else {
      // Default fallback
      eventType = 'spline_goals_trigger'
      modalType = 'goals'
      responseMessage = '人生目标设定'
      uiAction = 'show_goals'
      console.log('⚠️ DECISION: Default to goals modal (unknown payload)')
    }

    console.log('Final decision:', { eventType, modalType, uiAction })

    // Create the event data for broadcasting
    const eventData = {
      type: eventType,
      payload: {
        ...payload,
        modalType: modalType,
        uiAction: uiAction,
        message: responseMessage,
        timestamp: new Date().toISOString(),
        processedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      source: 'spline'
    }

    console.log('=== LOGGING EVENT TO DATABASE ===')
    
    // Insert initial log record
    try {
      const { data: logData, error: logError } = await supabase
        .from('spline_event_logs')
        .insert({
          event_type: eventType,
          source_webhook: 'spline-webhook',
          raw_payload: payload,
          broadcast_payload: eventData,
          status: 'received'
        })
        .select('id')
        .single()

      if (logError) {
        console.error('Failed to insert log record:', logError)
      } else {
        logId = logData?.id
        console.log('Log record created with ID:', logId)
      }
    } catch (logInsertError) {
      console.error('Error inserting log record:', logInsertError)
    }

    console.log('=== BROADCASTING EVENT ===')
    console.log('Event data:', JSON.stringify(eventData, null, 2))

    // Broadcast to realtime channel
    const channel = supabase.channel('spline-events')
    
    const broadcastResult = await channel.send({
      type: 'broadcast',
      event: 'spline_interaction',
      payload: eventData
    })

    console.log('Broadcast result:', broadcastResult)

    // Update log record with broadcast status
    if (logId) {
      try {
        const { error: updateError } = await supabase
          .from('spline_event_logs')
          .update({
            status: 'broadcasted'
          })
          .eq('id', logId)

        if (updateError) {
          console.error('Failed to update log record status:', updateError)
        } else {
          console.log('Log record updated to broadcasted status')
        }
      } catch (logUpdateError) {
        console.error('Error updating log record:', logUpdateError)
      }
    }

    // Prepare response based on the decision
    let apiResponse = {
      success: true,
      eventId: crypto.randomUUID(),
      logId: logId,
      timestamp: new Date().toISOString(),
      receivedPayload: payload,
      requestInfo: {
        method: req.method,
        url: req.url,
        headers: Object.fromEntries(req.headers.entries()),
        userAgent: req.headers.get('user-agent'),
        origin: req.headers.get('origin')
      },
      processedAs: {
        eventType: eventType,
        modalType: modalType,
        uiAction: uiAction,
        message: responseMessage
      }
    }

    // Add specific response content based on number
    if (payload.number === 2 || modalType === 'welcome') {
      apiResponse = {
        ...apiResponse,
        status: 'welcome',
        message: '欢迎启航',
        action: 'show_welcome_modal',
        content: {
          title: '欢迎启航',
          description: '系统会调用传感器来监测你是否当下在做重要的事情。当你做和目标有关的事情的时候，会吹起不同的意念之风，推进你的小船帮你到达目的地。',
          type: 'welcome'
        }
      }
    } else if (payload.number === 1 || modalType === 'goals') {
      apiResponse = {
        ...apiResponse,
        status: 'goals',
        message: '人生目标设定',
        action: 'show_goals_modal',
        content: {
          title: '你的人生目标是什么？',
          description: '分享你内心深处的梦想与追求',
          type: 'goals'
        }
      }
    }

    console.log('=== FINAL API RESPONSE ===')
    console.log(JSON.stringify(apiResponse, null, 2))

    return new Response(
      JSON.stringify(apiResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('=== ERROR IN WEBHOOK ===')
    console.error('Error details:', error)
    console.error('Error stack:', error.stack)
    
    // Update log record with error status if we have a logId
    if (logId) {
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )
        
        await supabase
          .from('spline_event_logs')
          .update({
            status: 'error',
            error_message: error.message
          })
          .eq('id', logId)
      } catch (logUpdateError) {
        console.error('Error updating log record with error status:', logUpdateError)
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        logId: logId
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})