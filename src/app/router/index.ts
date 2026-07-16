import { useAuthStore } from '@/features/auth/stores/auth.store';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/pages/SignupPage.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/',
      name: 'workspaces',
      component: () => import('@/pages/WorkspacePage.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/board/:boardId',
      name: 'board',
      component: () => import('@/pages/BoardPage.vue'),
      meta: { requiresGuest: true },
    },
  ],
});

router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' };
  }

  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return { name: 'workspaces' };
  }
});

export default router;