-- 创建诗词表
CREATE TABLE IF NOT EXISTS poems (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  dynasty TEXT NOT NULL,
  content TEXT NOT NULL,
  background TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建AI赏析缓存表
CREATE TABLE IF NOT EXISTS ai_analyses (
  id BIGSERIAL PRIMARY KEY,
  poem_id BIGINT NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  analysis_content TEXT NOT NULL,
  ai_model TEXT NOT NULL DEFAULT 'gpt-4',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poem_id, ai_model)
);

-- 创建配置表
CREATE TABLE IF NOT EXISTS configs (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建全文搜索索引（使用简单模式，避免中文分词配置问题）
CREATE INDEX IF NOT EXISTS idx_poems_search ON poems USING GIN (to_tsvector('simple', title || ' ' || author || ' ' || content));

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表添加更新时间触发器
CREATE TRIGGER update_poems_updated_at BEFORE UPDATE ON poems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_analyses_updated_at BEFORE UPDATE ON ai_analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configs_updated_at BEFORE UPDATE ON configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入示例数据
INSERT INTO poems (title, author, dynasty, content, background) VALUES
('静夜思', '李白', '唐', '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。', '李白在扬州旅舍所作，表达思乡之情。'),
('春晓', '孟浩然', '唐', '春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。', '描绘春天早晨的景色和感受。'),
('登鹳雀楼', '王之涣', '唐', '白日依山尽，黄河入海流。\n欲穷千里目，更上一层楼。', '描写登高望远的壮丽景色。');

-- 插入默认配置
INSERT INTO configs (key, value) VALUES
('openai_api_key', 'your-openai-api-key-here'),
('ai_model', 'gpt-4');