<template>
  <div class="poem-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>正在加载诗词...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">❌</div>
      <h2>加载失败</h2>
      <p class="error-message">{{ error }}</p>
      <button class="retry-btn" @click="loadPoem">🔄 重试</button>
    </div>

    <!-- 诗词内容 -->
    <div v-else-if="poem" class="poem-container">
      <!-- 导航栏 -->
      <nav class="poem-nav">
        <router-link to="/" class="back-btn">
          <span class="back-icon">←</span>
          返回首页
        </router-link>
        <div class="nav-actions">
          <button class="nav-btn" @click="copyPoem" title="复制诗词">
            <span class="btn-icon">📋</span>
            复制
          </button>
          <button class="nav-btn" @click="sharePoem" title="分享诗词">
            <span class="btn-icon">📤</span>
            分享
          </button>
          <button class="nav-btn" @click="toggleFavorite" :class="{ active: isFavorite }" title="收藏诗词">
            <span class="btn-icon">{{ isFavorite ? '❤️' : '🤍' }}</span>
            收藏
          </button>
        </div>
      </nav>

      <!-- 诗词主体 -->
      <article class="poem-content">
        <header class="poem-header">
          <h1 class="poem-title">{{ poem.title }}</h1>
          <div class="poem-meta">
            <span class="author">{{ poem.author }}</span>
            <span class="dynasty">· {{ poem.dynasty || '不详' }}</span>
            <span class="views">👁️ {{ poem.views || 0 }} 次阅读</span>
          </div>
        </header>

        <div class="poem-text">
          <p v-for="(line, i) in poemLines" :key="i" class="poem-line">{{ line }}</p>
        </div>

        <!-- 标签 -->
        <div v-if="poem.tags && poem.tags.length" class="poem-tags">
          <span class="tag-label">标签：</span>
          <span v-for="tag in poem.tags" :key="tag" class="tag">#{{ tag }}</span>
        </div>

        <!-- 互动按钮 -->
        <div class="poem-actions">
          <button class="action-btn like-btn" @click="toggleLike" :class="{ active: isLiked }">
            <span class="btn-icon">{{ isLiked ? '👍' : '👍' }}</span>
            <span class="btn-text">{{ isLiked ? '已赞' : '点赞' }}</span>
            <span class="count">{{ poem.likes || 0 }}</span>
          </button>
          
          <button class="action-btn comment-btn" @click="scrollToComments">
            <span class="btn-icon">💬</span>
            <span class="btn-text">评论</span>
            <span class="count">{{ poem.comments || 0 }}</span>
          </button>
          
          <button class="action-btn share-btn" @click="sharePoem">
            <span class="btn-icon">📤</span>
            <span class="btn-text">分享</span>
          </button>
        </div>

        <!-- 诗词信息 -->
        <div class="poem-info">
          <div class="info-card">
            <h3 class="info-title">📖 诗词信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">朝代：</span>
                <span class="value">{{ poem.dynasty || '不详' }}</span>
              </div>
              <div class="info-item">
                <span class="label">作者：</span>
                <span class="value">{{ poem.author }}</span>
              </div>
              <div class="info-item">
                <span class="label">字数：</span>
                <span class="value">{{ characterCount }} 字</span>
              </div>
              <div class="info-item">
                <span class="label">行数：</span>
                <span class="value">{{ poemLines.length }} 行</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 相关诗词 -->
        <section v-if="relatedPoems.length" class="related-section">
          <h3 class="section-title">📚 相关诗词</h3>
          <div class="related-grid">
            <div v-for="related in relatedPoems" :key="related.id" class="related-card" @click="goToPoem(related.id)">
              <h4 class="related-title">{{ related.title }}</h4>
              <p class="related-meta">{{ related.author }} · {{ related.dynasty }}</p>
              <p class="related-preview">{{ related.content.split('\
')[0] }}...</p>
            </div>
          </div>
        </section>
      </article>

      <!-- AI分析组件 -->
      <section class="ai-section">
        <AIAnalysis
          :poem-id="poem.id"
          :title="poem.title"
          :author="poem.author"
          :poem-content="poem.content"
        />
      </section>

      <!-- AI对话组件 -->
      <section class="chat-section">
        <ChatWithAI
          :poem-id="poem.id"
          :title="poem.title"
          :author="poem.author"
          :poem-content="poem.content"
        />
      </section>

      <!-- 评论区域（占位） -->
      <section id="comments" class="comments-section">
        <h3 class="section-title">💬 评论</h3>
        <div class="comments-placeholder">
          <p>评论功能正在开发中...</p>
          <p class="placeholder-hint">用户将可以在这里发表对诗词的见解和感受</p>
        </div>
      </section>
    </div>

    <!-- 未找到诗词 -->
    <div v-else class="not-found">
      <div class="not-found-icon">📝</div>
      <h2>诗词未找到</h2>
      <p>抱歉，没有找到对应的诗词内容。</p>
      <router-link to="/" class="home-link">返回首页</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { usePoemsStore, type Poem as PoemType } from '@/stores/poems';
import AIAnalysis from '@/components/AIAnalysis.vue';
import ChatWithAI from '@/components/ChatWithAI.vue';

const route = useRoute();
const store = usePoemsStore();
const poem = ref<PoemType | null>(null);

// 添加缺失的响应式变量
const loading = ref(true);
const error = ref<string | null>(null);
const isFavorite = ref(false);
const isLiked = ref(false);
const relatedPoems = ref<PoemType[]>([]);

