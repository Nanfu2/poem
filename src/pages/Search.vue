<template>
  <div class="search-page">
    <!-- 搜索栏 -->
    <section class="search-section">
      <div class="search-container">
        <div class="search-input-group">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索诗词、作者、朝代或标签..."
            class="search-input"
            @keyup.enter="performSearch"
            @input="handleInput"
          />
          <button class="search-btn" @click="performSearch">
            <span class="search-icon">🔍</span>
            搜索
          </button>
          <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
            <span class="clear-icon">✕</span>
          </button>
        </div>
        
        <!-- 搜索建议 -->
        <div v-if="showSuggestions && suggestions.length" class="suggestions">
          <div
            v-for="suggestion in suggestions"
            :key="suggestion"
            class="suggestion-item"
            @click="selectSuggestion(suggestion)"
          >
            <span class="suggestion-icon">🔍</span>
            {{ suggestion }}
          </div>
        </div>
      </div>
    </section>

    <!-- 搜索历史 -->
    <section v-if="searchHistory.length" class="history-section">
      <h3 class="section-title">📚 搜索历史</h3>
      <div class="history-tags">
        <span
          v-for="history in searchHistory"
          :key="history"
          class="history-tag"
          @click="searchFromHistory(history)"
        >
          {{ history }}
          <button class="remove-history" @click.stop="removeHistory(history)">✕</button>
        </span>
      </div>
    </section>

    <!-- 热门搜索 -->
    <section class="popular-section">
      <h3 class="section-title">🔥 热门搜索</h3>
      <div class="popular-tags">
        <span
          v-for="tag in popularTags"
          :key="tag"
          class="popular-tag"
          @click="searchFromPopular(tag)"
        >
          {{ tag }}
        </span>
      </div>
    </section>

    <!-- 搜索结果 -->
    <section class="results-section">
      <div v-if="!searchQuery && !route.query.q" class="welcome-state">
        <div class="welcome-icon">📚</div>
        <h2>诗词搜索</h2>
        <p>输入关键词搜索您感兴趣的诗词</p>
        <div class="search-examples">
          <p class="example-title">搜索示例：</p>
          <ul class="example-list">
            <li>按作者搜索：<span class="example" @click="searchFromExample('李白')">李白</span></li>
            <li>按朝代搜索：<span class="example" @click="searchFromExample('唐')">唐代</span></li>
            <li>按主题搜索：<span class="example" @click="searchFromExample('思乡')">思乡</span></li>
            <li>按诗句搜索：<span class="example" @click="searchFromExample('明月')">明月</span></li>
          </ul>
        </div>
      </div>

      <div v-else-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>正在搜索诗词...</p>
        <p class="loading-hint">正在查找包含"{{ currentQuery }}"的诗词</p>
      </div>

      <div v-else-if="error" class="error-state">
        <div class="error-icon">❌</div>
        <h3>搜索失败</h3>
        <p class="error-message">{{ error }}</p>
        <button class="retry-btn" @click="performSearch">🔄 重试</button>
      </div>

      <div v-else-if="results.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>未找到相关诗词</h3>
        <p class="empty-message">没有找到包含"{{ currentQuery }}"的诗词</p>
        <div class="empty-suggestions">
          <p>建议：</p>
          <ul>
            <li>检查关键词拼写是否正确</li>
            <li>尝试使用更简单的关键词</li>
            <li>搜索作者名或朝代名</li>
            <li>使用诗句中的关键词</li>
          </ul>
        </div>
      </div>

      <div v-else class="results-container">
        <!-- 搜索结果统计 -->
        <div class="results-header">
          <h2 class="results-title">
            搜索结果
            <span class="results-count">({{ results.length }} 首)</span>
          </h2>
          <div class="results-meta">
            <span class="query-info">关键词："{{ currentQuery }}"</span>
            <span class="time-info">搜索用时 {{ searchTime }}ms</span>
          </div>
        </div>

        <!-- 排序和筛选 -->
        <div class="results-controls">
          <div class="sort-controls">
            <label class="sort-label">排序方式：</label>
            <select v-model="sortBy" class="sort-select">
              <option value="relevance">相关度</option>
              <option value="title">标题</option>
              <option value="author">作者</option>
              <option value="dynasty">朝代</option>
              <option value="views">阅读量</option>
            </select>
          </div>
          
          <div class="filter-controls">
            <label class="filter-label">筛选：</label>
            <select v-model="filterBy" class="filter-select">
              <option value="all">全部</option>
              <option value="title">仅标题</option>
              <option value="content">仅内容</option>
              <option value="author">仅作者</option>
            </select>
          </div>
        </div>

        <!-- 搜索结果列表 -->
        <div class="results-grid">
          <PoemCard
            v-for="poem in sortedResults"
            :key="poem.id"
            :poem="poem"
            :highlight="currentQuery"
          />
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            class="pagination-btn"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            上一页
          </button>
          
          <div class="pagination-pages">
            <span
              v-for="page in visiblePages"
              :key="page"
              class="page-number"
              :class="{ active: page === currentPage }"
              @click="currentPage = page"
            >
              {{ page }}
            </span>
          </div>
          
          <button
            class="pagination-btn"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            下一页
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePoemsStore } from '@/stores/poems';
import PoemCard from '@/components/PoemCard.vue';

