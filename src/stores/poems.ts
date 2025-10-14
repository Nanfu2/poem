import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '@/services/supabase';

export interface Poem {
  id: number;
  title: string;
  author: string;
  dynasty?: string;
  content: string;
  background?: string;
  created_at?: string;
}

export const usePoemsStore = defineStore('poems', () => {
  const list = ref<Poem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchLatest(limit = 20) {
    loading.value = true;
    error.value = null;
    const { data, error: err } = await supabase
      .from('poems')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (err) error.value = err.message;
    list.value = data || [];
    loading.value = false;
  }

  async function search(q: string) {
    loading.value = true;
    error.value = null;
    // 简单 LIKE 搜索占位；生产建议使用全文检索
    const { data, error: err } = await supabase
      .from('poems')
      .select('*')
      .or(`title.ilike.%${q}%,author.ilike.%${q}%,content.ilike.%${q}%`)
      .limit(100);
    if (err) error.value = err.message;
    list.value = data || [];
    loading.value = false;
  }

  async function getById(id: number) {
    const { data, error: err } = await supabase
      .from('poems')
      .select('*')
      .eq('id', id)
      .single();
    if (err) throw err;
    return data as Poem;
  }

  return { list, loading, error, fetchLatest, search, getById };
});