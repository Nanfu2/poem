# 诗海寻踪 (Shi Hai Xun Zong) - AI赋能诗词赏析平台

基于 Vue 3 + Supabase 的现代化诗词AI赏析应用。

## 项目特色

- 🎯 **AI智能赏析** - 基于大模型的专业诗词解读
- 🔍 **全文搜索** - 支持标题、作者、内容的多维度搜索
- 📱 **响应式设计** - 适配桌面和移动设备
- 🚀 **现代化架构** - Vue 3 + TypeScript + Vite
- ☁️ **无服务器后端** - Supabase提供完整后端服务
- 💾 **智能缓存** - AI结果缓存，优化成本性能

## 技术栈

### 前端
- Vue 3.4.38 + Composition API
- TypeScript 5.5.4
- Vite 5.4.3 (构建工具)
- Pinia 2.1.7 (状态管理)
- Vue Router 4.3.0 (路由)

### 后端
- Supabase (PostgreSQL + 实时API + 认证)
- Edge Functions (无服务器函数)
- 外部AI服务 (OpenAI/GLM等)

## 项目结构

```
poem-ai-vue/
├── src/                    # 前端源码
│   ├── components/         # 可复用组件
│   ├── pages/             # 页面组件
│   ├── services/          # API服务
│   ├── stores/            # 状态管理
│   └── router/            # 路由配置
├── supabase/              # 服务端配置
│   ├── migrations/        # 数据库迁移
│   └── functions/         # Edge Functions
└── dist/                  # 构建输出
```

## 快速开始

### 环境要求

- Node.js 18+ 
- npm 或 yarn
- Supabase 账号

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 部署Supabase服务端

```bash
# 方式1: 使用部署脚本
npm run deploy:supabase

# 方式2: 手动部署
npm run supabase:db-push
npm run supabase:deploy-function
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看应用。

## 服务端部署指南

### 数据库表结构

项目包含三个核心表：

1. **poems** - 诗词数据表
2. **ai_analyses** - AI赏析缓存表  
3. **configs** - 系统配置表

### Edge Function

`generate-poem-analysis` 函数处理AI请求：

- 检查缓存避免重复调用
- 支持诗词赏析和问答两种模式
- 安全的API密钥管理

### 安全配置

- 行级安全策略(RLS)控制数据访问
- AI密钥存储在数据库，不暴露前端
- CORS配置允许跨域请求

## 功能特性

### 前台功能
- ✅ 诗词浏览和分页
- ✅ 智能全文搜索
- ✅ AI专业赏析生成
- ✅ 问诗友对话功能

### 后台管理  
- ✅ 诗词数据管理(CRUD)
- ✅ 系统配置管理
- ✅ AI服务配置

## 开发脚本

```bash
# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 测试服务端连接
node test-supabase.js

# Supabase管理
npm run supabase:db-push    # 部署数据库
npm run supabase:deploy-function  # 部署函数
```

## 部署到生产环境

### Vercel部署

1. 连接Git仓库到Vercel
2. 配置环境变量
3. 自动部署

### Supabase生产配置

1. 启用行级安全策略
2. 配置合适的数据库索引
3. 设置监控和告警

## 贡献指南

欢迎提交Issue和Pull Request！

## 许可证

MIT License

## 联系方式

如有问题请提交Issue或联系开发团队。