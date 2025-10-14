<template>
  <section>
    <h2>诗词管理（MVP占位）</h2>
    <p>后续将实现：列表、创建、编辑、删除。</p>
    <p>当前仅展示最新列表以代替：</p>
    <button class="btn" @click="store.fetchLatest()">加载最新</button>
    <div v-if="store.loading">加载中...</div>
    <div v-else-if="store.error" class="error">错误：{{ store.error }}</div>
    <ul>
      <li v-for="p in store.list" :key="p.id">
        {{ p.title }} - {{ p.author }}
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { usePoemsStore } from '@/stores/poems';
const store = usePoemsStore();
</script>

<style scoped>
.btn {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
}
.error { color: #ef4444; }
</style>