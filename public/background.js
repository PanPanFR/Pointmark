// Event-only worker: wakes on click/shortcut. No polling, no network, no DOM cost.
async function badge(tabId, text) {
  try {
    await chrome.action.setBadgeText({ text, tabId });
    if (text) {
      await chrome.action.setBadgeBackgroundColor({ color: "#f38ba8", tabId });
      setTimeout(() => void chrome.action.setBadgeText({ text: "", tabId }), 2000);
    }
  } catch {
    /* ignore */
  }
}

async function handle(tab, message) {
  if (!tab || tab.id === undefined) return;
  if (!/^(https?|file):/.test(tab.url || "")) {
    await badge(tab.id, "!"); // restricted page: chrome://, store, NTP, devtools
    return;
  }
  try {
    await chrome.tabs.sendMessage(tab.id, message);
  } catch {
    // No live content script = tab opened before install/Reload. Refresh it.
    await badge(tab.id, "F5");
  }
}

chrome.action.onClicked.addListener((tab) => void handle(tab, { type: "wea:toggle-panel" }));
chrome.commands.onCommand.addListener(async (cmd, tab) => {
  if (cmd !== "toggle-picker" || !tab) return;
  await handle(tab, { type: "wea:toggle-picker" });
});
