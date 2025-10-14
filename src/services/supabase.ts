import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);

// Edge Function 调用帮助：Supabase Functions 默认路径为 {url}/functions/v1/{function-name}
export const supabaseFunctionsBase = `${url}/functions/v1`;