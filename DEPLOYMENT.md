# 生产环境部署指南

## 🎯 部署概述

本指南介绍如何将 AI 头像生成器部署到生产环境。

## 📋 部署前检查清单

- [ ] Node.js >= 16 已安装
- [ ] 有可用的服务器（VPS/云服务器）
- [ ] 域名已配置（可选，建议使用）
- [ ] SSL 证书已准备（HTTPS）
- [ ] AI API 已测试可用

## 🏗️ 架构选择

### 方案 1：单服务器部署（推荐小型项目）
```
Nginx (反向代理 + 静态文件)
  ├── 前端静态文件 (dist/)
  └── 后端服务 (:3001)
```

### 方案 2：分离部署（推荐生产环境）
```
前端：部署到 CDN（Vercel/Netlify/CloudFlare Pages）
后端：部署到服务器（PM2 + Nginx）
```

## 📦 构建生产版本

### 1. 构建前端
```bash
cd avatar-maker-website

# 设置生产环境变量
echo "VITE_BACKEND_URL=https://api.yourdomain.com" > .env.production

# 构建
npm run build

# 输出目录：dist/
```

### 2. 准备后端
```bash
cd avatar-maker-backend

# 安装生产依赖（去除开发依赖）
npm ci --only=production

# 或使用 package.json
npm install --production
```

## 🚀 部署步骤

### 方案 1：单服务器部署

#### 步骤 1：上传文件
```bash
# 使用 scp 或 rsync 上传
rsync -avz avatar-maker-backend/ user@server:/var/www/avatar-backend/
rsync -avz avatar-maker-website/dist/ user@server:/var/www/avatar-frontend/
```

#### 步骤 2：安装 PM2
```bash
# SSH 登录服务器
ssh user@server

# 安装 PM2
npm install -g pm2
```

#### 步骤 3：启动后端服务
```bash
cd /var/www/avatar-backend

# 创建 PM2 配置文件
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'avatar-backend',
    script: './src/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
EOF

# 启动服务
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 步骤 4：配置 Nginx
```bash
# 创建 Nginx 配置
sudo nano /etc/nginx/sites-available/avatar-maker

# 粘贴以下配置：
```

```nginx
# 前端服务
server {
    listen 80;
    server_name yourdomain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL 证书配置
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 前端静态文件
    root /var/www/avatar-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}

# 后端 API 服务
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL 证书
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置（AI 生成可能需要较长时间）
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/avatar-maker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 步骤 5：更新前端环境变量
```bash
# 修改前端 .env.production（重新构建）
VITE_BACKEND_URL=https://api.yourdomain.com
```

### 方案 2：CDN + 服务器分离部署

#### 前端部署到 Vercel
```bash
cd avatar-maker-website

# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod

# 设置环境变量（在 Vercel Dashboard）
VITE_BACKEND_URL=https://api.yourdomain.com
```

#### 后端部署到服务器
同方案 1 的步骤 2-3

## 🔒 安全加固

### 1. 添加请求限流
```javascript
// avatar-maker-backend/src/index.js
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 最多 100 次请求
  message: '请求过于频繁，请稍后再试'
});

app.use('/api/', limiter);
```

安装依赖：
```bash
npm install express-rate-limit
```

### 2. 添加 CORS 白名单
```javascript
// avatar-maker-backend/src/index.js
const corsOptions = {
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com'
  ],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 3. 添加请求验证
```javascript
// avatar-maker-backend/src/index.js
app.post('/api/generate', (req, res, next) => {
  const { modelConfig, generateRequest } = req.body;
  
  // 验证必需字段
  if (!modelConfig?.baseURL || !modelConfig?.apiToken) {
    return res.status(400).json({
      success: false,
      error: '无效的请求参数'
    });
  }
  
  next();
}, async (req, res) => {
  // ... 原有逻辑
});
```

### 4. 环境变量管理
```bash
# 在服务器上设置
export NODE_ENV=production
export PORT=3001
export MAX_REQUEST_SIZE=50mb
```

或使用 `.env` 文件：
```bash
# avatar-maker-backend/.env
NODE_ENV=production
PORT=3001
MAX_REQUEST_SIZE=50mb
```

安装 dotenv：
```bash
npm install dotenv
```

修改 `index.js`：
```javascript
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3001;
```

## 📊 监控和日志

### 1. PM2 监控
```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs avatar-backend

# 重启
pm2 restart avatar-backend

# 停止
pm2 stop avatar-backend
```

### 2. 配置日志文件
```javascript
// avatar-maker-backend/src/index.js
import fs from 'fs';
import path from 'path';

// 创建日志目录
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 日志中间件
app.use((req, res, next) => {
  const log = `${new Date().toISOString()} ${req.method} ${req.path}\n`;
  fs.appendFile(path.join(logDir, 'access.log'), log, () => {});
  next();
});
```

### 3. 错误监控
考虑使用：
- Sentry（错误追踪）
- DataDog（性能监控）
- LogRocket（用户会话回放）

## 🔄 更新部署

### 前端更新
```bash
cd avatar-maker-website
git pull
npm run build

# 上传新的 dist 文件
rsync -avz dist/ user@server:/var/www/avatar-frontend/
```

### 后端更新
```bash
cd avatar-maker-backend
git pull
npm install --production

# 上传到服务器
rsync -avz . user@server:/var/www/avatar-backend/

# 重启服务
ssh user@server "cd /var/www/avatar-backend && pm2 restart avatar-backend"
```

## 🧪 生产环境测试

### 1. 健康检查
```bash
curl https://api.yourdomain.com/health
```

### 2. API 测试
```bash
curl -X POST https://api.yourdomain.com/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "modelConfig": {...},
    "generateRequest": {...}
  }'
```

### 3. 前端访问
访问 https://yourdomain.com

## 📈 性能优化

### 1. 前端优化
- ✅ 代码分割（Vite 自动处理）
- ✅ 图片压缩
- ✅ Gzip 压缩（Nginx）
- ✅ CDN 加速
- ⏳ Service Worker（PWA）

### 2. 后端优化
- ✅ 集群模式（PM2）
- ⏳ Redis 缓存
- ⏳ 数据库连接池
- ⏳ 队列处理

### 3. Nginx 缓存
```nginx
# 静态资源缓存
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🆘 故障排查

### 后端无法启动
```bash
# 查看 PM2 日志
pm2 logs avatar-backend --lines 100

# 查看端口占用
netstat -tlnp | grep 3001

# 查看进程
ps aux | grep node
```

### 前端 404 错误
```bash
# 检查文件权限
ls -la /var/www/avatar-frontend

# 检查 Nginx 配置
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### CORS 错误
检查 Nginx 和后端的 CORS 配置是否一致

## 💰 成本估算

### 小型项目（< 1000 用户/天）
- 服务器：$5-10/月（VPS）
- 域名：$10-15/年
- SSL 证书：免费（Let's Encrypt）
- **总计**：~$10/月

### 中型项目（1000-10000 用户/天）
- 服务器：$20-50/月（云服务器）
- CDN：$0-20/月
- 域名：$10-15/年
- **总计**：~$40/月

### 大型项目（> 10000 用户/天）
- 负载均衡：$10-30/月
- 多服务器：$100-300/月
- CDN：$50-200/月
- 监控服务：$20-50/月
- **总计**：~$300/月

## 📚 相关资源

- [PM2 文档](https://pm2.keymetrics.io/)
- [Nginx 文档](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Vercel 文档](https://vercel.com/docs)
- [Netlify 文档](https://docs.netlify.com/)

---

**最后更新**：2025-12-16
