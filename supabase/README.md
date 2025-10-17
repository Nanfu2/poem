# Supabase 服务端配置指南

## 项目结构
```
supabase/
├── migrations/                 # 数据库迁移文件
│   └── 001_create_tables.sql # 初始表结构
├── functions/                 # Edge Functions
│   └── generate-poem-analysis/
│       └── index.ts          # AI赏析功能
└── README.md                 # 本文件
```

## 部署步骤

### 1. 创建Supabase项目
1. 访问 [Supabase官网](https://supabase.com) 注册账号
2. 创建新项目，选择合适的地域
3. 获取项目URL和API密钥

### 2. 配置环境变量
在Supabase项目设置中配置以下环境变量：
- `SUPABASE_ANON_KEY`: 项目的匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY`: 服务角色密钥（用于数据库操作）
- `OPENAI_API_KEY`: 您的OpenAI API密钥（可选，也可以在configs表中配置）

### 3. 执行数据库迁移
使用Supabase CLI或在线SQL编辑器执行 `migrations/001_create_tables.sql`

### 4. 部署Edge Function
```bash
# 安装Supabase CLI
npm install -g supabase

# 登录并部署
supabase login
supabase functions deploy generate-poem-analysis
```

## 数据库表说明

### poems (诗词表)
- `id`: 主键
- `title`: 诗词标题
- `author`: 作者
- `dynasty`: 朝代
- `content`: 诗词内容（用\n分隔）
- `background`: 创作背景（可选）

### ai_analyses (AI赏析缓存表)
- `poem_id`: 关联诗词ID
- `analysis_content`: AI生成的赏析内容
- `ai_model`: 使用的AI模型
- 唯一索引：(poem_id, ai_model) 避免重复生成

### configs (配置表)
- `key`: 配置键名
- `value`: 配置值
- 存储AI API密钥等敏感信息

## Edge Function功能

### generate-poem-analysis
**功能**: 处理AI赏析和问答请求

**请求体**:
```json
{
  "poem_id": 1,
  "poem_content": "诗歌内容",
  "title": "诗歌标题", 
  "author": "作者",
  "question": "可选问题"
}
```

**响应**:
- 赏析请求: `{ "analysis": "赏析内容", "cached": true/false }`
- 问答请求: `{ "answer": "回答内容" }`

## 安全配置

1. **RLS策略**: 为表配置行级安全策略
2. **API密钥保护**: AI密钥存储在configs表，不暴露给前端
3. **请求验证**: Edge Function验证必要参数
4. **错误处理**: 完善的错误处理和日志记录

## 测试数据

迁移文件已包含3首示例诗词：
1. 李白《静夜思》
2. 孟浩然《春晓》 
3. 王之涣《登鹳雀楼》