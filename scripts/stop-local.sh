#!/bin/bash

# 停止本地开发环境

echo "🛑 停止诗海寻踪本地开发环境..."

# 停止Docker容器
docker-compose -f docker-compose.local.yml down

echo "✅ 本地开发环境已停止"

# 可选：清理Docker资源
read -p "是否清理Docker资源？(y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 清理Docker资源..."
    docker system prune -f
    echo "✅ 资源清理完成"
fi