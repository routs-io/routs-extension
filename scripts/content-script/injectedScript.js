(function () {
    // Define your API
    const RoutsAPI = {
        EXTENSION_ID: 'cdjjadfcddoglhopfjbfbmgocigecbci',
        getWallets: async function () {
            const wallets = await window.chrome.runtime.sendMessage(this.EXTENSION_ID, { action: 'getWallets' });
            console.log(wallets);
            return wallets;
        },
        signTransactions: async function (transactions) {
            console.log('transactions', transactions);
            const signedTransactions = await window.chrome.runtime.sendMessage(this.EXTENSION_ID, { action: 'signTransactions', transactions });
            return signedTransactions;
        },
        // Add more API methods as needed
    };

    // Attach the API to the window object
    window.routs = RoutsAPI;

    // Optionally, set up communication with the content script
    window.addEventListener('message', function (event) {
        // We only accept messages from ourselves
        if (event.source !== window) return;

        if (event.data && event.data.type === 'FROM_PAGE') {
            // Handle the message and potentially respond
            const response = RoutsAPI.greet(event.data.name);
            window.postMessage({ type: 'FROM_EXTENSION', response: response }, '*');
        }
    });
})();
