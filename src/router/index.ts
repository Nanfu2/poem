import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from '@/services/supabase';

const Home = () => import('@/pages/Home.vue');
const Search = () => import('@/pages/Search.vue');
const Poem = () => import('@/pages/Poem.vue');
const Login = () => import('@/pages/Login.vue');
const AdminLayout = () => import('@/pages/admin/AdminLayout.vue');
const AdminPoems = () => import('@/pages/admin/AdminPoems.vue');
const AdminConfig = () => import('@/pages/admin/AdminConfig.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/search', component: Search },
    { path: '/poem/:id', component: Poem, props: true },
    { path: '/login', component: Login, meta: { hideLayout: true } },
    {
      path: '/admin',
      component: AdminLayout,
      children: [
        { path: '', component: AdminPoems },
        { path: 'configs', component: AdminConfig }
      ],
      meta: { requiresAdmin: true }
    }
  ],
  scrollBehavior() {
    return { top: 0 };
  }
});

// 路由守卫：检查用户是否已登录
router.beforeEach(async (to, _from, next) => {
  // 允许访问登录页面
  if (to.path === '/login') {
    next();
    return;
  }

  // 检查用户是否已登录
  const { data: { user } } = await supabase.auth.getUser();
  
  // 如果用户未登录，重定向到登录页面
  if (!user) {
    next('/login');
    return;
  }

  // 对于需要管理员权限的路由进行特殊处理
  if (to.meta.requiresAdmin) {
    // TODO: 替换为真实权限校验
    next();
  } else {
    next();
  }
});

export default router;