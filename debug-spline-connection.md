# Spline Webhook 连接调试指南

## 问题分析
您点击 Spline 中的按钮后：
1. `spline_event_logs` 表没有记录 → Spline 请求没有到达 Supabase
2. LifeGoalsModal 没有弹出 → 前端没有收到事件

## 解决步骤

### 第一步：验证 Spline 配置

1. **检查 Spline 中的 API 配置**：
   - 打开您的 Spline 项目
   - 选择您要触发的按钮/元素
   - 在右侧属性面板中找到 "Events" 或"API" 设置
   - 确认以下配置：
     - **Method**: `POST`
     - **URL**: `https://ivlfsixvfovqitkajyjc.supabase.co/functions/v1/spline-webhook`
     - **Headers**: 
       ```
       Content-Type: application/json
       Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2bGZzaXh2Zm92cWl0a2FqeWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NTU5NzQsImV4cCI6MjA1MjUzMTk3NH0.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2bGZzaXh2Zm92cWl0a2FqeWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NTU5NzQsImV4cCI6MjA1MjUzMTk3NH0
       ```
     - **Body**: `{"number": 1}` (用于触发 LifeGoalsModal)

### 第二步：测试网络连接

2. **在 Spline 中添加调试信息**：
   - 如果 Spline 支持，添加 console.log 或其他调试输出
   - 确认按钮点击事件确实被触发

3. **使用浏览器开发者工具**：
   - 在运行 Spline 的浏览器中按 F12 打开开发者工具
   - 切换到 "Network" 标签
   - 点击 Spline 中的按钮
   - 查看是否有对 Supabase 的 HTTP 请求
   - 如果有请求，检查状态码和响应

### 第三步：验证 Supabase Edge Function

4. **检查 Edge Function 状态**：
   - 登录 Supabase Dashboard
   - 进入 "Edge Functions" 页面
   - 确认 `spline-webhook` 函数状态为 "Deployed"
   - 如果状态异常，重新部署函数

5. **查看 Edge Function 日志**：
   - 在 Supabase Dashboard 的 "Edge Functions" 页面
   - 点击 `spline-webhook` 函数
   - 查看 "Logs" 标签，看是否有任何错误信息

### 第四步：使用 curl 测试

6. **直接测试 webhook**：
   ```bash
   curl -X POST https://ivlfsixvfovqitkajyjc.supabase.co/functions/v1/spline-webhook \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2bGZzaXh2Zm92cWl0a2FqeWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NTU5NzQsImV4cCI6MjA1MjUzMTk3NH0.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2bGZzaXh2Zm92cWl0a2FqeWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NTU5NzQsImV4cCI6MjA1MjUzMTk3NH0" \
     -d '{"number": 1}'
   ```

### 第五步：检查前端连接

7. **验证前端 Realtime 连接**：
   - 打开浏览器开发者工具的 Console 标签
   - 查看是否有 Supabase Realtime 连接的日志
   - 确认 SplineEventHandler 组件正在监听事件

## 常见问题和解决方案

### 问题 1: Spline 无法发送请求
- **原因**: CORS 问题或网络限制
- **解决**: 确认 Spline 运行环境允许外部 API 调用

### 问题 2: Authorization 头格式错误
- **原因**: 缺少 "Bearer " 前缀或 token 无效
- **解决**: 使用正确的 anon key 格式

### 问题 3: Edge Function 未部署
- **原因**: 函数代码有语法错误或部署失败
- **解决**: 检查函数日志，重新部署

### 问题 4: Realtime 连接问题
- **原因**: 前端未正确订阅 Realtime 频道
- **解决**: 检查 SplineEventHandler 组件的订阅逻辑

## 调试检查清单

- [ ] Spline 按钮配置正确
- [ ] Webhook URL 正确
- [ ] HTTP 方法为 POST
- [ ] Headers 包含正确的 Authorization
- [ ] Body 是有效的 JSON
- [ ] Edge Function 已部署且运行正常
- [ ] 前端 Realtime 连接正常
- [ ] 浏览器网络请求显示成功
- [ ] spline_event_logs 表有新记录
- [ ] LifeGoalsModal 正确弹出