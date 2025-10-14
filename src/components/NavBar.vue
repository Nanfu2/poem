<template>
  <header class="navbar">
    <div class="logo" @click="$router.push('/')">诗海寻踪</div>
    <nav class="nav-links">
      <router-link to="/" class="nav-link">首页</router-link>
      <router-link to="/search" class="nav-link">搜索</router-link>
      <router-link to="/admin" class="nav-link">管理</router-link>
    </nav>
    <form class="search" @submit.prevent="goSearch">
      <input
        v-model="q"
        type="text"
        placeholder="搜索诗词/作者/内容..."
        aria-label="搜索"
      />
      <button type="submit">搜索</button>
    </form>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const q = ref<string>(String(route.query.q || ''));

function goSearch() {
  const keyword = q.value.trim();
  router.push({ path: '/search', query: keyword ? { q: keyword } : {} });
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}
.logo {
  font-weight: 700;
  color: var(--primary);
  cursor: pointer;
}
.nav-links {
  display: flex;
  gap: 20px;
}
.nav-link {
  color: #64748b;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s;
}
.nav-link:hover {
  color: var(--primary);
  background: #f1f5f9;
}
.nav-link.router-link-active {
  color: var(--primary);
  background: #eff6ff;
  font-weight: 500;
}
.search {
  display: flex;
  gap: 8px;
  flex: 1;
}
.search input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}
.search button {
  padding: 8px 12px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>