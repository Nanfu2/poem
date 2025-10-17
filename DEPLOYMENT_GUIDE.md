# 诗海寻踪 - 服务端部署指南

## 服务端实现完成总结

✅ **已完成的服务端组件：**

### 1. 数据库设计
- **poems表** - 诗词数据存储（标题、作者、朝代、内容、背景）
- **ai_analyses表** - AI赏析结果缓存（避免重复调用）
- **configs表** - 系统配置管理（AI密钥等敏感信息）
- **全文搜索索引** - 支持标题、作者、内容的快速搜索
- **行级安全策略(RLS)** - 数据访问权限控制

### 2. Edge Function
- **generate-poem-analysis** - 核心AI处理函数
  - 支持诗词赏析和问答两种模式
  - 智能缓存机制优化成本
  - 完整的错误处理和CORS支持

### 3. 示例数据
- 15首经典诗词数据（唐代和宋代）
- 包含李白、杜甫、王维等名家作品
- 可用于测试和演示

### 4. 开发工具
- 数据库迁移脚本
- 本地测试脚本
- Docker本地开发环境
- 自动化部署脚本

## 部署步骤

### 第一步：创建Supabase项目

1. **注册Supabase账号**
   - 访问 [supabase.com](https://supabase.com)
   - 使用GitHub或邮箱注册

2. **创建新项目**
   - 点击"New Project"
   - 项目名称：`poem-ai-platform`
   - 选择合适的地域（推荐：亚太地区）
   - 等待项目初始化完成

3. **获取项目配置**
   - 进入项目设置 → API
   - 复制以下信息：
     - Project URL
     - anon public key
     - service_role key（需要点击"Show"）

### 第二步：配置环境变量

1. **更新 `.env` 文件**
```env
VITE_SUPABASE_URL=https://your-actual-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

2. **在Supabase中设置环境变量**
   - 进入项目设置 → API
   - 在"Environment Variables"中添加：
     - `OPENAI_API_KEY` = "你的OpenAI API密钥"

### 第三步：部署数据库

**方法一：使用SQL编辑器（推荐新手）**
1. 进入Supabase仪表板 → SQL Editor
2. 依次执行以下文件内容：
   - `supabase/migrations/001_create_tables.sql`
   - `supabase/migrations/002_rls_policies.sql` 
   - `supabase/migrations/003_sample_data.sql`

**方法二：使用Supabase CLI**
```bash
# 安装CLI
npm install -g supabase-cli

# 登录
supabase login

# 链接项目
supabase link --project-ref your-project-id

# 部署数据库
supabase db push
```

### 第四步：部署Edge Function

```bash
# 部署函数
supabase functions deploy generate-poem-analysis --no-verify-jwt

# 验证部署
supabase functions list
```

### 第五步：配置AI服务

1. **获取OpenAI API密钥**
   - 访问 [OpenAI平台](https://platform.openai.com)
   - 创建API密钥

2. **配置到Supabase**
   - 方法一：在Supabase仪表板中设置环境变量
   - 方法二：使用CLI设置密钥
     ```bash
     supabase secrets set OPENAI_API_KEY=sk-your-openai-key
     ```

3. **或在configs表中配置**
   ```sql
   UPDATE configs SET value = 'sk-your-openai-key' WHERE key = 'openai_api_key';
   ```

## 测试服务端

### 运行测试脚本
```bash
node test-supabase.js
```

### 手动测试步骤

1. **测试数据库连接**
   - 访问Supabase仪表板 → Table Editor
   - 确认能看到poems表中的数据

2. **测试Edge Function**
   ```bash
   curl -X POST https://your-project.supabase.co/functions/v1/generate-poem-analysis \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer your-anon-key" \
     -d '{
       "poem_id": 1,
       "poem_content": "床前明月光，疑是地上霜。举头望明月，低头思故乡。",
       "title": "静夜思", 
       "author": "李白"
     }'
   ```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查环境变量是否正确
   - 确认Supabase项目状态正常

2. **Edge Function返回404**
   - 确认函数已成功部署
   - 检查函数名称拼写正确

3. **AI服务调用失败**
   - 检查OpenAI API密钥是否正确
   - 确认API密钥有足够额度

4. **CORS错误**
   - Edge Function已配置CORS支持
   - 检查请求头是否正确

### 日志查看
```bash
# 查看函数日志
supabase functions logs generate-poem-analysis

# 查看数据库日志  
supabase logs
```

## 生产环境优化

### 性能优化
1. **数据库索引优化**
   - 为常用查询字段添加索引
   - 定期分析查询性能

2. **缓存策略**
   - 调整AI结果缓存时间
   - 考虑使用Redis缓存热门数据

### 安全加固
1. **API限制**
   - 设置合理的API调用频率限制
   - 监控异常访问模式

2. **密钥轮换**
   - 定期更换API密钥
   - 使用密钥管理服务

## 监控和维护

### 监控指标
- API调用次数和成功率
- AI服务响应时间
- 数据库查询性能
- 错误率监控

### 定期维护
- 备份数据库
- 更新依赖版本
- 检查安全漏洞

## 下一步

服务端部署完成后，可以：
1. **开发前端界面** - 基于现有的Vue组件
2. **测试完整流程** - 从前端到后端的集成测试
3. **性能优化** - 根据实际使用情况优化
4. **部署到生产** - 配置域名和SSL证书

## 技术支持

如遇问题请参考：
- [Supabase官方文档](https://supabase.com/docs)
- [OpenAI API文档](https://platform.openai.com/docs)
- 项目GitHub Issues