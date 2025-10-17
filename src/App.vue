<template>
  <div class="app">
    <NavBar v-if="!$route.meta.hideLayout" />
    <main class="container" :class="{ 'full-screen': $route.meta.hideLayout }">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/NavBar.vue';
</script>

<style>
:root {
  --primary: #2d6cdf;
  --bg: #f8fafc;
  --text: #0f172a;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 16px;
  width: 100%;
}

.container.full-screen {
  max-width: none;
  padding: 0;
  margin: 0;
}

/* 确保页面内容能正常滚动 */
html, body {
  height: 100%;
  overflow-x: hidden;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 16px 12px;
  }
  
  .container.full-screen {
    padding: 0;
  }
}
</style>