# 🔍 图片显示问题调试指南

## 问题描述

AI API 返回了 base64 图片数据，但前端无法正确显示图片。

## 已完成的修复

### 1. 后端改进

在 `avatar-maker-backend/src/index.js` 中：

- ✅ 增强了响应格式解析，支持多种 API 格式
- ✅ 添加了详细的调试日志
- ✅ 自动处理 base64 数据，确保返回正确的 data URI 格式

关键改进：
```javascript
// 自动检测并转换 base64 为 data URI
if (finalImageUrl.match(/^[A-Za-z0-9+/]+=*$/)) {
  finalImageUrl = `data:image/png;base64,${finalImageUrl}`;
}
```

### 2. 测试工具

更新了 `test-api.html`，新增功能：
- 图片 base64 显示测试
- 自动分析返回的图片数据格式
- 实时预览返回的图片
- 详细的错误诊断

## 调试步骤

### 第 1 步：重启后端

```bash
cd avatar-maker-backend
npm run dev
```

### 第 2 步：使用测试页面

在浏览器打开：
```
http://localhost:5173/test-api.html
```

点击"测试 Base64 图片显示"验证浏览器可以显示 base64 图片。

### 第 3 步：查看后端日志

当你点击"生成头像"时，后端会输出详细日志：

```
✅ Extracted from: choices[0].message.content
📝 Content preview (first 200 chars): data:image/png;base64,iVBORw0KGgo...
✅ Already a valid data URI
```

或者：

```
🔧 Converting pure base64 to data URI
```

### 第 4 步：检查返回格式

后端日志会显示：

1. **完整的 AI API 响应** - 查看原始数据结构
2. **Message 对象结构** - 确认数据在哪个字段
3. **提取路径** - 确认从哪里提取到了内容
4. **内容预览** - 查看前 200 个字符
5. **格式处理** - 显示如何处理数据

## 常见问题排查

### 问题 1：图片数据存在但无法显示

**症状**：后端日志显示提取到了内容，但前端不显示图片

**可能原因**：
1. 返回的不是有效的 data URI 格式
2. base64 数据不完整或损坏
3. 缺少 `data:image/...;base64,` 前缀

**解决方案**：
查看后端日志中的"Content preview"，确认格式：
- ✅ 正确：`data:image/png;base64,iVBORw0KGgo...`
- ❌ 错误：`iVBORw0KGgo...` (缺少前缀)

后端现在会自动添加前缀，如果还是不行，检查 AI 返回的是否真的是 base64 图片数据。

### 问题 2：AI 返回的是 URL 而不是 base64

**症状**：后端日志显示 `https://...` 开头的内容

**解决方案**：
后端已支持这种情况，会直接返回 URL。但需要确保前端可以访问该 URL（没有 CORS 限制）。

### 问题 3：AI 返回的是图片描述文本

**症状**：后端日志显示的内容是文字描述，不是图片数据

**原因**：
你的 AI 模型可能不支持直接生成图片，而是返回了对图片的描述。

**解决方案**：
1. 检查你使用的模型是否支持图片生成
2. 查看 AI API 文档，确认正确的请求格式
3. 可能需要调整后端的请求 payload

## 测试脚本

### 方法 1：使用测试页面

```bash
# 启动前端
cd avatar-maker-website
npm run dev

# 在浏览器访问
# http://localhost:5173/test-api.html
```

### 方法 2：使用测试脚本

```bash
cd avatar-maker-backend
node test-api-response.js
```

这会显示模拟响应的解析过程。

### 方法 3：使用 curl 测试真实 API

```bash
# 复制后端日志中的完整请求
curl -X POST "你的 Base URL/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 你的 Token" \
  -d '{ ... 完整的 payload ... }'
```

## 检查清单

在报告问题前，请确认：

- [ ] 后端服务正在运行 (http://localhost:3001)
- [ ] 前端服务正在运行 (http://localhost:5173)
- [ ] 浏览器控制台没有错误
- [ ] 后端终端显示了详细日志
- [ ] 测试页面的 base64 图片可以正常显示
- [ ] 查看了后端日志中的"Content preview"
- [ ] 确认 AI API 返回的确实是图片数据

## 需要提供的调试信息

如果问题仍未解决，请提供：

1. **后端完整日志**（从发起请求到返回结果）
2. **Message 对象的完整 JSON**
3. **Content preview 显示的内容**
4. **使用的 AI 服务和模型名称**
5. **浏览器控制台的错误信息**

## 当前支持的响应格式

后端现在支持以下所有格式：

```javascript
// OpenAI 标准格式
data.choices[0].message.content

// 某些代理服务
data.choices[0].message.text
data.choices[0].text

// Gemini 原生格式
data.candidates[0].content.parts[0].text
```

## 数据格式自动处理

后端会自动处理：

1. ✅ 已有 `data:image/...;base64,` 前缀 → 直接使用
2. ✅ 纯 base64 字符串 → 自动添加前缀
3. ✅ HTTP/HTTPS URL → 直接使用
4. ⚠️ 其他格式 → 原样返回（可能无法显示）

---

**更新时间**：2025-12-16
**相关文件**：
- `avatar-maker-backend/src/index.js`
- `avatar-maker-website/public/test-api.html`
- `avatar-maker-backend/test-api-response.js`
