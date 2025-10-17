#!/bin/bash

# 诗海寻踪 - 本地开发环境启动脚本

echo "🚀 启动诗海寻踪本地开发环境..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

# 检查Docker Compose是否可用
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 创建本地环境变量文件
if [ ! -f ".env.local" ]; then
    echo "📝 创建本地环境变量文件..."
    cat > .env.local << EOF
# 本地开发环境配置
VITE_SUPABASE_URL=http://localhost:5432
VITE_SUPABASE_ANON_KEY=local-dev-key
VITE_APP_ENV=development

# 本地Edge Function模拟
VITE_EDGE_FUNCTION_URL=http://localhost:9999

# 测试用AI配置（本地模拟）
OPENAI_API_KEY=test-key-local-development
EOF
    echo "✅ 本地环境变量文件已创建"
fi

# 启动Docker服务
echo "🐳 启动Docker容器..."
docker-compose -f docker-compose.local.yml up -d

# 等待数据库启动
echo "⏳ 等待数据库启动..."
sleep 10

# 执行数据库迁移
echo "🗃️ 执行数据库迁移..."
docker exec poem-db psql -U postgres -d poem_ai -f /docker-entrypoint-initdb.d/001_create_tables.sql
docker exec poem-db psql -U postgres -d poem_ai -f /docker-entrypoint-initdb.d/002_rls_policies.sql
docker exec poem-db psql -U postgres -d poem_ai -f /docker-entrypoint-initdb.d/001b_simple_search.sql

echo "✅ 本地开发环境启动完成！"
echo ""
echo "📊 服务访问地址："
echo "  前端应用: http://localhost:5173"
echo "  数据库管理: http://localhost:8080 (账号: admin@poem.ai / 密码: admin123)"
echo "  Edge Functions: http://localhost:9999"
echo ""
echo "🔧 管理命令："
echo "  查看日志: docker-compose -f docker-compose.local.yml logs"
echo "  停止服务: docker-compose -f docker-compose.local.yml down"
echo "  重启服务: docker-compose -f docker-compose.local.yml restart"