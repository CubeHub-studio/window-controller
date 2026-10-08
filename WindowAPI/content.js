(() => {
  const SOURCE = "cubehub-window-controller";

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;

    const message = event.data;
    if (!message || message.source !== SOURCE) return;

    if (message.type === "getWindow" || message.type === "updateWindow") {
      chrome.runtime.sendMessage(message, (response) => {
        window.postMessage({
          source: SOURCE,
          type: "response",
          requestId: message.requestId,
          data: response || {
            ok: false,
            error: chrome.runtime.lastError?.message || "No response from Window API."
          }
        }, "*");
      });
    }
  });

  window.postMessage({
    source: SOURCE,
    type: "ready"
  }, "*");
})();