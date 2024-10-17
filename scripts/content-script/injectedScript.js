(function () {
    // Define your API
    const RoutsAPI = {
        EXTENSION_ID: 'cdjjadfcddoglhopfjbfbmgocigecbci',
        navigate: function (targetRoute) {
            console.log('navigate', targetRoute);
            window.chrome.runtime.sendMessage(this.EXTENSION_ID, { action: 'navigate', targetRoute });
        },
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
})();
