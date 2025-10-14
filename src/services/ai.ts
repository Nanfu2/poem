import { supabaseFunctionsBase } from './supabase';

export interface GenerateAnalysisInput {
  poem_id: number;
  poem_content: string;
  title: string;
  author: string;
  question?: string;
}

export async function generatePoemAnalysis(payload: GenerateAnalysisInput): Promise<string> {
  const resp = await fetch(`${supabaseFunctionsBase}/generate-poem-analysis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 注意：前端仅携带 anon key 访问公开函数；敏感密钥应由函数内部读取 configs 表
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY as string}`
    },
    body: JSON.stringify(payload)
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Edge Function 调用失败：${resp.status} ${text}`);
  }
  const data = await resp.json();
  // 期望返回形如 { analysis: string }
  return data.analysis ?? '';
}

export async function askPoemFriend(payload: GenerateAnalysisInput): Promise<string> {
  const resp = await fetch(`${supabaseFunctionsBase}/generate-poem-analysis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY as string}`
    },
    body: JSON.stringify(payload)
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`问诗友失败：${resp.status} ${text}`);
  }
  const data = await resp.json();
  // 期望返回形如 { answer: string } 或复用 analysis 字段
  return data.answer ?? data.analysis ?? '';
}