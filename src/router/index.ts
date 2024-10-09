import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/import',
      name: 'import',
      component: () => import('@/views/ImportView.vue')
    },
    {
      path: '/wallets',
      name: 'wallets',
      component: () => import('@/views/WalletsView.vue')
    },
    {
      path: '/sign',
      name: 'sign',
      component: () => import('@/views/SignView.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue')
    }
  ]
})

export default router
