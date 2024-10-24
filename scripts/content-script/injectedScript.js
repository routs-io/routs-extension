;(function () {
  // Retrieve the extension ID from the script tag's data attribute
  const scriptTag = document.currentScript;
  const EXTENSION_ID = scriptTag ? scriptTag.getAttribute('data-extension-id') : '';

  // Define your API
  const RoutsAPI = {
    request: function ({ method, params }) {
      const response = window.chrome.runtime.sendMessage(EXTENSION_ID, { method, params });
      return response;
    }
  };

  window.routs = RoutsAPI;
})();
