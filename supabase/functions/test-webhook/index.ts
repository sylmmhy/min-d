/*
# Test Webhook Edge Function - 完全匿名访问

这个测试函数专门设计用来绕过 Supabase API Gateway 的认证限制。

## 特性
- ✅ 完全匿名访问（无需任何认证）
- ✅ 支持所有 HTTP 方法
- ✅ 详细的请求日志记录
- ✅ 自动触发前端 LifeGoalsModal

## 使用方法
- URL: https://[your-project].supabase.co/functions/v1/test-webhook
- Method: POST (或任何方法)
- Headers: 无需任何特殊头部
- Body: {"number": 1} 或任何 JSON
*/

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': '*',
  'Access-Control-Max-Age': '86400',
}

Deno.serve(async (req: Request) => {
  console.log('=== TEST WEBHOOK CALLED ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  console.log('Timestamp:', new Date().toISOString())
  console.log('Headers:', Object.fromEntries(req.headers.entries()))

  // 处理所有预检请求
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight')
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    // 解析请求体
    let payload = {}
    try {
      const bodyText = await req.text()
      console.log('Raw body:', bodyText)
      if (bodyText.trim()) {
        payload = JSON.parse(bodyText)
      }
    } catch (error) {
      console.log('Body parsing error (using empty payload):', error)
    }

    console.log('Parsed payload:', JSON.stringify(payload, null, 2))

    // 创建响应
    const response = {
      success: true,
      message: 'Test webhook received successfully!',
      timestamp: new Date().toISOString(),
      method: req.method,
      receivedPayload: payload,
      anonymousAccess: true,
      note: 'This function accepts completely anonymous requests',
      nextStep: 'Check if this works, then we can integrate with Supabase'
    }

    console.log('=== TEST WEBHOOK RESPONSE ===')
    console.log(JSON.stringify(response, null, 2))

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('=== ERROR IN TEST WEBHOOK ===')
    console.error('Error:', error)

    const errorResponse = {
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString(),
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