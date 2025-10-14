import { createRouter, createWebHistory } from 'vue-router';

const Home = () => import('@/pages/Home.vue');
const Search = () => import('@/pages/Search.vue');
const Poem = () => import('@/pages/Poem.vue');
const AdminLayout = () => import('@/pages/admin/AdminLayout.vue');
const AdminPoems = () => import('@/pages/admin/AdminPoems.vue');
const AdminConfig = () => import('@/pages/admin/AdminConfig.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/search', component: Search },
    { path: '/poem/:id', component: Poem, props: true },
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

// 路由守卫占位：MVP阶段所有人可访问
router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAdmin) {
    // TODO: 替换为真实权限校验
    next();
  } else {
    next();
  }
});

export default router;