const route = useRoute();
const router = useRouter();
const store = usePoemsStore();

// 响应式数据
const searchQuery = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const results = ref<any[]>([]);
const searchTime = ref(0);
const showSuggestions = ref(false);
const sortBy = ref('relevance');
const filterBy = ref('all');
const currentPage = ref(1);
const pageSize = ref(10);



// 搜索历史
const searchHistory = ref<string[]>([]);

// 热门搜索标签
const popularTags = ref([
  '李白', '杜甫', '唐诗', '宋词', '思乡', '爱情', '山水', '明月', '春天', '秋天'
]);

// 搜索建议
const suggestions = ref<string[]>([]);



// 计算属性
const currentQuery = computed(() => {
  const query = route.query.q || searchQuery.value;
  return typeof query === 'string' ? query : '';
});
const sortedResults = computed(() => {
  let sorted = [...results.value];
  
  switch (sortBy.value) {
    case 'title':
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'author':
      sorted.sort((a, b) => a.author.localeCompare(b.author));
      break;
    case 'dynasty':
      sorted.sort((a, b) => a.dynasty.localeCompare(b.dynasty));
      break;
    case 'views':
      sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
      break;
    case 'relevance':
    default:
      // 按相关度排序（简单实现：标题匹配优先）
      sorted.sort((a, b) => {
        const query = currentQuery.value.toLowerCase();
        const aTitleMatch = a.title.toLowerCase().includes(query);
        const bTitleMatch = b.title.toLowerCase().includes(query);
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
        return 0;
      });
      break;
  }
  
  return sorted;
});

const totalPages = computed(() => Math.ceil(sortedResults.value.length / pageSize.value));
const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, start + 4);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

// 方法
function performSearch() {
  const query = searchQuery.value.trim();
  if (!query) return;
  
  loading.value = true;
  error.value = null;
  showSuggestions.value = false;
  
  // 更新URL
  router.push({ query: { q: query } });
  
  // 模拟搜索延迟
  const startTime = Date.now();
  
  setTimeout(() => {
    try {
      // 模拟搜索逻辑
      const filtered = mockPoems.filter((poem: any) => {
        const queryLower = query.toLowerCase();
        return (
          poem.title.toLowerCase().includes(queryLower) ||
          poem.author.toLowerCase().includes(queryLower) ||
          poem.dynasty.toLowerCase().includes(queryLower) ||
          poem.content.toLowerCase().includes(queryLower) ||
          poem.tags?.some((tag: string) => tag.toLowerCase().includes(queryLower))
        );
      });
      
      results.value = filtered;
      searchTime.value = Date.now() - startTime;
      
      // 添加到搜索历史
      addToSearchHistory(query);
      
    } catch (err) {
      error.value = '搜索过程中出现错误';
      results.value = [];
    } finally {
      loading.value = false;
    }
  }, 500);
}

function handleInput() {
  if (searchQuery.value.length > 0) {
    showSuggestions.value = true;
    updateSuggestions();
  } else {
    showSuggestions.value = false;
    suggestions.value = [];
  }
}

function updateSuggestions() {
  const query = searchQuery.value.toLowerCase();
  suggestions.value = popularTags.value
    .filter(tag => tag.toLowerCase().includes(query))
    .slice(0, 5);
}

function selectSuggestion(suggestion: string) {
  searchQuery.value = suggestion;
  performSearch();
}

function clearSearch() {
  searchQuery.value = '';
  results.value = [];
  showSuggestions.value = false;
  router.push({ query: {} });
}

function addToSearchHistory(query: string) {
  const history = JSON.parse(localStorage.getItem('poemSearchHistory') || '[]');
  const index = history.indexOf(query);
  
  if (index > -1) {
    history.splice(index, 1);
  }
  
  history.unshift(query);
  const newHistory = history.slice(0, 10);
  localStorage.setItem('poemSearchHistory', JSON.stringify(newHistory));
  searchHistory.value = newHistory;
}

function searchFromHistory(query: string) {
  searchQuery.value = query;
  performSearch();
}

