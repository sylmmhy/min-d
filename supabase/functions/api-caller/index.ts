/*
# API Caller Edge Function

This Edge Function acts as a proxy to call external APIs securely.
It can be used to make HTTP requests to third-party services while
keeping API keys and sensitive data secure on the server side.

## Features
- Supports GET, POST, PUT, DELETE methods
- Handles request headers and body forwarding
- Secure proxy for external API calls
- CORS support for browser requests
- Error handling and logging
*/

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-target-url, x-target-method',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface ApiRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
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

    // Parse request
    let requestData: ApiRequest;
    
    // Check if URL and method are provided in headers (for simple requests)
    const targetUrl = req.headers.get('x-target-url');
    const targetMethod = req.headers.get('x-target-method') || 'GET';
    
    if (targetUrl) {
      // Simple request with headers
      requestData = {
        url: targetUrl,
        method: targetMethod,
        headers: {},
        body: req.method !== 'GET' ? await req.text() : undefined
      };
    } else {
      // Complex request with JSON body
      try {
        requestData = await req.json();
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Invalid request format. Provide JSON body or use x-target-url header.' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
    }

    // Validate required fields
    if (!requestData.url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate URL format
    let targetURL: URL;
    try {
      targetURL = new URL(requestData.url);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Prepare request options
    const method = requestData.method || 'GET';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Supabase-Edge-Function/1.0',
      ...requestData.headers
    };

    // Prepare request body
    let body: string | undefined;
    if (method !== 'GET' && method !== 'HEAD' && requestData.body) {
      body = typeof requestData.body === 'string' 
        ? requestData.body 
        : JSON.stringify(requestData.body);
    }

    console.log(`Making ${method} request to: ${requestData.url}`);

    // Make the external API call
    const response = await fetch(requestData.url, {
      method,
      headers,
      body,
    });

    // Get response data
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    // Log the response for debugging
    console.log(`API Response Status: ${response.status}`);
    console.log(`API Response Data:`, responseData);

    // Return the response
    return new Response(
      JSON.stringify({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        data: responseData,
        headers: Object.fromEntries(response.headers.entries())
      }),
      {
        status: response.ok ? 200 : response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in api-caller function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
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