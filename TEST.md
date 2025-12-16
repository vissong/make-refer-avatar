# 测试指南

## 当前状态检查

### 1. 检查后端服务 ✅
```bash
curl http://localhost:3001/health
```

**期望输出**：
```json
{"status":"ok","message":"Avatar Maker Backend is running"}
```

### 2. 检查前端服务
打开浏览器访问：`http://localhost:5173`

**期望结果**：看到 AI 头像生成器的主页面

## 完整功能测试

### 测试步骤

#### 第 1 步：配置 AI 模型
1. 点击页面右上角的**设置图标**（齿轮图标）
2. 填写以下信息：
   - **Base URL**: 你的 AI API 地址（例如：`https://api.openai.com` 或 `https://generativelanguage.googleapis.com`）
   - **API Token**: 你的 API 密钥
   - **Model Name**: 模型名称（例如：`gemini-2.0-flash-exp` 或 `gpt-4-vision-preview`）
3. 点击**保存配置**

**验证**：打开浏览器控制台 → Application → Local Storage → 查看是否有 `avatar_maker_model_config` 键

#### 第 2 步：上传用户照片
1. 在**左侧区域**点击上传区域或拖拽照片
2. 选择一张人像照片
3. 等待预览显示

**验证**：左侧应显示上传的照片预览

#### 第 3 步：配置背景（可选）
1. 在**中间区域**选择背景类型：
   - **纯色背景**：可选择颜色
   - **自动背景**：AI 自动生成
2. 可填写背景元素描述（例如："简约"、"梦幻"等）

#### 第 4 步：生成头像
1. 确保已完成上述配置
2. 点击**生成头像**按钮
3. 等待生成完成（可能需要几秒到几十秒）

**验证**：右侧应显示生成的头像

#### 第 5 步：下载头像
点击**下载头像**按钮保存图片

## 开发者调试

### 查看网络请求

1. 打开浏览器开发者工具（F12）
2. 切换到 **Network** 标签
3. 点击生成头像
4. 查找以下请求：

**请求 1：前端到后端**
```
URL: http://localhost:3001/api/generate
Method: POST
Request Payload:
{
  "modelConfig": {
    "baseURL": "...",
    "apiToken": "...",
    "modelName": "..."
  },
  "generateRequest": {
    "userImage": "data:image/jpeg;base64,...",
    "referenceImage": "data:image/jpeg;base64,...",
    "background": {...}
  }
}
```

**请求 2：后端到 AI API**
（在后端控制台可以看到日志）

### 查看控制台日志

#### 浏览器控制台
- 应该看到请求和响应的日志
- 不应该有跨域错误（CORS error）

#### 后端控制台
在运行 `npm run dev` 的终端中应该能看到：
```
POST /api/generate
AI API URL: https://...
Response status: 200
```

## 常见问题排查

### 问题 1：跨域错误
**症状**：浏览器控制台显示 CORS 错误

**解决方案**：
1. 确保后端服务正在运行
2. 检查 `.env` 文件中的 `VITE_BACKEND_URL` 配置
3. 重启前端服务

### 问题 2：后端连接失败
**症状**：错误信息 "网络错误，请检查后端服务是否启动"

**解决方案**：
```bash
# 检查后端是否运行
curl http://localhost:3001/health

# 如果没有响应，启动后端
cd avatar-maker-backend
npm run dev
```

### 问题 3：API 调用失败
**症状**：错误信息 "生成失败，请检查配置"

**排查步骤**：
1. 检查 API Token 是否正确
2. 检查 Base URL 格式（应包含 `https://`）
3. 检查模型名称是否正确
4. 查看后端控制台的详细错误信息

### 问题 4：图片无法上传
**症状**：上传后没有预览

**排查步骤**：
1. 检查图片格式（支持：jpg, jpeg, png, webp）
2. 检查图片大小（建议小于 10MB）
3. 查看浏览器控制台是否有错误

## 性能测试

### 测试图片大小限制
尝试上传不同大小的图片：
- ✅ 小图片（< 1MB）：应该很快
- ✅ 中等图片（1-5MB）：正常速度
- ⚠️ 大图片（5-10MB）：较慢
- ❌ 超大图片（> 10MB）：可能失败

### 测试生成速度
记录从点击"生成"到显示结果的时间：
- 快速响应：< 10 秒
- 正常响应：10-30 秒
- 慢速响应：> 30 秒（可能是 AI API 较慢）

## 数据验证

### 检查配置存储
```javascript
// 在浏览器控制台执行
localStorage.getItem('avatar_maker_model_config')
```

**期望输出**：
```json
{"baseURL":"https://...","apiToken":"sk-...","modelName":"..."}
```

### 检查图片编码
生成的请求体中，图片应该是 base64 编码：
```
data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...
```

## 清理测试数据

### 清除本地配置
```javascript
// 在浏览器控制台执行
localStorage.removeItem('avatar_maker_model_config')
```

### 重启服务
```bash
# 停止所有服务（Ctrl+C）

# 重新启动
./start.sh
```

## 成功标准

✅ 后端服务健康检查通过  
✅ 前端页面正常加载  
✅ 可以配置并保存 AI 模型参数  
✅ 可以上传照片并预览  
✅ 可以配置背景选项  
✅ 可以成功生成头像  
✅ 可以下载生成的头像  
✅ 浏览器无跨域错误  
✅ 网络请求发送到本地后端（不是直接到 AI API）

## 下一步

如果所有测试都通过，你可以：
1. 尝试不同的照片和风格
2. 调整背景配置
3. 尝试不同的 AI 模型
4. 分享给其他用户测试

如果遇到问题，请查看：
- 浏览器控制台的错误信息
- 后端终端的日志输出
- 本文档的"常见问题排查"部分
