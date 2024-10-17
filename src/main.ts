import './assets/scss/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('popup', request);
    switch (request.action) {
        case 'navigate':
            router.push({ name: request.targetRoute });
            sendResponse({ status: 'success' });
            break;
        case 'getWallets':
            router.push({ name: 'wallets', query: { id: request.id } })
            sendResponse({ status: 'success' });
            break;
        default:
            sendResponse({ status: 'fail' });
    }
});

app.mount('#app')
