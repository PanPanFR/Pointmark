// Wakes on toolbar click only. No polling, no network, no DOM cost.
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || tab.id === undefined) return;
  if (!/^(https?|file):/.test(tab.url || "")) {
    try {
      await chrome.action.setBadgeText({ text: "!", tabId: tab.id });
      await chrome.action.setBadgeBackgroundColor({ color: "#f38ba8", tabId: tab.id });
      setTimeout(() => void chrome.action.setBadgeText({ text: "", tabId: tab.id }), 2000);
    } catch {
      /* ignore */
    }
    return;
  }
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "wea:toggle-panel" });
  } catch {
    /* content script not injected yet (install/reload needed) */
  }
});
