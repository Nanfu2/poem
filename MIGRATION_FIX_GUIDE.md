# 数据库迁移修复指南

## 问题说明

在执行迁移时遇到了错误：
```
ERROR: 42704: text search configuration "chinese" does not exist
```

这是因为Supabase默认没有安装中文分词配置。

## 修复方案

### 已完成的修复

1. **修改全文搜索配置**
   - 将 `'chinese'` 改为 `'simple'`
   - `simple` 配置是PostgreSQL内置的，无需额外安装
   - 虽然对中文分词效果不如专用配置，但保证兼容性

2. **添加简化搜索函数**
   - 创建 `simple_search_poems` 函数，使用LIKE操作符
   - 创建 `api_search_poems` 函数，返回JSON格式
   - 提供更好的兼容性和简单实现

## 新的迁移执行顺序

### 推荐执行顺序：

1. **基础表结构**
   ```sql
   -- 执行 001_create_tables.sql
   -- 创建 poems, ai_analyses, configs 表
   -- 插入示例数据
   ```

2. **安全策略**
   ```sql
   -- 执行 002_rls_policies.sql  
   -- 启用行级安全策略
   -- 设置访问权限
   ```

3. **简化搜索函数**（新增）
   ```sql
   -- 执行 001b_simple_search.sql
   -- 创建兼容性更好的搜索函数
   ```

4. **性能优化**（可选）
   ```sql
   -- 执行 004_optimizations.sql
   -- 添加索引和优化（可以在数据量增大后执行）
   ```

## 搜索功能说明

### 两种搜索实现：

1. **全文搜索**（使用simple配置）
   - 优点：搜索速度快，支持词干提取
   - 缺点：对中文分词效果一般
   - 使用：`SELECT * FROM search_poems('李白');`

2. **简化搜索**（使用LIKE操作符）
   - 优点：兼容性好，简单易懂
   - 缺点：性能稍差，不支持复杂搜索
   - 使用：`SELECT * FROM simple_search_poems('李白');`

### 前端调用推荐：

```javascript
// 使用简化搜索API
const searchResults = await supabase
  .rpc('api_search_poems', { 
    search_term: '李白',
    limit_count: 20,
    offset_count: 0 
  });
```

## 测试迁移

### 验证表结构：
```sql
-- 检查表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### 测试搜索功能：
```sql
-- 测试全文搜索
SELECT * FROM search_poems('李白');

-- 测试简化搜索  
SELECT * FROM simple_search_poems('李白');

-- 测试API搜索
SELECT * FROM api_search_poems('李白');
```

## 如果仍然遇到问题

### 备选方案：

1. **完全使用简化搜索**
   - 注释掉所有 `to_tsvector` 相关的索引和函数
   - 只使用 `simple_search_poems` 函数

2. **手动安装中文分词**
   ```sql
   -- 在Supabase SQL编辑器中执行
   CREATE TEXT SEARCH CONFIGURATION chinese (COPY = simple);
   -- 注意：这需要Superuser权限，可能无法在Supabase中执行
   ```

## 下一步

迁移执行成功后，您可以：
1. 部署Edge Function
2. 测试AI服务集成  
3. 开始前端开发

修复后的迁移文件应该能够正常执行。如果还有问题，请告诉我具体的错误信息。