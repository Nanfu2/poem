<template>
  <div class="home-page">
    <section class="daily-section">
      <h2 class="section-title">每日一诗</h2>
      <article class="daily-poem">
        <h3 class="poem-title">静夜思</h3>
        <p class="poem-meta">李白 · 唐</p>
        <div class="poem-content">
          <p>床前明月光，疑是地上霜。</p>
          <p>举头望明月，低头思故乡。</p>
        </div>
      </article>
    </section>

    <section class="latest-section">
      <div class="section-header">
        <h2 class="section-title">最新诗词</h2>
        <button class="refresh-btn" @click="fetchLatest()" :disabled="loading">
          {{ loading ? '刷新中...' : '刷新' }}
        </button>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>正在加载诗词...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <p class="error-message">加载失败：{{ error }}</p>
        <button class="retry-btn" @click="fetchLatest()">重试</button>
      </div>
      
      <div v-else-if="list.length === 0" class="empty-state">
        <p>暂无诗词数据</p>
      </div>
      
      <div v-else class="poems-grid">
        <PoemCard v-for="p in list" :key="p.id" :poem="p" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Poem } from '@/stores/poems';
import PoemCard from '@/components/PoemCard.vue';

// 静态诗词数据
const staticPoems: Poem[] = [
  {
    id: 1,
    title: '春晓',
    author: '孟浩然',
    dynasty: '唐',
    content: `春眠不觉晓，处处闻啼鸟。
夜来风雨声，花落知多少。`
  },
  {
    id: 2,
    title: '登鹳雀楼',
    author: '王之涣',
    dynasty: '唐',
    content: `白日依山尽，黄河入海流。
欲穷千里目，更上一层楼。`
  },
  {
    id: 3,
    title: '相思',
    author: '王维',
    dynasty: '唐',
    content: `红豆生南国，春来发几枝。
愿君多采撷，此物最相思。`
  }
];

const list = ref<Poem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(() => {
  loading.value = true;
  // 模拟异步加载
  setTimeout(() => {
    list.value = staticPoems;
    loading.value = false;
  }, 500);
});

function fetchLatest() {
  loading.value = true;
  error.value = null;
  setTimeout(() => {
    list.value = staticPoems;
    loading.value = false;
  }, 500);
}
</script>

<style scoped>
.home-page {
  max-width: 100%;
  padding: 0 16px;
}

.section-title {
  color: #1e293b;
  margin-bottom: 16px;
  font-size: 1.5rem;
  font-weight: 600;
}

.daily-section {
  margin-bottom: 32px;
}

.daily-poem {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.poem-title {
  color: #0f172a;
  margin: 0 0 8px 0;
  font-size: 1.25rem;
}

.poem-meta {
  color: #64748b;
  margin: 0 0 16px 0;
  font-size: 0.9rem;
}

.poem-content {
  color: #334155;
  line-height: 1.8;
}

.poem-content p {
  margin: 8px 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.refresh-btn {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.refresh-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.refresh-btn:not(:disabled):hover {
  background: #1d4ed8;
}

.poems-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  color: #64748b;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 40px 20px;
}

.error-message {
  color: #ef4444;
  margin-bottom: 16px;
}

.retry-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
}

.retry-btn:hover {
  background: #dc2626;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
}

@media (max-width: 768px) {
  .home-page {
    padding: 0 12px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .poems-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .daily-poem {
    padding: 16px;
  }
}
</style>