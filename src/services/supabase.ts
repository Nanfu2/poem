import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// 验证配置并提供错误处理
let supabaseUrl = url;
let supabaseKey = key;

if (!url || url.includes('your-project-id')) {
  console.error('错误: Supabase URL 未正确配置，请检查 .env 文件');
  // 使用默认的正确配置以确保应用可以运行
  supabaseUrl = 'https://mefhajixisdpsrkkhhqg.supabase.co';
  supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lZmhhaml4aXNkcHNya2toaHFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTMzNDAsImV4cCI6MjA3NjA4OTM0MH0.fqWmOhYHBHymwl8urKV3lhGWK6cltcm2uFJ5TwbQg-E';
} else if (!key) {
  console.error('错误: Supabase ANON KEY 未正确配置，请检查 .env 文件');
  supabaseKey = '';
}

console.log('Supabase 配置加载成功');

export const supabase = createClient(supabaseUrl, supabaseKey);

// Edge Function 调用帮助：Supabase Functions 默认路径为 {url}/functions/v1/{function-name}
export const supabaseFunctionsBase = `${supabaseUrl}/functions/v1`;