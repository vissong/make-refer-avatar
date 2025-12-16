# 日志控制说明

## 日志级别

后端服务支持 4 种日志级别：

| 级别 | 说明 | 输出内容 |
|------|------|----------|
| `none` | 完全静默 | 不输出任何日志（仅写入文件） |
| `error` | 仅错误 | 只输出错误信息 |
| `warn` | 警告模式 | 输出警告和错误 |
| `info` | 标准模式（默认） | 输出基本信息、警告和错误 |
| `debug` | 调试模式 | 输出所有详细信息，包括完整的 API 请求/响应 |

## 启动方式

### 1. 使用 npm 脚本（推荐）

```bash
# 默认模式（info）
npm start

# 调试模式（详细日志）
npm run start:debug

# 静默模式（仅错误）
npm run start:silent

# 完全静默
npm run start:quiet
```

### 2. 使用命令行参数

```bash
# 默认模式
node src/index.js

# 调试模式
node src/index.js --log-level=debug

# 其他级别
node src/index.js --log-level=error
node src/index.js --log-level=warn
node src/index.js --log-level=info
node src/index.js --log-level=none
```

### 3. 使用环境变量

```bash
# Unix/Linux/macOS
LOG_LEVEL=debug npm start
LOG_LEVEL=error node src/index.js

# Windows (PowerShell)
$env:LOG_LEVEL="debug"; npm start

# Windows (CMD)
set LOG_LEVEL=debug && npm start
```

## 新增功能说明

### 1. finish_reason 检查

服务现在会检查 AI 返回的 `native_finish_reason` 字段：

- ✅ 如果是 `STOP`（不区分大小写）：正常返回图片
- ❌ 如果是其他值（如 `LENGTH`, `CONTENT_FILTER` 等）：返回错误提示

**错误示例：**
```json
{
  "success": false,
  "imageUrl": "",
  "error": "AI 生成未正常完成。原因: CONTENT_FILTER"
}
```

常见的 `native_finish_reason` 值：
- `STOP`: 正常完成
- `LENGTH`: Token 数量超限
- `CONTENT_FILTER`: 内容被过滤
- `SAFETY`: 安全原因被拦截
- `RECITATION`: 复述检测

### 2. 日志文件写入优化

根据日志级别控制文件写入：

| 文件类型 | 写入条件 |
|---------|---------|
| `request.json` | 仅 debug 模式 |
| `ai_request.json` | 仅 debug 模式 |
| `ai_response.json` | 仅 debug 模式 |
| `final_result.json` | 仅 debug 模式 |
| `ai_error_response.json` | 总是写入 |
| `parse_error.json` | 总是写入 |
| `finish_reason_error.json` | 总是写入 |
| `exception.json` | 总是写入 |

## 使用建议

### 开发调试时
```bash
npm run start:debug
```
输出完整的请求/响应信息，所有日志文件都会保存。

### 生产环境
```bash
npm start
```
或
```bash
npm run start:silent
```
减少控制台输出，提高性能，仅在出错时写入日志文件。

### 性能测试
```bash
npm run start:quiet
```
完全静默模式，减少 I/O 开销。

## 日志文件位置

所有日志文件保存在：
```
avatar-maker-backend/logs/
```

文件命名格式：
```
2025-12-16T15-38-40.389Z_<类型>.json
```

## 示例

### 查看实时日志（debug 模式）
```bash
npm run start:debug
```

输出：
```
🚀 Avatar Maker Backend server is running on http://localhost:3001
📍 Health check: http://localhost:3001/health
📍 API endpoint: http://localhost:3001/api/generate
📁 日志目录: /path/to/logs
📊 日志级别: DEBUG

收到生成请求
📋 Message object keys: ['role', 'content', 'images']
📸 Image data type: object
📸 Image data structure: ['image_url']
✅ Extracted from: choices[0].message.images[0].image_url.url
📸 Image format: base64
📝 Content preview (first 200 chars): data:image/png;base64,iVBORw0KGg...
✅ Already a valid data URI
```

### 生产环境（info 模式）
```bash
npm start
```

输出：
```
🚀 Avatar Maker Backend server is running on http://localhost:3001
📍 Health check: http://localhost:3001/health
📍 API endpoint: http://localhost:3001/api/generate
📁 日志目录: /path/to/logs
📊 日志级别: INFO

2025-12-16T15:38:40.389Z - POST /api/generate
收到生成请求
```
