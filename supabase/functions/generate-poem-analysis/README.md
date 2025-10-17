# generate-poem-analysis Edge Function

AI诗词赏析和问答功能的Edge Function实现。

## 功能描述

该函数提供两种模式：
1. **诗词赏析模式** - 生成专业的诗词赏析内容，并缓存结果
2. **问答模式** - 针对特定诗词进行问答对话

## 请求格式

### 基本请求体
```json
{
  "poem_id": 1,
  "poem_content": "床前明月光，疑是地上霜。\n举头望明月，低头思故乡。",
  "title": "静夜思",
  "author": "李白",
  "question": "这首诗表达了什么情感？"  // 可选，用于问答模式
}
```

### 响应格式

**赏析模式响应**：
```json
{
  "analysis": "专业的赏析内容...",
  "cached": true  // 指示是否来自缓存
}
```

**问答模式响应**：
```json
{
  "answer": "回答内容..."
}
```

## 环境变量配置

在Supabase仪表板中设置以下环境变量：

- `OPENAI_API_KEY`: OpenAI API密钥
- `SUPABASE_URL`: Supabase项目URL
- `SUPABASE_ANON_KEY`: 匿名API密钥
- `SUPABASE_SERVICE_ROLE_KEY`: 服务角色密钥

## 缓存机制

函数实现了智能缓存机制：

1. **检查缓存** - 首先查询`ai_analyses`表是否存在相同诗词的缓存
2. **缓存命中** - 直接返回缓存内容，避免重复AI调用
3. **缓存未命中** - 调用AI服务，将结果存入缓存
4. **问答不缓存** - 问答请求不进行缓存，确保实时性

## 错误处理

函数包含完整的错误处理：

- 参数验证错误 (400)
- AI服务配置错误 (503)
- 服务器内部错误 (500)
- CORS支持

## 部署命令

```bash
# 部署函数
supabase functions deploy generate-poem-analysis --no-verify-jwt

# 设置环境变量
supabase secrets set OPENAI_API_KEY=your-key-here
```

## 测试示例

```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-poem-analysis \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-anon-key" \
  -d '{
    "poem_id": 1,
    "poem_content": "诗歌内容",
    "title": "诗歌标题",
    "author": "作者"
  }'
```

## 安全考虑

- API密钥存储在数据库配置表中，不暴露给前端
- 使用服务角色密钥进行数据库操作
- 实现参数验证和输入清理
- 支持CORS跨域请求