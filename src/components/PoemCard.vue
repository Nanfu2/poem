<template>
  <article class="card" @click="$router.push(`/poem/${poem.id}`)">
    <h3 class="title">{{ poem.title }}</h3>
    <p class="meta">{{ poem.author }} · {{ poem.dynasty || '不详' }}</p>
    <p class="snippet">{{ snippet }}</p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Poem } from '@/stores/poems';

const props = defineProps<{ poem: Poem }>();

const snippet = computed(() => {
  const lines = (props.poem.content || '').split('\n').filter(Boolean);
  return lines.slice(0, 2).join(' / ');
});
</script>

<style scoped>
.card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: box-shadow .15s ease;
}
.card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,.06);
}
.title {
  margin: 0;
}
.meta {
  color: #64748b;
  margin: 6px 0 8px;
}
.snippet {
  color: #334155;
}
</style>