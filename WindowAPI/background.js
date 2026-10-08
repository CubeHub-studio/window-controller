chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab && sender.tab.id;
  const windowId = sender.tab && sender.tab.windowId;

  if (tabId == null || windowId == null) {
    sendResponse({ ok: false, error: "No browser tab/window found." });
    return;
  }

  if (message.type === "getTab") {
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError || !tab) {
        sendResponse({ ok: false, error: chrome.runtime.lastError?.message || "Unable to get Gandi tab." });
        return;
      }

      chrome.windows.get(windowId, (win) => {
        if (chrome.runtime.lastError || !win) {
          sendResponse({ ok: false, error: chrome.runtime.lastError?.message || "Unable to get browser window." });
          return;
        }

        sendResponse({
          ok: true,
          active: !!tab.active,
          focused: !!tab.active && !!win.focused,
          url: tab.url || "",
          title: tab.title || "",
          tabId: tab.id,
          windowId: win.id
        });
      });
    });
    return true;
  }

  if (message.type === "newTab") {
    const url = String(message.url || "").trim();
    chrome.tabs.create({
      url: url || "about:blank",
      active: false
    }, (tab) => {
      if (chrome.runtime.lastError || !tab) {
        sendResponse({ ok: false, error: chrome.runtime.lastError?.message || "Unable to create tab." });
        return;
      }

      sendResponse({
        ok: true,
        tabId: tab.id,
        windowId: tab.windowId,
        url: tab.pendingUrl || tab.url || url
      });
    });
    return true;
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