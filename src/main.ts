import './assets/scss/main.scss'

import { createApp, toRefs } from 'vue'
import { createPinia } from 'pinia'
import { install } from '@solana/webcrypto-ed25519-polyfill'
install()

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Stores
import { useSignStore } from './stores/sign'
import { useAuthStore } from './stores/auth'
import { useWalletsStore } from './stores/wallets'

const { setTransactions } = useSignStore()
const { refreshWallets } = useWalletsStore()
const { isExternalRequest } = toRefs(useAuthStore())

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('popup', request)

  isExternalRequest.value = true

  if (!request || !request.id) {
    // Redirect to "/wallets" if no request is provided
    router.push({ name: 'wallets' })
    sendResponse({ status: 'success' })
    return
  }

  switch (request.method) {
    case 'navigate':
      router.push({ name: request.params[0] })
      sendResponse({ status: 'success' })
      break
    case 'eth_requestAccounts':
      router.push({ name: 'connect', query: { id: request.id } })
      sendResponse({ status: 'success' })
      break
    case 'eth_signTransactions':
      setTransactions(request.id, request.params)
      router.push({ name: 'sign' })
      sendResponse({ status: 'success' })
      break
    case 'fuel_generateAccounts':
      router.push({
        name: 'import',
        query: { id: request.id, wallets: request.params }
      })
      sendResponse({ status: 'success' })
      break
    case 'ws_setupTask':
      sendResponse({ status: 'success' })
      break
    default:
      sendResponse({ status: 'fail', message: 'Invalid method' })
  }
})

app.mount('#app')

setTimeout(() => {
  router.isReady().then(async () => {
    const currentPath = router.currentRoute.value.path
    const isHomePage = currentPath === '/' || currentPath === '/index.html'

    // Redirect to "/wallets" only if no request was handled
    if (!isExternalRequest.value && isHomePage) {
      await refreshWallets(0)
      router.push({ name: 'wallets' })
    }
  })
}, 500)
