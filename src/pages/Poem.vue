<template>
  <section v-if="poem">
    <h1>{{ poem.title }}</h1>
    <p class="meta">{{ poem.author }} · {{ poem.dynasty || '不详' }}</p>
    <div class="content">
      <p v-for="(line, i) in poemLines" :key="i">{{ line }}</p>
    </div>

    <AIAnalysis
      :poem-id="poem.id"
      :title="poem.title"
      :author="poem.author"
      :poem-content="poem.content"
    />

    <ChatWithAI
      :poem-id="poem.id"
      :title="poem.title"
      :author="poem.author"
      :poem-content="poem.content"
    />
  </section>
  <section v-else>加载中...</section>
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

onMounted(async () => {
  const id = Number(route.params.id);
  if (Number.isFinite(id)) {
    poem.value = await store.getById(id);
  }
});

const poemLines = computed(() => (poem.value?.content || '').split('\n').filter(Boolean));
</script>

<style scoped>
.meta { color: #64748b; margin-bottom: 8px; }
.content {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}
</style>