// 直接测试 webhook 的 JavaScript 代码
// 在浏览器控制台中运行此代码来测试连接

async function testSplineWebhook() {
  try {
    console.log('🚀 Testing Spline Webhook...');
    
    const response = await fetch('https://ivlfsixvfovqitkajyjc.supabase.co/functions/v1/spline-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2bGZzaXh2Zm92cWl0a2FqeWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NTU5NzQsImV4cCI6MjA1MjUzMTk3NH0.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2bGZzaXh2Zm92cWl0a2FqeWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NTU5NzQsImV4cCI6MjA1MjUzMTk3NH0'
      },
      body: JSON.stringify({ number: 1 })
    });

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('📊 Response Data:', data);
    
    if (response.ok) {
      console.log('✅ Webhook test successful!');
      console.log('🔍 Now check your spline_event_logs table for new records');
      console.log('🔍 Also check if LifeGoalsModal appears on your frontend');
    } else {
      console.error('❌ Webhook test failed:', data);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Network error:', error);
    return null;
  }
}

// 运行测试
testSplineWebhook();