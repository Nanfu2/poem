#!/bin/bash

# Supabase 服务端部署脚本
echo "开始部署诗海寻踪Supabase服务端..."

# 检查Supabase CLI是否安装
if ! command -v supabase &> /dev/null; then
    echo "正在安装Supabase CLI..."
    npm install -g supabase-cli
fi

# 登录Supabase
echo "请登录Supabase账号..."
supabase login

# 初始化项目（如果尚未初始化）
if [ ! -f "supabase/config.toml" ]; then
    echo "初始化Supabase项目..."
    supabase init
fi

# 链接到远程项目
echo "请输入您的Supabase项目ID:"
read -r project_id

if [ -z "$project_id" ]; then
    echo "错误：项目ID不能为空"
    exit 1
fi

# 链接项目
supabase link --project-ref "$project_id"

# 部署数据库迁移
echo "部署数据库迁移..."
supabase db push

# 部署Edge Function
echo "部署Edge Function..."
supabase functions deploy generate-poem-analysis --no-verify-jwt

# 设置环境变量
echo "设置Edge Function环境变量..."
supabase secrets set OPENAI_API_KEY="your-openai-api-key-here"

echo "✅ Supabase服务端部署完成！"
echo ""
echo "下一步操作："
echo "1. 在Supabase仪表板中检查部署状态"
echo "2. 在configs表中配置您的AI API密钥"
echo "3. 测试Edge Function是否正常工作"
echo "4. 更新前端环境变量中的Supabase URL和密钥"