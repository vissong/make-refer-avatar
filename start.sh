#!/bin/bash

echo "🚀 启动 Avatar Maker 应用..."
echo ""

# 检查是否在正确的目录
if [ ! -d "avatar-maker-backend" ] || [ ! -d "avatar-maker-website" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 启动后端服务
echo "📦 启动后端服务..."
cd avatar-maker-backend
npm run dev &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 2

# 启动前端服务
echo "🎨 启动前端服务..."
cd avatar-maker-website
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ 服务启动成功！"
echo "📍 后端服务: http://localhost:3001"
echo "📍 前端服务: http://localhost:5173"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
wait
