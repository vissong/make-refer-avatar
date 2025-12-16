# 快速参考手册 🚀

## 📍 服务地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端应用 | http://localhost:5173 | React 应用主页面 |
| 后端服务 | http://localhost:3001 | Express 代理服务 |
| 健康检查 | http://localhost:3001/health | 后端状态检查 |

## ⚡ 常用命令

### 启动服务
```bash
# 一键启动（推荐）
./start.sh

# 或者分别启动：
# 终端 1 - 后端
cd avatar-maker-backend && npm run dev

# 终端 2 - 前端
cd avatar-maker-website && npm run dev
```

### 停止服务
```bash
# 在运行的终端按 Ctrl+C
# 或强制停止：
lsof -ti:3001 | xargs kill -9  # 停止后端
lsof -ti:5173 | xargs kill -9  # 停止前端
```

### 健康检查
```bash
curl http://localhost:3001/health
```

### 查看日志
```bash
# 查看后端进程
ps aux | grep "node src/index.js"

# 查看前端进程
ps aux | grep vite
```

## 📂 关键文件路径

```
# 前端
avatar-maker-website/src/services/apiService.ts    # API 调用逻辑
avatar-maker-website/src/services/storageService.ts # 配置存储
avatar-maker-website/.env                          # 环境变量

# 后端
avatar-maker-backend/src/index.js                  # Express 服务器

# 配置
.env                                               # 环境变量
start.sh                                           # 启动脚本
```

## 🔧 环境变量

### 前端 (.env)
```bash
VITE_BACKEND_URL=http://localhost:3001
```

### 后端 (可选)
```bash
PORT=3001
```

## 🎯 使用流程

1. **启动服务**
   ```bash
   ./start.sh
   ```

2. **打开浏览器**
   访问 http://localhost:5173

3. **配置 AI 模型**
   - 点击右上角设置图标
   - 填写 Base URL、API Token、Model Name
   - 点击保存

4. **生成头像**
   - 上传照片
   - 配置背景
   - 点击生成

## 🐛 快速排查

### 问题：跨域错误
```bash
# 检查后端是否运行
curl http://localhost:3001/health
# 如果失败，启动后端
cd avatar-maker-backend && npm run dev
```

### 问题：前端连接失败
```bash
# 检查 .env 配置
cat avatar-maker-website/.env
# 应该显示：VITE_BACKEND_URL=http://localhost:3001

# 重启前端
lsof -ti:5173 | xargs kill -9
cd avatar-maker-website && npm run dev
```

### 问题：端口被占用
```bash
# 查看端口占用
lsof -i:3001  # 后端
lsof -i:5173  # 前端

# 杀死进程
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

## 📊 API 请求流程

```
浏览器
  ↓ POST http://localhost:3001/api/generate
  ↓ Body: { modelConfig, generateRequest }
后端服务
  ↓ POST {baseURL}/v1/chat/completions
  ↓ Header: Authorization: Bearer {apiToken}
AI API
  ↓ 返回生成结果
后端服务
  ↓ 转发给浏览器
浏览器显示结果
```

## 💾 数据存储位置

| 数据 | 位置 | 说明 |
|------|------|------|
| API 配置 | 浏览器 localStorage | baseURL, apiToken, modelName |
| 上传的图片 | 浏览器内存（base64） | 不持久化 |
| 生成的头像 | 浏览器内存 | 可下载保存 |

## 📚 文档快速链接

| 需求 | 文档 |
|------|------|
| 快速开始 | README.md |
| 架构理解 | ARCHITECTURE.md |
| 改造说明 | CHANGES.md |
| 功能测试 | TEST.md |
| 项目总结 | SUMMARY.md |
| 后端详情 | avatar-maker-backend/README.md |

## 🔑 localStorage 操作

### 查看配置
```javascript
// 在浏览器控制台执行
localStorage.getItem('avatar_maker_model_config')
```

### 手动设置配置（测试用）
```javascript
localStorage.setItem('avatar_maker_model_config', JSON.stringify({
  baseURL: 'https://your-api.com',
  apiToken: 'sk-...',
  modelName: 'model-name'
}))
```

### 清除配置
```javascript
localStorage.removeItem('avatar_maker_model_config')
```

## 🔍 调试技巧

### 查看网络请求
1. 打开浏览器 DevTools (F12)
2. 切换到 Network 标签
3. 点击"生成头像"
4. 查找 `/api/generate` 请求

### 查看请求详情
- Request URL: http://localhost:3001/api/generate
- Request Method: POST
- Request Payload: 包含 modelConfig 和 generateRequest

### 后端日志
在运行 `npm run dev` 的终端查看实时日志

## 🚨 紧急修复

### 完全重置
```bash
# 1. 停止所有服务
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# 2. 清理依赖
cd avatar-maker-backend && rm -rf node_modules
cd ../avatar-maker-website && rm -rf node_modules

# 3. 重新安装
cd ../avatar-maker-backend && npm install
cd ../avatar-maker-website && npm install

# 4. 重启
cd .. && ./start.sh
```

### 清除浏览器缓存
1. 打开 DevTools (F12)
2. 右键刷新按钮
3. 选择"清空缓存并硬性重新加载"

## ✅ 验证清单

- [ ] 后端服务运行在 3001 端口
- [ ] 前端服务运行在 5173 端口
- [ ] 健康检查返回 OK
- [ ] 浏览器能打开前端页面
- [ ] 能配置并保存 AI 模型参数
- [ ] 能上传照片
- [ ] 点击生成时请求发送到本地后端
- [ ] 无跨域错误

## 🎓 学习资源

### 关键技术点
- **CORS 跨域**：理解浏览器同源策略
- **代理模式**：后端作为请求代理
- **localStorage**：客户端数据存储
- **base64 编码**：图片数据传输
- **React Hooks**：状态管理

### 代码示例位置
- API 调用：`avatar-maker-website/src/services/apiService.ts`
- 代理服务：`avatar-maker-backend/src/index.js`
- 配置存储：`avatar-maker-website/src/services/storageService.ts`

---

💡 **提示**：将此文档添加到收藏夹，方便随时查阅！
