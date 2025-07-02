/*
# Spline Proxy Edge Function

This Edge Function acts as a proxy to call the Spline webhook API from the backend,
avoiding CORS issues when calling from the frontend.

## Usage
- URL: https://[your-project].supabase.co/functions/v1/spline-proxy
- Method: POST
- Body: { number: 0 } (or any data you want to send to Spline)
- Returns: Response from Spline API
*/

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface SplineProxyRequest {
  number?: number;
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
    let requestData: SplineProxyRequest
    try {
      requestData = await req.json()
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('=== SPLINE PROXY REQUEST ===')
    console.log('Request data:', JSON.stringify(requestData, null, 2))
    console.log('Timestamp:', new Date().toISOString())

    // Make the request to Spline webhook
    try {
      console.log('Calling Spline webhook...')
      
      const splineResponse = await fetch('https://hooks.spline.design/gpRFQacPBZs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'QgxEuHaAD0fyTDdEAYvVH_ynObU2SUnWdip86Gb1RJE',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      console.log('Spline response status:', splineResponse.status)
      console.log('Spline response headers:', Object.fromEntries(splineResponse.headers.entries()))

      // Get response data
      let splineData
      const contentType = splineResponse.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        splineData = await splineResponse.json()
      } else {
        splineData = await splineResponse.text()
      }

      console.log('Spline response data:', splineData)

      // Prepare our response
      const proxyResponse = {
        success: splineResponse.ok,
        status: splineResponse.status,
        statusText: splineResponse.statusText,
        timestamp: new Date().toISOString(),
        requestData: requestData,
        splineResponse: splineData,
        headers: Object.fromEntries(splineResponse.headers.entries())
      }

      console.log('=== SPLINE PROXY RESPONSE ===')
      console.log(JSON.stringify(proxyResponse, null, 2))

      return new Response(
        JSON.stringify(proxyResponse),
        {
          status: splineResponse.ok ? 200 : splineResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )

    } catch (splineError) {
      console.error('=== ERROR CALLING SPLINE WEBHOOK ===')
      console.error('Spline error:', splineError)
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to call Spline webhook',
          message: splineError.message,
          timestamp: new Date().toISOString(),
          requestData: requestData
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

  } catch (error) {
    console.error('=== ERROR IN SPLINE PROXY ===')
    console.error('Error details:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString(),
        endpoint: 'spline-proxy'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})