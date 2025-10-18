<template>
  <div class="home-page">
    <!-- 搜索栏 -->
    <section class="search-section">
      <div class="search-container">
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="搜索诗词、作者或朝代..."
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <button class="search-btn" @click="handleSearch">
          <span class="search-icon">🔍</span>
          搜索
        </button>
      </div>
    </section>

    <!-- 每日一诗 -->
    <section class="daily-section">
      <div class="section-header">
        <h2 class="section-title">📖 每日一诗</h2>
        <div class="date-info">{{ currentDate }}</div>
      </div>
      <article v-if="dailyPoem && !dailyLoading" class="daily-poem">
        <div class="poem-header">
          <h3 class="poem-title">{{ dailyPoem.title }}</h3>
          <div class="poem-actions">
            <button class="action-btn" @click="copyPoem(dailyPoem)">
              <span class="btn-icon">📋</span>
              复制
            </button>
          </div>
        </div>
        <p class="poem-meta">{{ dailyPoem.author }} · {{ dailyPoem.dynasty }}</p>
        <div class="poem-content">
          <p v-for="(line, index) in dailyPoem.content.split('\n')" :key="index">{{ line }}</p>
        </div>
      </article>
      <div v-else class="loading">加载中...</div>
    </section>

    <!-- 最新诗词 -->
    <section class="latest-section">
      <div class="section-header">
        <h2 class="section-title">🆕 最新诗词</h2>
      </div>

      <div v-if="!latestLoading" class="poems-grid">
        <PoemCard 
          v-for="poem in latestPoems" 
          :key="poem.id" 
          :poem="poem" 
        />
      </div>
      <div v-else class="loading">加载中...</div>
    </section>
    
    <!-- n8n AI聊天插件 -->
    <N8nChatPlugin />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePoemsStore } from '@/stores/poems';
import type { Poem } from '@/stores/poems';
import PoemCard from '@/components/PoemCard.vue';
import N8nChatPlugin from '@/components/N8nChatPlugin.vue';

const router = useRouter();
const store = usePoemsStore();

// 扩展诗词数据类型
interface ExtendedPoem extends Poem {
  tags?: string[];
  views?: number;
  likes?: number;
  category?: string;
}

// 从数据库获取的数据
const dailyPoem = ref<ExtendedPoem | null>(null);
const latestPoems = ref<ExtendedPoem[]>([]);
const dailyLoading = ref(true);
const latestLoading = ref(true);

// 响应式数据
const searchQuery = ref('');

// 计算属性
const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
});

// 方法
function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`);
  }
}

function copyPoem(poem: ExtendedPoem) {
  const text = `${poem.title}
${poem.author} · ${poem.dynasty}

${poem.content}`;
  navigator.clipboard.writeText(text).then(() => {
    alert('诗词已复制到剪贴板！');
  });
}

// 获取每日一诗（随机选择）
async function fetchDailyPoem() {
  dailyLoading.value = true;
  try {
    const poem = await store.getRandomPoem();
    dailyPoem.value = poem as ExtendedPoem;
  } catch (err) {
    console.error('获取每日一诗失败:', err);
  } finally {
    dailyLoading.value = false;
  }
}

// 获取最新诗词
async function fetchLatestPoems() {
  latestLoading.value = true;
  try {
    await store.fetchLatest(6);
    latestPoems.value = store.list as ExtendedPoem[];
  } catch (err) {
    console.error('获取最新诗词失败:', err);
  } finally {
    latestLoading.value = false;
  }
}

// 生命周期
onMounted(() => {
  fetchDailyPoem();
  fetchLatestPoems();
});
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 搜索栏样式 */
.search-section {
  margin-bottom: 32px;
}

.search-container {
  display: flex;
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
}

.search-btn {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.search-btn:hover {
  background: #1d4ed8;
}

.search-icon {
  font-size: 1.1rem;
}

/* 通用样式 */
.section-title {
  color: #1e293b;
  margin-bottom: 20px;
  font-size: 1.5rem;
  font-weight: 600;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.date-info {
  color: #64748b;
  font-size: 0.9rem;
}

/* 每日一诗样式 */
.daily-section {
  margin-bottom: 40px;
}

.daily-poem {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.daily-poem:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.poem-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.poem-title {
  color: #0f172a;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.poem-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e2e8f0;
  color: #334155;
}

.btn-icon {
  font-size: 0.9rem;
}

.poem-meta {
  color: #64748b;
  margin: 0 0 16px 0;
  font-size: 0.95rem;
}

.poem-content {
  color: #334155;
  line-height: 1.8;
  font-size: 1.1rem;
  margin-bottom: 16px;
}

.poem-content p {
  margin: 12px 0;
  text-align: center;
}

/* 最新诗词样式 */
.latest-section {
  margin-bottom: 40px;
}

.poems-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-page {
    padding: 0 16px;
  }
  
  .search-container {
    flex-direction: column;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .poems-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .daily-poem {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .home-page {
    padding: 0 12px;
  }
  
  .section-title {
    font-size: 1.3rem;
  }
}

.loading {
  text-align: center;
  padding: 20px;
  color: #64748b;
}
</style>