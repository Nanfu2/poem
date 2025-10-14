# 诗海寻踪 - Vue 3 + Supabase MVP

本项目是一个 AI 赋能的诗词赏析平台（MVP），前端使用 Vue 3 + Pinia + Vue Router + TypeScript，后端基于 Supabase（PostgreSQL、Edge Functions）。目标是快速验证“AI智能赏析”的核心价值。

## 功能概览
- 首页：每日一诗 + 最新诗词列表 + 全局搜索框
- 搜索页：按标题/作者/内容关键词检索
- 诗词详情页：展示诗词信息、生成并显示 AI 赏析、提问“问诗友”
- 后台管理：诗词 CRUD、AI 密钥配置（路由守卫占位）

详细需求见《需求文档.md》。

## 快速开始
1. 安装依赖
   - 在项目根目录运行：
     - npm install
2. 配置环境变量
   - 复制 .env.example 为 .env，填入你的 Supabase 项目配置：
     - VITE_SUPABASE_URL=
     - VITE_SUPABASE_ANON_KEY=
3. 本地开发
   - npm run dev
   - 打开 http://localhost:5173

## 目录结构
- src/
  - main.ts：应用入口
  - App.vue：根组件与布局
  - router/：Vue Router 路由
  - stores/：Pinia 全局状态
  - services/：Supabase 客户端与 AI 相关接口
  - components/：通用组件
  - pages/：页面组件（含 admin 子目录）

## 重要说明
- Supabase Edge Function `generate-poem-analysis` 需在 Supabase 中创建（本前端通过 fetch 调用）。函数需从 `configs` 表读取密钥，生成赏析并缓存到 `ai_analyses`。
- 生产部署建议：前端部署到 Vercel/Netlify，后端使用 Supabase 生产环境。
- 安全提示：避免在前端存储或暴露任何私密服务密钥；管理员配置页面需增加严格守卫（MVP先占位）。

## 路由
- `/` 首页
- `/search?q=关键词` 搜索
- `/poem/:id` 详情
- `/admin` 管理占位（含诗词数据与配置）

## 后续计划
- 引入用户系统与更强的权限控制
- pgvector 语义搜索（V2）
- 组件与交互完善、性能优化

更多开发规范见 .cursorrules。