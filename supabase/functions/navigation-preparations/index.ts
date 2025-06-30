/*
# Navigation Preparations Edge Function

This Edge Function handles navigation preparation requests from Spline,
processes the data, and returns appropriate responses for navigation setup.

## Features
- Receives POST requests from Spline API calls
- Processes navigation preparation data
- Returns structured responses for navigation setup
- Handles CORS for cross-origin requests
- Broadcasts events to connected clients via Realtime
*/

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface NavigationRequest {
  action?: string;
  destination?: string;
  userId?: string;
  sessionId?: string;
  metadata?: {
    [key: string]: any;
  };
}

interface NavigationResponse {
  success: boolean;
  message: string;
  navigationId: string;
  preparationData: {
    route: string;
    timestamp: string;
    status: 'prepared' | 'ready' | 'error';
    nextSteps?: string[];
  };
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

    // Handle GET requests for health check
    if (req.method === 'GET') {
      return new Response(
        JSON.stringify({ 
          status: 'healthy',
          service: 'navigation-preparations',
          timestamp: new Date().toISOString()
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Only allow POST requests for navigation preparation
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
    let navigationRequest: NavigationRequest
    try {
      navigationRequest = await req.json()
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

    // Generate unique navigation ID
    const navigationId = crypto.randomUUID()
    const timestamp = new Date().toISOString()

    // Process navigation preparation based on action
    let preparationData: NavigationResponse['preparationData']
    
    switch (navigationRequest.action) {
      case 'start_journey':
        preparationData = {
          route: '/journey/begin',
          timestamp,
          status: 'prepared',
          nextSteps: [
            'Initialize user session',
            'Load journey configuration',
            'Prepare 3D environment'
          ]
        }
        break
        
      case 'explore_goals':
        preparationData = {
          route: '/goals/explore',
          timestamp,
          status: 'prepared',
          nextSteps: [
            'Load goal templates',
            'Prepare goal input interface',
            'Initialize progress tracking'
          ]
        }
        break
        
      case 'meditation_mode':
        preparationData = {
          route: '/meditation/start',
          timestamp,
          status: 'prepared',
          nextSteps: [
            'Load meditation environment',
            'Initialize audio system',
            'Prepare breathing guide'
          ]
        }
        break
        
      default:
        preparationData = {
          route: '/default',
          timestamp,
          status: 'ready',
          nextSteps: [
            'Default navigation prepared',
            'Ready for user interaction'
          ]
        }
    }

    // Create response object
    const response: NavigationResponse = {
      success: true,
      message: `Navigation preparation completed for ${navigationRequest.action || 'default action'}`,
      navigationId,
      preparationData
    }

    // Broadcast navigation event to connected clients
    const channel = supabase.channel('navigation-events')
    
    const eventData = {
      type: 'navigation_preparation',
      payload: {
        navigationId,
        action: navigationRequest.action,
        destination: navigationRequest.destination,
        preparationData,
        metadata: navigationRequest.metadata
      },
      timestamp,
      source: 'spline'
    }

    // Send the event to the realtime channel
    await channel.send({
      type: 'broadcast',
      event: 'navigation_prepared',
      payload: eventData
    })

    console.log('Navigation preparation completed:', {
      navigationId,
      action: navigationRequest.action,
      timestamp
    })

    // Return success response
    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in navigation-preparations function:', error)
    
    const errorResponse = {
      success: false,
      message: 'Navigation preparation failed',
      navigationId: crypto.randomUUID(),
      preparationData: {
        route: '/error',
        timestamp: new Date().toISOString(),
        status: 'error' as const,
        nextSteps: ['Handle error', 'Retry navigation preparation']
      },
      error: error.message
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