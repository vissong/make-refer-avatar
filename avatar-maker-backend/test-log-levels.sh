#!/bin/bash

echo "=========================================="
echo "日志级别测试脚本"
echo "=========================================="
echo ""

# 测试不同的日志级别
test_log_level() {
  local level=$1
  local description=$2
  
  echo "🧪 测试: $description"
  echo "   级别: $level"
  echo "   命令: node src/index.js --log-level=$level"
  echo ""
  echo "启动服务器（3秒后自动停止）..."
  
  # 启动服务器，3秒后自动停止
  timeout 3s node src/index.js --log-level=$level || true
  
  echo ""
  echo "----------------------------------------"
  echo ""
}

cd "$(dirname "$0")"

echo "准备测试各个日志级别..."
echo ""
sleep 1

# 测试各个级别
test_log_level "debug" "调试模式（最详细）"
test_log_level "info" "标准模式（默认）"
test_log_level "warn" "警告模式"
test_log_level "error" "错误模式"
test_log_level "none" "静默模式（无输出）"

echo "=========================================="
echo "✅ 所有测试完成"
echo "=========================================="
echo ""
echo "💡 使用建议："
echo "  开发调试: npm run start:debug"
echo "  生产环境: npm start"
echo "  完全静默: npm run start:quiet"
