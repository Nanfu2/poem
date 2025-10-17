-- 启用行级安全策略 (Row Level Security)
ALTER TABLE poems ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE configs ENABLE ROW LEVEL SECURITY;

-- poems表策略：允许所有人读取诗词
CREATE POLICY "允许所有人读取诗词" ON poems
  FOR SELECT USING (true);

-- poems表策略：仅管理员可以修改诗词
CREATE POLICY "仅管理员可以插入诗词" ON poems
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "仅管理员可以更新诗词" ON poems
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "仅管理员可以删除诗词" ON poems
  FOR DELETE USING (auth.role() = 'service_role');

-- ai_analyses表策略：允许所有人读取AI赏析
CREATE POLICY "允许所有人读取AI赏析" ON ai_analyses
  FOR SELECT USING (true);

-- ai_analyses表策略：仅服务角色可以修改AI赏析
CREATE POLICY "仅服务角色可以管理AI赏析" ON ai_analyses
  FOR ALL USING (auth.role() = 'service_role');

-- configs表策略：仅服务角色可以访问配置
CREATE POLICY "仅服务角色可以访问配置" ON configs
  FOR ALL USING (auth.role() = 'service_role');

-- 创建用于全文搜索的函数（提高搜索性能）
CREATE OR REPLACE FUNCTION search_poems(search_term TEXT)
RETURNS TABLE (
  id BIGINT,
  title TEXT,
  author TEXT,
  dynasty TEXT,
  content TEXT,
  background TEXT,
  created_at TIMESTAMPTZ,
  rank REAL
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
    ts_rank(
      to_tsvector('simple', p.title || ' ' || p.author || ' ' || p.content),
      plainto_tsquery('simple', search_term)
    ) as rank
  FROM poems p
  WHERE 
    to_tsvector('simple', p.title || ' ' || p.author || ' ' || p.content) 
    @@ plainto_tsquery('simple', search_term)
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;