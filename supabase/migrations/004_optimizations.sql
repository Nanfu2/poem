-- 性能优化和索引优化

-- 为诗词表添加更多索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_poems_author ON poems(author);
CREATE INDEX IF NOT EXISTS idx_poems_dynasty ON poems(dynasty);
CREATE INDEX IF NOT EXISTS idx_poems_created_at ON poems(created_at DESC);

-- 为AI赏析表添加索引
CREATE INDEX IF NOT EXISTS idx_ai_analyses_poem_id ON ai_analyses(poem_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_created_at ON ai_analyses(created_at DESC);

-- 优化全文搜索性能
CREATE INDEX IF NOT EXISTS idx_poems_tsvector ON poems 
USING GIN(to_tsvector('simple', title || ' ' || author || ' ' || content));

-- 创建用于统计的物化视图（可选，用于数据分析）
CREATE MATERIALIZED VIEW IF NOT EXISTS poem_stats AS
SELECT 
  COUNT(*) as total_poems,
  COUNT(DISTINCT author) as unique_authors,
  COUNT(DISTINCT dynasty) as unique_dynasties,
  MAX(created_at) as latest_addition
FROM poems;

-- 创建用于热门诗词的视图
CREATE OR REPLACE VIEW popular_poems AS
SELECT 
  p.*,
  COUNT(a.id) as analysis_count
FROM poems p
LEFT JOIN ai_analyses a ON p.id = a.poem_id
GROUP BY p.id
ORDER BY analysis_count DESC, p.created_at DESC
LIMIT 20;

-- 添加数据库函数用于高级搜索
CREATE OR REPLACE FUNCTION advanced_poem_search(
  search_term TEXT DEFAULT NULL,
  author_filter TEXT DEFAULT NULL,
  dynasty_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
) RETURNS TABLE (
  id BIGINT,
  title TEXT,
  author TEXT,
  dynasty TEXT,
  content TEXT,
  background TEXT,
  created_at TIMESTAMPTZ,
  search_rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.author,
    p.dynasty,
    p.content,
    p.background,
    p.created_at,
    CASE 
      WHEN search_term IS NOT NULL THEN
        ts_rank(
          to_tsvector('simple', p.title || ' ' || p.author || ' ' || p.content),
          plainto_tsquery('simple', search_term)
        )
      ELSE 1.0
    END as search_rank
  FROM poems p
  WHERE 
    (search_term IS NULL OR 
     to_tsvector('simple', p.title || ' ' || p.author || ' ' || p.content) 
     @@ plainto_tsquery('simple', search_term))
    AND (author_filter IS NULL OR p.author = author_filter)
    AND (dynasty_filter IS NULL OR p.dynasty = dynasty_filter)
  ORDER BY search_rank DESC, p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- 创建用于数据清理的函数（定期清理旧的AI缓存）
CREATE OR REPLACE FUNCTION cleanup_old_analyses(retention_days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM ai_analyses 
  WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 注释：这些优化可以在生产环境数据量增大后逐步实施