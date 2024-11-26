; (function () {
  // Retrieve the extension ID from the script tag's data attribute
  const scriptTag = document.currentScript;
  const EXTENSION_ID = scriptTag ? scriptTag.getAttribute('data-extension-id') : '';

  // Event emitter class
  class EventEmitter {
    constructor() {
      this.events = {};
    }

    on(event, listener) {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(listener);
    }

    off(event, listener) {
      if (!this.events[event]) return;
      this.events[event] = this.events[event].filter(l => l !== listener);
    }

    emit(event, ...args) {
      if (!this.events[event]) return;
      this.events[event].forEach(listener => listener(...args));
    }
  }

  // Define your API
  const RoutsAPI = {
    eventEmitter: new EventEmitter(),

    request: function ({ method, params }) {
      const response = window.chrome.runtime.sendMessage(EXTENSION_ID, { method, params });
      return response;
    },

    on: function (event, listener) {
      this.eventEmitter.on(event, listener);
    },

    off: function (event, listener) {
      this.eventEmitter.off(event, listener);
    },

    _emit: function (event, data) {
      this.eventEmitter.emit(event, data);
    },
  };

  window.addEventListener('message', (event) => {
    if (event.source !== window || event.data.source !== 'routs-extension') {
        return;
    }

    // Emit the event to the RoutsAPI eventEmitter
    RoutsAPI._emit(event.data.event, event.data.data);
});

  window.routs = RoutsAPI;
})();
