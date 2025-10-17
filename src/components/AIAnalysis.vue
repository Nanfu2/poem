<template>
  <section class="ai-analysis">
    <div class="ai-header">
      <h3 class="ai-title">🤖 AI智能赏析</h3>
      <button 
        class="generate-btn" 
        @click="generate" 
        :disabled="loading"
        :class="{ loading: loading }"
      >
        <span v-if="loading" class="spinner"></span>
        <span v-else>✨ 生成赏析</span>
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>AI正在分析诗词意境...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h4>分析失败</h4>
      <p class="error-message">{{ error }}</p>
      <button class="retry-btn" @click="generate">🔄 重新生成</button>
    </div>

    <div v-else-if="analysis" class="analysis-content">
      <div class="analysis-text" v-html="formattedAnalysis"></div>
      <div class="analysis-footer">
        <span class="ai-tag">AI生成内容</span>
        <button class="copy-btn" @click="copyAnalysis" title="复制赏析内容">
          📋 复制
        </button>
      </div>
    </div>

    <div v-else class="welcome-state">
      <div class="welcome-icon">📖</div>
      <p>点击上方按钮，让AI为您深度解析这首诗词</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { generatePoemAnalysis } from '@/services/ai';

const props = defineProps<{
  poemId: number;
  title: string;
  author: string;
  poemContent: string;
}>();

const analysis = ref<string>('');
const loading = ref(false);
const error = ref<string | null>(null);

const formattedAnalysis = computed(() => {
  if (!analysis.value) return '';
  return analysis.value.replace(/\n/g, '<br>');
});

async function generate() {
  loading.value = true;
  error.value = null;
  analysis.value = '';
  
  try {
    analysis.value = await generatePoemAnalysis({
      poem_id: props.poemId,
      title: props.title,
      author: props.author,
      poem_content: props.poemContent
    });
  } catch (e: any) {
    error.value = e?.message || 'AI服务暂时不可用，请稍后重试';
  } finally {
    loading.value = false;
  }
}

function copyAnalysis() {
  if (analysis.value) {
    navigator.clipboard.writeText(analysis.value).then(() => {
      // 可以添加复制成功的提示
      console.log('赏析内容已复制到剪贴板');
    });
  }
}
</script>

<style scoped>
.ai-analysis {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.ai-title {
  color: #1e293b;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
}

.generate-btn {
  background: linear-gradient(135deg, var(--primary), #1d4ed8);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(45, 108, 223, 0.3);
}

.generate-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.generate-btn.loading {
  background: #94a3b8;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f1f5f9;
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

/* 错误状态 */
.error-state {
  text-align: center;
  padding: 30px 20px;
  background: #fef2f2;
  border-radius: 8px;
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.error-state h4 {
  color: #dc2626;
  margin: 0 0 8px 0;
  font-size: 1.1rem;
}

.error-message {
  color: #ef4444;
  margin-bottom: 16px;
  font-size: 0.9rem;
}

.retry-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.9rem;
}

.retry-btn:hover {
  background: #dc2626;
}

/* 赏析内容 */
.analysis-content {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
}

.analysis-text {
  color: #334155;
  line-height: 1.8;
  font-size: 1rem;
  margin-bottom: 16px;
}

.analysis-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.ai-tag {
  background: #f1f5f9;
  color: #64748b;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.copy-btn {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: #e2e8f0;
  color: #334155;
}

/* 欢迎状态 */
.welcome-state {
  text-align: center;
  padding: 30px 20px;
  color: #64748b;
}

.welcome-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.welcome-state p {
  margin: 0;
  font-size: 0.95rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-analysis {
    padding: 20px;
  }
  
  .ai-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .generate-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .ai-analysis {
    padding: 16px;
  }
  
  .analysis-content {
    padding: 16px;
  }
}
</style>