<template>
  <article class="poem-card" @click="goToPoem">
    <div class="card-header">
      <h3 class="poem-title">{{ poem.title }}</h3>
      <div class="card-badges">
        <span v-if="poem.views" class="views-badge" title="阅读量">
          👁️ {{ formatNumber(poem.views) }}
        </span>
        <span v-if="poem.likes" class="likes-badge" title="点赞数">
          👍 {{ formatNumber(poem.likes) }}
        </span>
      </div>
    </div>
    
    <p class="poem-meta">{{ poem.author }} · {{ poem.dynasty || '不详' }}</p>
    
    <div class="poem-preview">
      <p v-for="(line, index) in previewLines" :key="index" class="poem-line">
        {{ line }}
      </p>
      <div v-if="hasMoreLines" class="more-indicator">...</div>
    </div>

    <div v-if="poem.tags && poem.tags.length" class="poem-tags">
      <span v-for="tag in poem.tags.slice(0, 3)" :key="tag" class="tag">
        #{{ tag }}
      </span>
      <span v-if="poem.tags.length > 3" class="more-tags">
        +{{ poem.tags.length - 3 }}
      </span>
    </div>

    <div class="card-footer">
      <div class="footer-actions">
        <button class="action-btn" @click.stop="copyPoem" title="复制诗词">
          📋
        </button>
        <button class="action-btn" @click.stop="sharePoem" title="分享诗词">
          📤
        </button>
        <button 
          class="action-btn like-btn" 
          :class="{ liked: isLiked }"
          @click.stop="toggleLike"
          title="点赞"
        >
          {{ isLiked ? '❤️' : '🤍' }}
        </button>
      </div>
      <div class="footer-info">
        <span class="char-count">{{ characterCount }} 字</span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Poem } from '@/stores/poems';

const props = defineProps<{ 
  poem: Poem & { 
    tags?: string[];
    views?: number;
    likes?: number;
  } 
}>();
const router = useRouter();
const isLiked = ref(false);

const previewLines = computed(() => {
  const lines = (props.poem.content || '').split('\n').filter(Boolean);
  return lines.slice(0, 2);
});

const hasMoreLines = computed(() => {
  const lines = (props.poem.content || '').split('\n').filter(Boolean);
  return lines.length > 2;
});

const characterCount = computed(() => {
  return props.poem.content?.length || 0;
});

function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + '千';
  }
  return num.toString();
}

function goToPoem() {
  router.push(`/poem/${props.poem.id}`);
}

function copyPoem() {
  const text = `${props.poem.title}\n${props.poem.author} · ${props.poem.dynasty}\n\n${props.poem.content}`;
  navigator.clipboard.writeText(text).then(() => {
    console.log('诗词已复制到剪贴板');
  });
}

function sharePoem() {
  if (navigator.share) {
    navigator.share({
      title: props.poem.title,
      text: `分享诗词：${props.poem.title} - ${props.poem.author}`,
      url: window.location.href
    });
  } else {
    copyPoem();
    console.log('分享功能不可用，已复制到剪贴板');
  }
}

function toggleLike() {
  isLiked.value = !isLiked.value;
}
</script>

<style scoped>
.poem-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.poem-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.poem-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.poem-card:hover::before {
  opacity: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.poem-title {
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
  flex: 1;
  margin-right: 12px;
}

.card-badges {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.views-badge,
.likes-badge {
  background: #f1f5f9;
  color: #64748b;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
}

.poem-meta {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0 0 12px 0;
  font-style: italic;
}

.poem-preview {
  margin-bottom: 12px;
}

.poem-line {
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 4px 0;
  font-family: 'SimSun', '宋体', serif;
}

.more-indicator {
  color: #94a3b8;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 4px;
}

.poem-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.tag {
  background: #f0f9ff;
  color: #0369a1;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.more-tags {
  color: #94a3b8;
  font-size: 0.75rem;
  align-self: center;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.footer-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.like-btn.liked {
  background: #fef2f2;
  border-color: #fecaca;
  color: #ef4444;
}

.footer-info {
  color: #94a3b8;
  font-size: 0.75rem;
}

.char-count {
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .poem-card {
    padding: 12px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .card-badges {
    align-self: flex-start;
  }
  
  .footer-actions {
    gap: 2px;
  }
  
  .action-btn {
    padding: 4px;
    font-size: 0.8rem;
  }
}
</style>