# API 配置指南 🔧

## 🚨 错误："Not Found"

这个错误通常表示 **API 端点不正确** 或 **模型名称错误**。

## 📋 常见 AI API 配置

### 1. Google Gemini API

#### 方式 A：使用 Gemini API（推荐）

```
Base URL: https://generativelanguage.googleapis.com/v1beta
API Token: 你的 API 密钥（从 Google AI Studio 获取）
Model Name: gemini-2.0-flash-exp
```

**注意**：
- ⚠️ Base URL 使用 `/v1beta` 而不是默认的 `/v1`
- ⚠️ Gemini API 的端点可能是 `/models/{model}:generateContent`

#### Gemini API 特殊处理

由于 Gemini 使用不同的 API 格式，我们需要修改后端代码。

**临时解决方案**：使用 OpenAI 兼容的代理服务

### 2. OpenAI API

```
Base URL: https://api.openai.com
API Token: sk-开头的密钥
Model Name: gpt-4-vision-preview
```

或使用更新的模型：
```
Model Name: gpt-4-turbo
Model Name: gpt-4o
```

### 3. Azure OpenAI

```
Base URL: https://你的资源名.openai.azure.com
API Token: 你的 Azure API 密钥
Model Name: 你的部署名称
```

**注意**：Azure OpenAI 还需要 API 版本参数，需要特殊处理。

### 4. 其他兼容 OpenAI 格式的 API

很多第三方服务提供 OpenAI 兼容的 API：

#### DeepSeek
```
Base URL: https://api.deepseek.com
API Token: 你的 DeepSeek 密钥
Model Name: deepseek-chat
```

#### Moonshot (月之暗面)
```
Base URL: https://api.moonshot.cn
API Token: 你的 Moonshot 密钥
Model Name: moonshot-v1-8k
```

#### 智谱 AI (GLM)
```
Base URL: https://open.bigmodel.cn/api/paas/v4
API Token: 你的智谱 API 密钥
Model Name: glm-4v
```

## 🔍 排查步骤

### 第 1 步：检查 Base URL

**正确格式**：
- ✅ `https://api.openai.com`
- ✅ `https://generativelanguage.googleapis.com/v1beta`
- ❌ ~~`https://api.openai.com/v1/chat/completions`~~（不要包含具体路径）

**验证方法**：
```bash
# 测试 OpenAI
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer 你的密钥"

# 应该返回模型列表
```

### 第 2 步：检查 API Token

**格式检查**：
- OpenAI: `sk-` 开头
- Gemini: 一串随机字符
- 其他：查看官方文档

**验证方法**：
```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 你的密钥" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### 第 3 步：检查 Model Name

**常见错误**：
- ❌ 模型名称拼写错误
- ❌ 使用了不支持视觉的模型
- ❌ 使用了已废弃的模型

**支持视觉的模型**：
- OpenAI: `gpt-4-vision-preview`, `gpt-4-turbo`, `gpt-4o`
- Gemini: `gemini-2.0-flash-exp`, `gemini-pro-vision`
- Claude: `claude-3-opus`, `claude-3-sonnet`

### 第 4 步：查看后端日志

重启后端后，查看终端输出：

```bash
cd avatar-maker-backend
npm run dev
```

当你点击"生成头像"时，会看到：
```
调用 AI API: https://...
使用模型: ...
AI API 响应状态: 404
AI API Error: ...
```

根据日志信息调整配置。

## 🛠️ 针对不同 API 的修复方案

### 方案 A：使用 OpenAI API（推荐，最简单）

1. 注册 OpenAI 账号：https://platform.openai.com
2. 创建 API Key
3. 配置：
   ```
   Base URL: https://api.openai.com
   API Token: sk-你的密钥
   Model Name: gpt-4-vision-preview
   ```

### 方案 B：修改后端支持 Gemini

由于 Gemini API 格式不同，需要修改后端代码。我可以帮你创建一个支持 Gemini 的版本。

### 方案 C：使用 OpenAI 兼容代理

使用第三方代理服务，将 Gemini API 转换为 OpenAI 格式。

## 📝 测试你的 API 配置

### 使用 curl 测试

```bash
# 替换以下变量
BASE_URL="你的 Base URL"
API_TOKEN="你的 API Token"
MODEL_NAME="你的 Model Name"

# 测试调用
curl -X POST "${BASE_URL}/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -d '{
    "model": "'${MODEL_NAME}'",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "描述这张图片"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
            }
          }
        ]
      }
    ]
  }'
```

### 预期结果

**成功**：
```json
{
  "choices": [
    {
      "message": {
        "content": "这是一张..."
      }
    }
  ]
}
```

**失败 - 404 Not Found**：
```json
{
  "error": {
    "message": "The model does not exist",
    "type": "invalid_request_error"
  }
}
```
→ 检查 Model Name 是否正确

**失败 - 401 Unauthorized**：
```json
{
  "error": {
    "message": "Incorrect API key provided"
  }
}
```
→ 检查 API Token 是否正确

**失败 - 404 URL Not Found**：
```
Cannot POST /v1/chat/completions
```
→ 检查 Base URL 是否正确

## 🎯 快速解决方案

### 选项 1：使用免费的测试 API

如果你只是想测试功能，可以使用一些提供免费额度的服务：

1. **Hugging Face Inference API**
2. **Replicate API**
3. **各种开源模型部署**

### 选项 2：告诉我你使用的是哪个 API

请告诉我：
1. 你使用的是哪个 AI 服务？（OpenAI / Gemini / 其他）
2. 你填写的 Base URL 是什么？
3. 你填写的 Model Name 是什么？
4. 后端终端显示的完整错误日志

我会帮你针对性地解决问题。

## 📞 需要帮助？

### 提供以下信息

1. **使用的 AI 服务**：OpenAI / Gemini / Azure / 其他
2. **Base URL**：（可以隐藏域名中间部分）
3. **Model Name**：具体的模型名称
4. **错误日志**：后端终端的完整输出
5. **测试结果**：使用 curl 测试的结果

### 下一步

先尝试：
1. ✅ 重启后端服务
2. ✅ 在前端重新配置 API
3. ✅ 查看后端日志
4. ✅ 告诉我具体的错误信息

---

**提示**：最简单的方案是使用 OpenAI API，格式最标准，兼容性最好。
