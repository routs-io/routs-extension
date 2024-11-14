import './assets/scss/main.scss'

import { createApp, toRefs } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// import { useSignStore } from './stores/sign'
// import { useAuthStore } from './stores/auth'
// const { setTransactions } = useSignStore()
// const { isExternalRequest } = toRefs(useAuthStore())

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   console.log('popup', request)
//   isExternalRequest.value = true
//   switch (request.method) {
//     case 'navigate':
//       router.push({ name: request.params[0] })
//       sendResponse({ status: 'success' })
//       break
//     case 'eth_requestAccounts':
//       router.push({ name: 'connect', query: { id: request.id } })
//       sendResponse({ status: 'success' })
//       break
//     case 'eth_signTransactions':
//       setTransactions(request.id, request.params)
//       router.push({ name: 'sign' })
//       sendResponse({ status: 'success' })
//       break
//     case 'fuel_generateAccounts':
//       console.log(request.params);
//       router.push({ name: 'import', query: { id: request.id, wallets: request.params } })
//       sendResponse({ status: 'success' })
//       break
//     default:
//       sendResponse({ status: 'fail' })
//   }
// })

app.mount('#app')
