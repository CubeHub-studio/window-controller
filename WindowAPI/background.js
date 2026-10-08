chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const windowId = sender.tab && sender.tab.windowId;

  if (windowId == null) {
    sendResponse({ ok: false, error: "No browser window found." });
    return;
  }

  if (message.type === "getWindow") {
    chrome.windows.get(windowId, (win) => {
      if (chrome.runtime.lastError || !win) {
        sendResponse({ ok: false, error: chrome.runtime.lastError?.message || "Unable to get window." });
        return;
      }

      sendResponse({
        ok: true,
        left: win.left,
        top: win.top,
        width: win.width,
        height: win.height,
        state: win.state,
        focused: win.focused,
        type: win.type
      });
    });
    return true;
  }

  if (message.type === "updateWindow") {
    const update = {};

    if (Number.isFinite(message.left)) update.left = Math.round(message.left);
    if (Number.isFinite(message.top)) update.top = Math.round(message.top);
    if (Number.isFinite(message.width)) update.width = Math.max(1, Math.round(message.width));
    if (Number.isFinite(message.height)) update.height = Math.max(1, Math.round(message.height));

    if (["normal", "minimized", "maximized", "fullscreen"].includes(message.state)) {
      update.state = message.state;
    }

    chrome.windows.update(windowId, update, (win) => {
      if (chrome.runtime.lastError || !win) {
        sendResponse({ ok: false, error: chrome.runtime.lastError?.message || "Unable to update window." });
        return;
      }

      sendResponse({
        ok: true,
        left: win.left,
        top: win.top,
        width: win.width,
        height: win.height,
        state: win.state,
        focused: win.focused,
        type: win.type
      });
    });
    return true;
  }
});