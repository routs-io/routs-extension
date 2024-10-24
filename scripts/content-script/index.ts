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
