/*
# Spline Webhook Edge Function - Anonymous Access Enabled

This Edge Function is designed to accept anonymous requests from Spline without JWT validation.
It explicitly handles requests without authentication headers and logs all events for debugging.

## Features
- ✅ Accepts anonymous requests (no JWT required)
- ✅ Handles CORS for cross-origin requests  
- ✅ Logs all events to spline_event_logs table
- ✅ Broadcasts events to Supabase Realtime
- ✅ Supports multiple payload formats
- ✅ Detailed error handling and logging

## Usage
- URL: https://[your-project].supabase.co/functions/v1/spline-webhook
- Method: POST
- Headers: Content-Type: application/json (Authorization header is OPTIONAL)
- Body: {"number": 1} for LifeGoalsModal, {"number": 2} for WelcomePanel
*/

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': '*',
  'Access-Control-Max-Age': '86400',
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
    console.log('=== SPLINE WEBHOOK REQUEST RECEIVED ===')
    console.log('Method:', req.method)
    console.log('URL:', req.url)
    console.log('Timestamp:', new Date().toISOString())

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      console.log('✅ Handling CORS preflight request')
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      })
    }

    // Allow GET requests for health checks
    if (req.method === 'GET') {
      console.log('✅ Health check request')
      return new Response(
        JSON.stringify({ 
          status: 'healthy',
          message: 'Spline Webhook is running',
          timestamp: new Date().toISOString(),
          allowsAnonymous: true,
          note: 'This function accepts completely anonymous requests'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Only allow POST requests for webhook functionality
    if (req.method !== 'POST') {
      console.log('❌ Method not allowed:', req.method)
      return new Response(
        JSON.stringify({ error: 'Method not allowed', allowedMethods: ['POST', 'OPTIONS', 'GET'] }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Log all request headers for debugging (but don't require Authorization)
    console.log('=== REQUEST HEADERS ===')
    const headers = Object.fromEntries(req.headers.entries())
    console.log('All headers:', headers)
    
    const hasAuth = req.headers.get('authorization')
    console.log('Has Authorization header:', !!hasAuth)
    console.log('Content-Type:', req.headers.get('content-type'))
    console.log('User-Agent:', req.headers.get('user-agent'))
    console.log('Origin:', req.headers.get('origin'))

    // Parse the request body
    let payload: SplineWebhookPayload = {}
    try {
      const bodyText = await req.text()
      console.log('Raw body:', bodyText)
      
      if (bodyText.trim()) {
        payload = JSON.parse(bodyText)
        console.log('✅ Parsed JSON payload:', JSON.stringify(payload, null, 2))
      } else {
        console.log('⚠️ Empty body, using default payload')
        payload = { number: 1 } // Default to show LifeGoalsModal
      }
    } catch (error) {
      console.error('❌ JSON parsing error:', error)
      console.log('Using default payload due to parse error')
      payload = { number: 1 } // Default fallback
    }

    // Initialize Supabase client with service role key for database operations
    // This bypasses RLS and allows anonymous function execution
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('✅ Supabase client initialized with service role')

    // Determine event type and modal type based on payload
    let eventType = 'spline_button_click'
    let modalType = 'goals' // default
    let responseMessage = 'Event processed'
    let uiAction = 'show_goals'

    console.log('=== DECISION LOGIC ===')
    console.log('Payload number:', payload.number, 'Type:', typeof payload.number)
    console.log('Payload action:', payload.action)
    
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
        processedAt: new Date().toISOString(),
        source: 'spline-webhook',
        hasAuth: !!hasAuth
      },
      timestamp: new Date().toISOString(),
      source: 'spline'
    }

    console.log('=== LOGGING EVENT TO DATABASE ===')
    
    // Insert log record using service role (bypasses RLS)
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
        console.error('❌ Failed to insert log record:', logError)
        console.error('Log error details:', JSON.stringify(logError, null, 2))
      } else {
        logId = logData?.id
        console.log('✅ Log record created with ID:', logId)
      }
    } catch (logInsertError) {
      console.error('❌ Exception inserting log record:', logInsertError)
    }

    console.log('=== BROADCASTING EVENT ===')
    console.log('Event data:', JSON.stringify(eventData, null, 2))

    // Broadcast to realtime channel
    try {
      const channel = supabase.channel('spline-events')
      
      const broadcastResult = await channel.send({
        type: 'broadcast',
        event: 'spline_interaction',
        payload: eventData
      })

      console.log('✅ Broadcast result:', broadcastResult)

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
            console.error('❌ Failed to update log record status:', updateError)
          } else {
            console.log('✅ Log record updated to broadcasted status')
          }
        } catch (logUpdateError) {
          console.error('❌ Exception updating log record:', logUpdateError)
        }
      }
    } catch (broadcastError) {
      console.error('❌ Broadcast failed:', broadcastError)
    }

    // Prepare response based on the decision
    let apiResponse = {
      success: true,
      eventId: crypto.randomUUID(),
      logId: logId,
      timestamp: new Date().toISOString(),
      receivedPayload: payload,
      anonymousAccess: true,
      hasAuthHeader: !!hasAuth,
      requestInfo: {
        method: req.method,
        url: req.url,
        userAgent: req.headers.get('user-agent'),
        origin: req.headers.get('origin'),
        contentType: req.headers.get('content-type')
      },
      processedAs: {
        eventType: eventType,
        modalType: modalType,
        uiAction: uiAction,
        message: responseMessage
      }
    }

    // Add specific response content based on modal type
    if (modalType === 'welcome') {
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
    } else {
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
    console.error('=== CRITICAL ERROR IN WEBHOOK ===')
    console.error('Error details:', error)
    console.error('Error stack:', error.stack)
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    
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
          
        console.log('✅ Updated log record with error status')
      } catch (logUpdateError) {
        console.error('❌ Error updating log record with error status:', logUpdateError)
      }
    }
    
    const errorResponse = {
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString(),
      logId: logId,
      anonymousAccess: true,
      stack: error.stack
    }
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})