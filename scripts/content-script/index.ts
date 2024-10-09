// Function to inject a script into the page
function injectScript(file: string, runAt?: string) {
    console.log('starting injecting script', file)
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(file);
    if (runAt) {
        script.setAttribute('runat', runAt);
    }
    script.onload = () => {
        script.remove();
    };
    
    (document.head || document.documentElement).appendChild(script);

    console.log('injected script')
}

// Inject the injectedScript.js
injectScript('scripts/content-script/injectedScript.js');
