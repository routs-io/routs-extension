// Function to inject a script into the page
function injectScript(file: string, extensionId: string, runAt?: string) {
    console.log('starting injecting script', file);
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(file);
    if (runAt) {
        script.setAttribute('runat', runAt);
    }

    // Pass the extension ID by embedding it into the script as a data attribute
    script.setAttribute('data-extension-id', extensionId);

    script.onload = () => {
        script.remove();
    };

    (document.head || document.documentElement).appendChild(script);
    console.log('injected script');
}

// Inject the injectedScript.js with extension ID
injectScript('scripts/content-script/injectedScript.js', chrome.runtime.id);

// Listen for messages from the background script and forward them to the injected script
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'event' && message.event) {
        // Use postMessage to pass the event to the injected script
        window.postMessage(
            {
                source: 'routs-extension',
                event: message.event,
                data: message.data,
            },
            '*'
        );
    }
});