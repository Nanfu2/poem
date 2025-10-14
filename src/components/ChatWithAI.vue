<template>
  <section class="panel">
    <h2>问诗友</h2>
    <form class="row" @submit.prevent="ask">
      <input v-model="question" type="text" placeholder="请输入你的问题…" />
      <button class="btn" type="submit" :disabled="loading">提问</button>
    </form>
    <div v-if="loading">AI思考中...</div>
    <div v-else-if="error" class="error">错误：{{ error }}</div>
    <div v-else-if="answer" class="content">{{ answer }}</div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { askPoemFriend } from '@/services/ai';

const props = defineProps<{
  poemId: number;
  title: string;
  author: string;
  poemContent: string;
}>();

const question = ref('');
const answer = ref('');
const loading = ref(false);
const error = ref<string | null>(null);

async function ask() {
  const q = question.value.trim();
  if (!q) return;
  loading.value = true;
  error.value = null;
  try {
    answer.value = await askPoemFriend({
      poem_id: props.poemId,
      title: props.title,
      author: props.author,
      poem_content: props.poemContent,
      question: q
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
}
.row { display: flex; gap: 8px; margin-bottom: 8px; }
.row input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
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
.content { white-space: pre-wrap; }
</style>