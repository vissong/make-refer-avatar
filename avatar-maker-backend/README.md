# Avatar Maker Backend

AI 头像生成器的后端代理服务，用于解决跨域问题。

## 功能

- 代理 AI 模型 API 请求，避免前端跨域问题
- 支持大图片 base64 数据传输（最大 50MB）
- 用户的 API 配置依然保存在客户端本地存储中

## 安装

```bash
npm install
```

## 运行

```bash
npm run dev
```

服务默认运行在 `http://localhost:3001`

## API 接口

### POST /api/generate

生成 AI 头像

**请求体：**
```json
{
  "modelConfig": {
    "baseURL": "https://api.example.com",
    "apiToken": "your-api-token",
    "modelName": "model-name"
  },
  "generateRequest": {
    "userImage": "data:image/jpeg;base64,...",
    "referenceImage": "data:image/jpeg;base64,...",
    "background": {
      "type": "color",
      "color": "#ffffff",
      "elements": "简约"
    }
  }
}
```

**响应：**
```json
{
  "success": true,
  "imageUrl": "data:image/jpeg;base64,..."
}
```

### GET /health

健康检查接口

## 环境变量

- `PORT`: 服务端口（默认：3001）

## 注意事项

- 确保后端服务在前端应用之前启动
- API 配置（baseURL、apiToken、modelName）仍然保存在客户端浏览器的 localStorage 中
- 后端只负责转发请求，不存储任何用户配置或数据