async function loadPoem() {
  loading.value = true;
  error.value = null;
  
  try {
    const id = Number(route.params.id);
    if (Number.isFinite(id)) {
      poem.value = await store.getById(id);
      // 加载相关诗词（简化实现）
      await store.fetchLatest(10);
      relatedPoems.value = store.list.filter(p => p.id !== id).slice(0, 3);
    } else {
      error.value = '无效的诗词ID';
    }
  } catch (err: any) {
    error.value = err?.message || '加载诗词失败';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadPoem();
});

const poemLines = computed(() => (poem.value?.content || '').split('\n').filter(Boolean));

// 添加缺失的计算属性
const characterCount = computed(() => {
  return poem.value?.content.length || 0;
});

// 添加缺失的方法
function toggleFavorite() {
  isFavorite.value = !isFavorite.value;
}

function toggleLike() {
  isLiked.value = !isLiked.value;
  // 这里可以添加实际的点赞逻辑
}

function scrollToComments() {
  const commentsSection = document.getElementById('comments');
  if (commentsSection) {
    commentsSection.scrollIntoView({ behavior: 'smooth' });
  }
}

function goToPoem(id: number) {
  // 实现跳转到相关诗词的逻辑
  console.log('跳转到诗词 ID:', id);
}

function copyPoem() {
  if (poem.value) {
    const text = `${poem.value.title}\n${poem.value.author} · ${poem.value.dynasty}\n\n${poem.value.content}`;
    navigator.clipboard.writeText(text).then(() => {
      alert('诗词已复制到剪贴板！');
    });
  }
}

function sharePoem() {
  if (poem.value) {
    const text = `分享诗词：${poem.value.title} - ${poem.value.author}`;
    if (navigator.share) {
      navigator.share({
        title: poem.value.title,
        text: text,
        url: window.location.href
      });
    } else {
      alert('分享功能在当前浏览器中不可用');
    }
  }
}
</script>

<style scoped>
.poem-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f1f5f9;
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.error-container {
  text-align: center;
  padding: 80px 20px;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.error-message {
  color: #ef4444;
  margin-bottom: 20px;
  font-size: 1.1rem;
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
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background: #dc2626;
}

/* 诗词容器 */
.poem-container {
  padding: 20px 0;
}

/* 导航栏 */
.poem-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary);
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #1d4ed8;
}

.back-icon {
  font-size: 1.2rem;
}

.nav-actions {
  display: flex;
  gap: 8px;
}

.nav-btn {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: #e2e8f0;
  color: #334155;
}

.nav-btn.active {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

/* 诗词内容 */
.poem-content {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.poem-header {
  text-align: center;
  margin-bottom: 30px;
}

.poem-title {
  color: #0f172a;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 12px 0;
  line-height: 1.2;
}

.poem-meta {
  color: #64748b;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.author {
  font-weight: 600;
}

.dynasty {
  font-style: italic;
}

.views {
  font-size: 0.9rem;
}

/* 诗词文本 */
.poem-text {
  text-align: center;
  margin-bottom: 30px;
}

.poem-line {
  color: #334155;
  font-size: 1.3rem;
  line-height: 2;
  margin: 8px 0;
  font-family: 'SimSun', '宋体', serif;
}

/* 标签 */
.poem-tags {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.tag-label {
  color: #64748b;
  font-size: 0.9rem;
}

.tag {
  background: #f1f5f9;
  color: #475569;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.85rem;
}

/* 互动按钮 */
.poem-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 30px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.action-btn.active {
  background: #f0f9ff;
  border-color: #bae6fd;
  color: #0369a1;
}

.btn-icon {
  font-size: 1.2rem;
}

.count {
  background: #e2e8f0;
  color: #475569;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

/* 诗词信息 */
.poem-info {
  margin-bottom: 30px;
}

.info-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}

.info-title {
  color: #1e293b;
  margin: 0 0 16px 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}

.label {
  color: #64748b;
  font-size: 0.9rem;
}

.value {
  color: #1e293b;
  font-weight: 600;
}

/* 相关诗词 */
.related-section {
  margin-bottom: 30px;
}

.section-title {
  color: #1e293b;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 20px 0;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.related-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.related-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.related-title {
  color: #0f172a;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.related-meta {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0 0 8px 0;
}

.related-preview {
  color: #475569;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
}

/* AI组件区域 */
.ai-section,
.chat-section {
  margin-bottom: 40px;
}

/* 评论区域 */
.comments-section {
  margin-bottom: 40px;
}

.comments-placeholder {
  text-align: center;
  padding: 40px 20px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  color: #64748b;
}

.placeholder-hint {
  font-size: 0.9rem;
  margin-top: 8px;
  color: #94a3b8;
}

/* 未找到诗词 */
.not-found {
  text-align: center;
  padding: 80px 20px;
}

.not-found-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.not-found h2 {
  color: #1e293b;
  margin: 0 0 12px 0;
  font-size: 1.5rem;
}

.not-found p {
  color: #64748b;
  margin: 0 0 20px 0;
}

.home-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}

.home-link:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .poem-page {
    padding: 0 16px;
  }
  
  .poem-nav {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .nav-actions {
    justify-content: center;
  }
  
  .poem-content {
    padding: 20px;
  }
  
  .poem-title {
    font-size: 2rem;
  }
  
  .poem-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .poem-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .action-btn {
    width: 200px;
    justify-content: center;
  }
  
  .related-grid {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .poem-page {
    padding: 0 12px;
  }
  
  .poem-content {
    padding: 16px;
  }
  
  .poem-title {
    font-size: 1.8rem;
  }
  
  .poem-line {
    font-size: 1.2rem;
  }
  
  .nav-actions {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>