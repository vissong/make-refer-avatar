# 使用指南 📖

## ✅ 系统验证成功

你的系统已经**正常运行**！测试结果：
- ✅ 后端服务运行正常（端口 3001）
- ✅ 前端应用运行正常（端口 5173）
- ✅ API 路由配置正确（`/api/generate`）
- ✅ 跨域问题已解决
- ✅ 前后端通信正常

## 🎯 完整使用流程

### 第 1 步：确保服务运行

检查两个服务是否都在运行：

```bash
# 检查后端（应返回成功信息）
curl http://localhost:3001/health

# 检查前端（在浏览器打开应看到页面）
# http://localhost:5173
```

如果服务未运行，使用启动脚本：
```bash
./start.sh
```

### 第 2 步：配置 AI 模型

1. 打开浏览器访问 http://localhost:5173
2. 点击右上角的**设置图标**（⚙️ 齿轮图标）
3. 填写以下信息：

#### 配置示例（使用 Google Gemini）

```
Base URL: https://generativelanguage.googleapis.com
API Token: 你的 Gemini API 密钥
Model Name: gemini-2.0-flash-exp
```

#### 配置示例（使用 OpenAI）

```
Base URL: https://api.openai.com
API Token: sk-你的OpenAI密钥
Model Name: gpt-4-vision-preview
```

#### 配置示例（使用其他兼容 OpenAI 格式的 API）

```
Base URL: https://your-api-endpoint.com
API Token: 你的 API 密钥
Model Name: 支持视觉的模型名称
```

4. 点击**保存配置**

**重要提示**：
- ✅ Base URL **不要**包含 `/v1/chat/completions`，后端会自动添加
- ✅ 确保模型支持图像输入（视觉模型）
- ✅ API Token 需要有足够的配额

### 第 3 步：准备图片

#### 用户照片
- 建议使用清晰的人像照片
- 格式支持：JPG, PNG, WebP
- 大小建议：< 5MB
- 最佳效果：正面照、光线充足、背景简单

#### 参考风格图片
系统默认使用项目中的参考图片（位于 `public/` 目录）

### 第 4 步：生成头像

1. **上传照片**
   - 在左侧区域点击或拖拽上传你的照片
   - 等待预览显示

2. **配置背景**（可选）
   - 选择背景类型：
     - **纯色背景**：选择一个颜色
     - **自动背景**：让 AI 自动生成
   - 填写背景元素（如："简约"、"梦幻"、"科技感"）

3. **点击生成头像**
   - 等待 AI 处理（通常需要 10-30 秒）
   - 生成完成后，头像会显示在右侧

4. **下载头像**
   - 点击**下载头像**按钮保存图片

## 🔍 常见问题解答

### Q1: 点击生成后没有反应？

**检查清单**：
1. 打开浏览器开发者工具（F12）→ Console 标签
2. 查看是否有错误信息
3. 切换到 Network 标签，查看 `/api/generate` 请求
4. 检查是否已保存 AI 模型配置

### Q2: 提示"网络错误，请检查后端服务是否启动"

**解决方案**：
```bash
# 检查后端是否运行
curl http://localhost:3001/health

# 如果没有响应，启动后端
cd avatar-maker-backend
npm run dev
```

### Q3: 提示"生成失败，请检查配置"

**可能原因**：
- ❌ API Token 不正确或已过期
- ❌ Base URL 格式错误
- ❌ 模型名称不支持视觉功能
- ❌ API 配额不足

**解决方案**：
1. 重新检查 API 配置
2. 测试 API 是否可用（使用 curl 或 Postman）
3. 查看后端终端的详细错误信息

### Q4: 返回 500 错误

**检查后端日志**：
在运行 `npm run dev` 的终端查看详细错误信息。

常见错误：
- `ENOTFOUND`: DNS 解析失败，检查 Base URL
- `ETIMEDOUT`: 请求超时，检查网络连接
- `401 Unauthorized`: API Token 无效
- `429 Too Many Requests`: API 配额用完

### Q5: 生成的图片质量不好？

