import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import WalletsView from '@/views/WalletsView.vue'
import ImportView from '@/views/ImportView.vue'
import ConnectView from '@/views/ConnectView.vue'
import GenerateView from '@/views/GenerateView.vue'
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
      path: '/wallets',
      name: 'wallets',
      component: WalletsView
    },
    {
      path: '/import',
      name: 'import',
      component: ImportView
    },
    {
      path: '/connect',
      name: 'connect',
      component: ConnectView
    },
    {
      path: '/generate',
      name: 'generate',
      component: GenerateView
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
