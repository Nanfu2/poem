-- 简化的搜索函数，避免中文分词配置问题
-- 这个迁移文件提供更简单的搜索实现

-- 创建简化的搜索函数（使用LIKE操作符，兼容性更好）
CREATE OR REPLACE FUNCTION simple_search_poems(search_term TEXT)
RETURNS TABLE (
  id BIGINT,
  title TEXT,
  author TEXT,
  dynasty TEXT,
  content TEXT,
  background TEXT,
  created_at TIMESTAMPTZ
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
    p.created_at
  FROM poems p
  WHERE 
    p.title ILIKE '%' || search_term || '%'
    OR p.author ILIKE '%' || search_term || '%'
    OR p.content ILIKE '%' || search_term || '%'
  ORDER BY 
    CASE 
      WHEN p.title ILIKE '%' || search_term || '%' THEN 1
      WHEN p.author ILIKE '%' || search_term || '%' THEN 2
      ELSE 3
    END,
    p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 创建用于前端调用的搜索函数（返回JSON格式）
CREATE OR REPLACE FUNCTION api_search_poems(
  search_term TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
) RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  IF search_term IS NULL OR search_term = '' THEN
    -- 如果没有搜索词，返回最新诗词
    SELECT json_agg(row_to_json(t))
    INTO result
    FROM (
      SELECT id, title, author, dynasty, content, background, created_at
      FROM poems
      ORDER BY created_at DESC
      LIMIT limit_count
      OFFSET offset_count
    ) t;
  ELSE
    -- 使用简化搜索
    SELECT json_agg(row_to_json(t))
    INTO result
    FROM (
      SELECT id, title, author, dynasty, content, background, created_at
      FROM simple_search_poems(search_term)
      LIMIT limit_count
      OFFSET offset_count
    ) t;
  END IF;
  
  RETURN coalesce(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;