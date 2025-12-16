# 项目架构说明

## 整体架构

```
┌─────────────────┐
│   浏览器客户端   │
│  (React + TS)   │
└────────┬────────┘
         │
         │ HTTP Request
         │ (包含 modelConfig + generateRequest)
         │
         ▼
┌─────────────────┐
│  后端代理服务    │
│  (Express.js)   │
└────────┬────────┘
         │
         │ HTTP Request
         │ (添加 Authorization Header)
         │
         ▼
┌─────────────────┐
│   AI 模型 API   │
│ (OpenAI/Gemini) │
└─────────────────┘
```

## 为什么需要后端代理？

### 跨域问题
浏览器的同源策略限制了前端直接调用第三方 AI API，会产生 CORS 错误。

### 解决方案
通过后端服务作为代理：
1. 前端将请求发送到同域的后端服务
2. 后端服务转发请求到 AI API
3. 后端将响应返回给前端

## 数据流向

### 1. 用户配置存储（客户端）

```javascript
// 保存在浏览器 localStorage
{
  baseURL: "https://api.example.com",
  apiToken: "sk-xxx...",
  modelName: "gemini-2.0-flash"
}
```

**优势**：
- 敏感信息不经过服务器
- 用户完全控制自己的 API 密钥
- 支持多用户使用不同的 API 配置

### 2. 图片上传流程

```
用户选择图片
    ↓
转换为 base64
    ↓
保存在前端状态中
    ↓
随请求发送到后端
    ↓
后端转发到 AI API
```

### 3. 头像生成流程

```
1. 用户点击"生成头像"
2. 前端收集数据：
   - userImage (base64)
   - referenceImage (base64)
   - background (配置)
   - modelConfig (从 localStorage 读取)
3. 发送到后端 /api/generate
4. 后端构建 AI API 请求
5. 调用 AI API
6. 返回生成的头像
7. 前端显示结果
```

## 关键设计决策

### 1. API 配置存储在客户端

**原因**：
- 隐私安全：用户的 API Token 不会上传到服务器
- 灵活性：每个用户可以使用自己的 API 配置
- 无状态后端：后端不需要数据库

**实现**：
```typescript
// services/storageService.ts
export class StorageService {
  static saveModelConfig(config: ModelConfig): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }
  
  static loadModelConfig(): ModelConfig | null {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }
}
```

### 2. Base64 编码图片

**原因**：
- 简化传输：直接在 JSON 中传输
- AI API 要求：大多数 AI API 接受 base64 格式
- 避免文件上传：不需要额外的文件存储服务

**实现**：
```typescript
// utils/imageProcessor.ts
static async fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

### 3. 后端只做转发

**原因**：
- 简单性：后端逻辑简单，易于维护
- 无状态：不需要数据库和会话管理
- 安全性：不存储用户数据

**实现**：
```javascript
// backend/src/index.js
app.post('/api/generate', async (req, res) => {
  const { modelConfig, generateRequest } = req.body;
  
  // 直接转发到 AI API
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${modelConfig.apiToken}`
    },
    body: JSON.stringify(payload)
  });
  
  // 返回结果
  res.json(await response.json());
});
```

## 安全考虑

### 1. API Token 安全
- ✅ Token 存储在客户端 localStorage
- ✅ 只在请求时发送到后端
- ✅ 后端不记录或存储 Token
- ⚠️ 注意：localStorage 可被同域 JavaScript 访问

### 2. 传输安全
- 生产环境应使用 HTTPS
- 后端应验证请求来源
- 可添加请求频率限制

### 3. 数据大小限制
```javascript
// 限制请求体大小为 50MB
app.use(express.json({ limit: '50mb' }));
```

## 扩展性考虑

### 未来可能的优化

1. **增加缓存**
   - Redis 缓存常用的生成结果
   - 减少重复的 AI API 调用

2. **队列处理**
   - 使用消息队列处理生成请求
   - 支持异步处理和重试机制

3. **用户认证**
   - 添加用户登录系统
   - 在服务端安全存储 API 配置

4. **CDN 集成**
   - 将生成的图片上传到 CDN
   - 提供永久访问链接

5. **批量处理**
   - 支持一次上传多张照片
   - 批量生成头像

## 技术选型理由

### 前端：React + Vite + TypeScript
- React：组件化开发，生态丰富
- Vite：快速的开发体验
- TypeScript：类型安全，减少错误

### 后端：Node.js + Express
- 简单轻量：适合代理服务
- 与前端同语言：降低学习成本
- 成熟稳定：生态完善

### 样式：TailwindCSS
- 快速开发：实用优先的类名
- 现代设计：支持 backdrop-blur 等现代特性
- 响应式：内置响应式设计

## 性能优化

1. **图片压缩**
   - 上传前自动压缩大图片
   - 减少传输数据量

2. **并发控制**
   - 限制同时处理的请求数量
   - 避免服务器过载

3. **进度反馈**
   - 实时显示生成进度
   - 提升用户体验

4. **错误重试**
   - 自动重试失败的请求
   - 指数退避策略
