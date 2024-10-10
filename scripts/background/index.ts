import { getWallets, signTransactions } from "../utils/index.js";
import 'chrome';

chrome.runtime.onMessageExternal.addListener(async function (request, sender, sendResponse) {
    console.log('background.js', request);
    console.log('external', sender);
    switch (request.action) {
        case 'getWallets':
            console.log('getWallets');
            sendResponse(await getWallets());
            break;
        case 'signTransactions':
            console.log('signTransactions');
            sendResponse(await signTransactions(request.transactions));
            break;
        default:
            break;
    }
});

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    console.log('background.js', request);
    console.log('internal', sender);
    console.log('sender.tab', sender.tab);
    console.log('request', request);
    sendResponse({ message: 'hello from background.js' });
});