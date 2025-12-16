# 架构改造说明

## 改造目标

解决前端直接调用 AI API 时的跨域问题，同时保持用户 API 配置在客户端存储。

## 主要变更

### 1. 新增后端服务 ✨

创建了 `avatar-maker-backend` 目录，包含：

#### 文件结构
```
avatar-maker-backend/
├── src/
│   └── index.js          # Express 服务器主文件
├── package.json          # 依赖配置
└── README.md            # 后端文档
```

#### 功能
- **代理服务**：转发前端请求到 AI API
- **CORS 处理**：允许前端跨域访问
- **健康检查**：`GET /health` 接口
- **生成接口**：`POST /api/generate` 接口

#### 依赖包
```json
{
  "express": "^4.18.2",      // Web 框架
  "cors": "^2.8.5",          // 跨域处理
  "node-fetch": "^3.3.2"     // HTTP 客户端
}
```

### 2. 修改前端 API 服务 🔧

#### 修改文件：`avatar-maker-website/src/services/apiService.ts`

**改造前**：
```typescript
// 直接调用 AI API（会产生跨域问题）
const response = await fetch(`${baseURL}/v1/chat/completions`, {
  headers: {
    'Authorization': `Bearer ${apiToken}`
  }
});
```

**改造后**：
```typescript
// 调用本地后端代理
const response = await fetch(`${BACKEND_URL}/api/generate`, {
  method: 'POST',
  body: JSON.stringify({
    modelConfig: config,      // API 配置从客户端传递
    generateRequest: request
  })
});
```

### 3. 环境变量配置 ⚙️

#### 新增文件
- `.env` - 环境变量配置
- `.env.example` - 环境变量示例

#### 配置内容
```bash
VITE_BACKEND_URL=http://localhost:3001
```

### 4. 项目文档 📚

新增/更新的文档：
- `README.md` - 项目总体说明
- `ARCHITECTURE.md` - 架构设计文档
- `CHANGES.md` - 本文件，改造说明
- `avatar-maker-backend/README.md` - 后端服务文档

### 5. 启动脚本 🚀

创建了 `start.sh` 脚本，用于一键启动前后端服务。

```bash
chmod +x start.sh
./start.sh
```

## 数据流对比

### 改造前 ❌
```
浏览器 → AI API (跨域错误！)
```

### 改造后 ✅
```
浏览器 → 本地后端 (http://localhost:3001) → AI API
```

## 用户配置存储位置

### 依然保存在客户端 ✅

```typescript
// storageService.ts 没有改变
export class StorageService {
  static saveModelConfig(config: ModelConfig): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }
}
```

**配置内容**：
- `baseURL`: AI API 地址
- `apiToken`: API 密钥
- `modelName`: 模型名称

**存储位置**：浏览器 localStorage

**传递方式**：每次请求时从 localStorage 读取，随请求体发送到后端

## 安全性提升

| 方面 | 改造前 | 改造后 |
|------|--------|--------|
| 跨域问题 | ❌ CORS 错误 | ✅ 通过代理解决 |
| API Token | 🔒 客户端存储 | 🔒 客户端存储（不变） |
| 数据传输 | ⚠️ 直接传输 | ✅ 经过自己的后端 |
| 请求验证 | ❌ 无 | ✅ 可添加验证 |

## 使用方式变化

### 用户视角：无变化 ✅

用户操作流程完全相同：
1. 配置 AI 模型参数（依然保存在浏览器）
2. 上传照片
3. 配置背景
4. 生成头像

### 开发者视角：需要启动后端

**改造前**：
```bash
cd avatar-maker-website
npm run dev
```

**改造后**：
```bash
# 方式 1：使用启动脚本
./start.sh

# 方式 2：分别启动
# 终端 1
cd avatar-maker-backend
npm run dev

# 终端 2
cd avatar-maker-website
npm run dev
```

## 端口分配

| 服务 | 端口 | URL |
|------|------|-----|
| 前端应用 | 5173 | http://localhost:5173 |
| 后端服务 | 3001 | http://localhost:3001 |

## 后续优化建议

### 短期
1. ✅ 添加请求日志
2. ✅ 优化错误处理
3. ⏳ 添加请求频率限制

### 中期
1. ⏳ 添加缓存机制
2. ⏳ 支持多个 AI API 供应商
3. ⏳ 添加图片压缩功能

### 长期
1. ⏳ 用户认证系统
2. ⏳ 历史记录功能
3. ⏳ 批量处理功能

## 测试验证

### 1. 后端健康检查
```bash
curl http://localhost:3001/health
# 应返回: {"status":"ok","message":"Avatar Maker Backend is running"}
```

### 2. 前端访问
浏览器访问 `http://localhost:5173`，应能正常加载页面。

### 3. 完整流程测试
1. 打开前端页面
2. 配置 AI 模型参数
3. 上传照片
4. 点击生成头像
5. 检查浏览器开发者工具 Network 标签：
   - 请求应发送到 `http://localhost:3001/api/generate`
   - 不应看到跨域错误

## 注意事项

1. **必须先启动后端**：前端依赖后端服务，启动顺序很重要
2. **环境变量**：确保 `.env` 文件配置正确
3. **端口占用**：确保 3001 和 5173 端口未被占用
4. **Node.js 版本**：需要 Node.js >= 16

## 回滚方案

如果需要回退到直接调用 AI API（仅限开发环境）：

1. 修改 `apiService.ts`，恢复直接调用逻辑
2. 配置浏览器允许跨域（开发环境）
3. 或使用浏览器插件禁用 CORS

**不推荐**：生产环境应始终使用后端代理方案。
