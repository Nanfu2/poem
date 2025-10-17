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
    <div class="user-actions">
      <template v-if="user">
        <span class="user-info">欢迎, {{ user.email }}</span>
        <button @click="handleLogout" class="logout-btn">退出</button>
      </template>
      <template v-else>
        <router-link to="/login" class="login-link">登录</router-link>
      </template>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { supabase } from '@/services/supabase';

const router = useRouter();
const route = useRoute();
const q = ref<string>(String(route.query.q || ''));
const user = ref<any>(null);

// 检查用户登录状态
const checkUser = async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  user.value = currentUser;
};

// 监听认证状态变化
onMounted(() => {
  checkUser();
  
  // 监听认证状态变化
  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user || null;
    
    // 如果用户在登录页面且已登录，则跳转到首页
    if (session?.user && route.path === '/login') {
      router.push('/');
    }
  });
});

function goSearch() {
  const keyword = q.value.trim();
  router.push({ path: '/search', query: keyword ? { q: keyword } : {} });
}

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('登出失败:', error.message);
  } else {
    router.push('/');
  }
};
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
.user-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-info {
  color: #64748b;
  font-size: 0.9rem;
}
.logout-btn {
  padding: 6px 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}
.logout-btn:hover {
  background: #dc2626;
}
.login-link {
  color: var(--primary);
  text-decoration: none;
  padding: 6px 12px;
  border: 1px solid var(--primary);
  border-radius: 4px;
  font-size: 0.9rem;
}
.login-link:hover {
  background: var(--primary);
  color: white;
}
</style>