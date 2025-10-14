<template>
  <section>
    <h2>搜索结果</h2>
    <p v-if="!q">请输入关键词进行搜索。</p>

    <div v-if="store.loading">搜索中...</div>
    <div v-else-if="store.error" class="error">错误：{{ store.error }}</div>
    <div v-else>
      <p class="count" v-if="q">关键词“{{ q }}”，共 {{ store.list.length }} 首诗词</p>
      <div class="grid">
        <PoemCard v-for="p in store.list" :key="p.id" :poem="p" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { usePoemsStore } from '@/stores/poems';
import PoemCard from '@/components/PoemCard.vue';

const route = useRoute();
const store = usePoemsStore();

const q = computed(() => String(route.query.q || '').trim());

watch(q, async (val) => {
  if (val) {
    await store.search(val);
  } else {
    store.list = [];
  }
}, { immediate: true });
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}
.count { color: #475569; }
.error { color: #ef4444; }
</style>