// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/';

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Home',
        meta: { requiresAuth: true },
  
        component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
      },
    ],
  },
  {
    path: '/public',
    component: () => import('@/layouts/auth/Default.vue'),
    meta: { requiresUnauth: true },
    children: [
      {
        path: '',
        name: 'PublicHome',
        meta: { requiresUnauth: true },
        component: () => import(/* webpackChunkName: "home" */ '@/layouts/auth/Home.vue'),
      },
      {
        path: '/login',
        name: 'Login',
        meta: { requiresUnauth: true },
        component: () => import(/* webpackChunkName: "home" */ '@/layouts/auth/Login.vue'),
      },
      {
        path: '/signup',
        name: 'Signup',
        meta: { requiresUnauth: true },
        component: () => import(/* webpackChunkName: "home" */ '@/layouts/auth/Signup.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import(/* webpackChunkName: "home" */ '@/views/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // Check if session is expired (refresh token expired)
  if (authStore.isLoggedIn && !authStore.isSessionValid) {
    // Session expired - logout and redirect to login
    authStore.logout();
    next({ name: 'Login' });
    return;
  }

  const isAuthenticated = authStore.isLoggedIn;

  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next({ name: 'PublicHome' });
  } else if (to.matched.some(record => record.meta.requiresUnauth) && isAuthenticated) {
    next({ name: 'Home' });
  } else {
    next();
  }
});

export default router
