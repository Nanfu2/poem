<template>
  <section class="panel">
    <h2>AI赏析</h2>
    <div v-if="loading">正在生成赏析...</div>
    <div v-else-if="error" class="error">错误：{{ error }}</div>
    <div v-else-if="analysis" class="content" v-html="analysis"></div>
    <button class="btn" @click="generate" v-if="!analysis && !loading">生成AI赏析</button>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
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

async function generate() {
  loading.value = true;
  error.value = null;
  try {
    analysis.value = await generatePoemAnalysis({
      poem_id: props.poemId,
      title: props.title,
      author: props.author,
      poem_content: props.poemContent
    });
  } catch (e: any) {
    error.value = e?.message || String(e);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.panel {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}
.btn {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
}
.error { color: #ef4444; }
.content { white-space: pre-wrap; line-height: 1.7; }
</style>