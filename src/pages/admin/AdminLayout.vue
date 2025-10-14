<template>
  <section>
    <h1>后台管理</h1>
    <nav class="tabs">
      <router-link to="/admin">诗词管理</router-link>
      <router-link to="/admin/configs">系统配置</router-link>
    </nav>
    <router-view />
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}
.tabs a {
  color: var(--primary);
  text-decoration: none;
}
</style>