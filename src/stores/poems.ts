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
  tags?: string[];
  views?: number;
  likes?: number;
  status?: string;
  comments?: number;
}

export const usePoemsStore = defineStore('poems', () => {
  const list = ref<Poem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchLatest(limit = 20) {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: err } = await supabase
        .from('poems')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (err) {
        error.value = err.message;
        console.error('获取最新诗词错误:', err);
        return;
      }
      
      list.value = data || [];
    } catch (err) {
      console.error('获取最新诗词异常:', err);
      error.value = '获取数据时发生异常';
    } finally {
      loading.value = false;
    }
  }

  async function search(q: string) {
    loading.value = true;
    error.value = null;
    try {
      // 使用更完善的搜索
      const { data, error: err } = await supabase
        .from('poems')
        .select('*')
        .or(`title.ilike.%${q}%,author.ilike.%${q}%,content.ilike.%${q}%`)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (err) {
        error.value = err.message;
        console.error('搜索诗词错误:', err);
        return;
      }
      
      list.value = data || [];
    } catch (err) {
      console.error('搜索诗词异常:', err);
      error.value = '搜索数据时发生异常';
    } finally {
      loading.value = false;
    }
  }

  async function getById(id: number) {
    try {
      const { data, error: err } = await supabase
        .from('poems')
        .select('*')
        .eq('id', id)
        .single();
      
      if (err) {
        console.error('获取诗词详情错误:', err);
        throw err;
      }
      
      return data as Poem;
    } catch (err) {
      console.error('获取诗词详情异常:', err);
      throw err;
    }
  }

  // 新增：添加诗词
  async function addPoem(poem: Omit<Poem, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error: err } = await supabase
        .from('poems')
        .insert([{ 
          ...poem, 
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
        
      if (err) {
        console.error('添加诗词错误:', err);
        throw err;
      }
      
      return data;
    } catch (err) {
      console.error('添加诗词异常:', err);
      throw err;
    }
  }

  // 新增：更新诗词
  async function updatePoem(id: number, updates: Partial<Poem>) {
    try {
      const { data, error: err } = await supabase
        .from('poems')
        .update({ 
          ...updates
        })
        .eq('id', id)
        .select()
        .single();
        
      if (err) {
        console.error('更新诗词错误:', err);
        throw err;
      }
      
      return data;
    } catch (err) {
      console.error('更新诗词异常:', err);
      throw err;
    }
  }

  // 新增：删除诗词
  async function deletePoem(id: number) {
    try {
      const { error: err } = await supabase
        .from('poems')
        .delete()
        .eq('id', id);
        
      if (err) {
        console.error('删除诗词错误:', err);
        throw err;
      }
    } catch (err) {
      console.error('删除诗词异常:', err);
      throw err;
    }
  }

  // 新增：获取随机诗词
  async function getRandomPoem() {
    try {
      // 先获取总数
      const { count, error: countError } = await supabase
        .from('poems')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('获取诗词总数错误:', countError);
        throw countError;
      }

      if (!count) {
        throw new Error('数据库中没有诗词数据');
      }

      // 生成随机索引
      const randomIndex = Math.floor(Math.random() * count);

      // 获取随机诗词
      const { data, error } = await supabase
        .from('poems')
        .select('*')
        .range(randomIndex, randomIndex)
        .single();

      if (error) {
        console.error('获取随机诗词错误:', error);
        throw error;
      }
      
      return data as Poem;
    } catch (err) {
      console.error('获取随机诗词异常:', err);
      throw err;
    }
  }

  return { 
    list, 
    loading, 
    error, 
    fetchLatest, 
    search, 
    getById,
    addPoem,
    updatePoem,
    deletePoem,
    getRandomPoem
  };
});