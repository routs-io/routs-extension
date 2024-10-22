import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ImportView from '@/views/ImportView.vue'
import HistoryView from '@/views/HistoryView.vue'
import SignView from '@/views/SignView.vue'
import SettingsView from '@/views/SettingsView.vue'

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
      component: ImportView
    },
    {
      path: '/history',
      name: 'history',
      component: HistoryView
    },
    {
      path: '/sign',
      name: 'sign',
      component: SignView
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    }
  ]
})

export default router