function removeHistory(query: string) {
  const history = JSON.parse(localStorage.getItem('poemSearchHistory') || '[]');
  const index = history.indexOf(query);
  
  if (index > -1) {
    history.splice(index, 1);
    localStorage.setItem('poemSearchHistory', JSON.stringify(history));
    searchHistory.value = history;
  }
}

function searchFromPopular(tag: string) {
  searchQuery.value = tag;
  performSearch();
}

function searchFromExample(query: string) {
  searchQuery.value = query;
  performSearch();
}

// 监听路由变化
watch(() => route.query.q, (newQuery) => {
  if (newQuery && newQuery !== searchQuery.value) {
    searchQuery.value = typeof newQuery === 'string' ? newQuery : newQuery[0] || '';
    performSearch();
  }
}, { immediate: true });

// 初始化
onMounted(() => {
  // 加载搜索历史
  const history = JSON.parse(localStorage.getItem('poemSearchHistory') || '[]');
  searchHistory.value = history;
});
</script>

<style scoped>
.search-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 搜索栏样式 */
.search-section {
  margin-bottom: 32px;
}

.search-container {
  max-width: 600px;
  margin: 0 auto;
  position: relative;
}

.search-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
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

.clear-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #e2e8f0;
  color: #475569;
}

/* 搜索建议 */
.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
  margin-top: 4px;
}

.suggestion-item {
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background: #f8fafc;
}

.suggestion-icon {
  color: #64748b;
}

/* 搜索历史和热门搜索 */
.history-section,
.popular-section {
  margin-bottom: 24px;
}

.section-title {
  color: #1e293b;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.history-tags,
.popular-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-tag,
.popular-tag {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.history-tag:hover,
.popular-tag:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.remove-history {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  font-size: 0.8rem;
}

.remove-history:hover {
  background: #fecaca;
  color: #ef4444;
}

/* 欢迎状态 */
.welcome-state {
  text-align: center;
  padding: 80px 20px;
  color: #64748b;
}

.welcome-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.welcome-state h2 {
  color: #1e293b;
  margin: 0 0 12px 0;
  font-size: 1.8rem;
}

.search-examples {
  margin-top: 32px;
  text-align: left;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.example-title {
  color: #475569;
  font-weight: 600;
  margin-bottom: 12px;
}

.example-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.example-list li {
  margin-bottom: 8px;
  color: #64748b;
}

.example {
  color: var(--primary);
  cursor: pointer;
  text-decoration: underline;
}

.example:hover {
  color: #1d4ed8;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f1f5f9;
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-hint {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-top: 8px;
}

/* 错误状态 */
.error-state {
  text-align: center;
  padding: 60px 20px;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.error-state h3 {
  color: #1e293b;
  margin: 0 0 12px 0;
}

.error-message {
  color: #ef4444;
  margin-bottom: 20px;
}

.retry-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.retry-btn:hover {
  background: #dc2626;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #1e293b;
  margin: 0 0 12px 0;
}

.empty-message {
  margin-bottom: 20px;
}

.empty-suggestions {
  text-align: left;
  max-width: 300px;
  margin: 0 auto;
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
}

.empty-suggestions p {
  font-weight: 600;
  margin-bottom: 8px;
}

.empty-suggestions ul {
  margin: 0;
  padding-left: 20px;
  color: #64748b;
}

.empty-suggestions li {
  margin-bottom: 4px;
  font-size: 0.9rem;
}

/* 搜索结果容器 */
.results-container {
  margin-top: 32px;
}

.results-header {
  margin-bottom: 24px;
}

.results-title {
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.results-count {
  color: #64748b;
  font-size: 1rem;
  font-weight: normal;
}

.results-meta {
  display: flex;
  gap: 16px;
  color: #64748b;
  font-size: 0.9rem;
}

/* 结果控制 */
.results-controls {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
}

.sort-controls,
.filter-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-label,
.filter-label {
  color: #475569;
  font-size: 0.9rem;
}

.sort-select,
.filter-select {
  padding: 6px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
}

/* 结果网格 */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
}

.pagination-btn {
  background: white;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.pagination-btn:disabled {
  color: #cbd5e1;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 4px;
}

.page-number {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.page-number:hover {
  background: #f1f5f9;
}

.page-number.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-page {
    padding: 0 16px;
  }
  
  .search-input-group {
    flex-direction: column;
  }
  
  .search-btn {
    width: 100%;
    justify-content: center;
  }
  
  .results-controls {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .search-page {
    padding: 0 12px;
  }
  
  .history-tags,
  .popular-tags {
    justify-content: center;
  }
  
  .pagination-pages {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>