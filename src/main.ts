import './assets/scss/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

import { useSignStore } from './stores/sign';
const { setTransactions } = useSignStore();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('popup', request);
    switch (request.method) {
        case 'navigate':
            router.push({ name: request.params[0] });
            sendResponse({ status: 'success' });
            break;
        case 'eth_requestAccounts':
            router.push({ name: 'wallets', query: { id: request.id } })
            sendResponse({ status: 'success' });
            break;
        case 'eth_signTransactions':
            setTransactions(request.id, request.params);
            router.push({ name: 'sign' })
            break;
        default:
            sendResponse({ status: 'fail' });
    }
});

app.mount('#app')