**优化建议**：
1. 使用高质量的用户照片
2. 尝试不同的背景配置
3. 调整背景元素描述，更具体一些
4. 尝试不同的 AI 模型

## 🧪 测试功能

### 使用测试页面

访问 http://localhost:5173/test-api.html

按顺序点击测试按钮：
1. ✅ 测试健康检查 - 应返回 `status: "ok"`
2. ✅ 检查环境变量 - 确认 BACKEND_URL 正确
3. ✅ 测试生成接口 - 应返回 500（使用测试数据是正常的）

### 使用 curl 测试

```bash
# 健康检查
curl http://localhost:3001/health

# 测试生成接口（会失败，但证明接口工作）
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "modelConfig": {
      "baseURL": "test",
      "apiToken": "test",
      "modelName": "test"
    },
    "generateRequest": {
      "userImage": "test",
      "referenceImage": "test",
      "background": {"type": "color"}
    }
  }'
```

## 📊 数据流程说明

```
1. 用户在浏览器配置 AI 模型参数
   ↓
2. 配置保存到 localStorage（浏览器本地存储）
   ↓
3. 用户上传照片 → 转换为 base64
   ↓
4. 用户点击"生成头像"
   ↓
5. 前端从 localStorage 读取配置
   ↓
6. 前端发送请求到后端：
   POST http://localhost:3001/api/generate
   Body: { modelConfig, generateRequest }
   ↓
7. 后端接收请求，提取配置
   ↓
8. 后端调用 AI API：
   POST {baseURL}/v1/chat/completions
   Header: Authorization: Bearer {apiToken}
   ↓
9. AI 处理并返回结果
   ↓
10. 后端转发结果给前端
   ↓
11. 前端显示生成的头像
```

## 🎨 使用技巧

### 获得更好的效果

1. **照片质量**
   - 使用高分辨率照片
   - 确保面部清晰可见
   - 光线充足、无阴影

2. **背景配置**
   - 纯色背景：适合专业、简洁的风格
   - 自动背景：让 AI 发挥创意
   - 背景元素：
     - "极简" - 简约风格
     - "梦幻、星空" - 浪漫风格
     - "科技、未来" - 科技感
     - "水彩、艺术" - 艺术风格

3. **多次尝试**
   - AI 生成有随机性，可以多试几次
   - 尝试不同的背景描述
   - 对比不同结果，选择最佳的

## 💾 数据管理

### 查看保存的配置

```javascript
// 在浏览器控制台（F12 → Console）执行
localStorage.getItem('avatar_maker_model_config')
```

### 清除配置（重新开始）

```javascript
// 在浏览器控制台执行
localStorage.removeItem('avatar_maker_model_config')
// 然后刷新页面
```

### 备份配置

```javascript
// 导出配置
const config = localStorage.getItem('avatar_maker_model_config');
console.log(config); // 复制保存

// 导入配置
localStorage.setItem('avatar_maker_model_config', '粘贴的配置JSON');
```

## 🔐 隐私说明

- ✅ **API 配置**保存在你的浏览器本地，不会上传到服务器
- ✅ **上传的照片**只在内存中处理，不会保存
- ✅ **生成的头像**只显示在浏览器，可自行下载保存
- ⚠️ 照片会发送到你配置的 AI API 服务商（Google/OpenAI 等）

## 🚀 下一步

现在你可以：
1. ✅ 配置你的 AI API 密钥
2. ✅ 上传照片开始生成头像
3. ✅ 尝试不同的风格和配置
4. ✅ 分享给朋友使用

## 📚 相关文档

- **快速参考**：`QUICK_REFERENCE.md` - 常用命令和操作
- **测试指南**：`TEST.md` - 详细的测试步骤
- **架构说明**：`ARCHITECTURE.md` - 技术架构文档
- **部署指南**：`DEPLOYMENT.md` - 生产环境部署

## 🆘 需要帮助？

如果遇到问题：
1. 查看浏览器控制台的错误信息
2. 查看后端终端的日志输出
3. 参考 `TEST.md` 进行排查
4. 检查 AI API 是否正常工作

---

**祝你使用愉快！🎉**
