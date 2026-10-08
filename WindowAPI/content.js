(() => {
  'use strict';

  const SOURCE = 'cubehub-window-controller';

  function sendReady() {
    window.postMessage({
      source: SOURCE,
      type: 'ready'
    }, '*');
  }

  window.addEventListener('message', event => {
    if (event.source !== window) return;

    const message = event.data;
    if (!message || message.source !== SOURCE) return;

    if (message.type === 'getWindow' || message.type === 'updateWindow') {
      chrome.runtime.sendMessage(message, response => {
        const error = chrome.runtime.lastError;

        window.postMessage({
          source: SOURCE,
          type: 'response',
          requestId: message.requestId,
          data: error
            ? { ok: false, error: error.message }
            : (response || { ok: false, error: 'WindowAPI returned no response.' })
        }, '*');
      });
    }

    if (message.type === 'ping') {
      sendReady();
    }
  });

  // Send several ready messages so an IDE extension loaded after this
  // content script still discovers the WindowAPI.
  sendReady();
  setTimeout(sendReady, 250);
  setTimeout(sendReady, 1000);
})();