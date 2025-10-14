<template>
  <section>
    <h2>系统配置（MVP占位）</h2>
    <p>用于在 Supabase 的 configs 表中维护 AI API 密钥。</p>
    <p class="warn">安全提示：生产环境请加严格权限控制。</p>
    <form @submit.prevent="save">
      <label>
        OpenAI API Key（占位输入，不会直接写库）
        <input v-model="openaiKey" type="password" placeholder="sk-..." />
      </label>
      <button class="btn" type="submit">保存（占位）</button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const openaiKey = ref('');
function save() {
  alert('MVP占位：请在 Supabase Edge Function 中读取 configs 表，前端不保存密钥。');
}
</script>

<style scoped>
.warn { color: #b45309; }
form { display: grid; gap: 8px; max-width: 420px; }
input {
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
</style>