// 简化的测试脚本 - 不使用任何认证头
async function testSimpleWebhook() {
  try {
    console.log('🚀 Testing Simple Webhook (no auth)...');
    
    const response = await fetch('https://ivlfsixvfovqitkajyjc.supabase.co/functions/v1/spline-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // 故意不包含 Authorization 头
      },
      body: JSON.stringify({ 
        number: 1,
        test: true,
        source: 'browser-test'
      })
    });

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text(); // 先获取文本，以防不是 JSON
    console.log('📊 Raw Response:', data);
    
    try {
      const jsonData = JSON.parse(data);
      console.log('📊 Parsed JSON:', jsonData);
    } catch (parseError) {
      console.log('⚠️ Response is not JSON:', parseError);
    }
    
    if (response.ok) {
      console.log('✅ Webhook test successful!');
    } else {
      console.error('❌ Webhook test failed with status:', response.status);
    }
    
    return { status: response.status, data };
  } catch (error) {
    console.error('❌ Network error:', error);
    return null;
  }
}

// 运行测试
testSimpleWebhook();