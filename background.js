function getDomain(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace("www.", "");
  } catch (e) {
    return null;
  }
}

async function updateBadge(tab) {
  if (!tab || !tab.url || tab.url.startsWith("about:")) return;
  const domain = getDomain(tab.url);
  if (!domain) return;

  const data = await chrome.storage.local.get(domain);
  const isEnabled = data[domain] !== false; 

  chrome.action.setBadgeText({ tabId: tab.id, text: isEnabled ? "ON" : "OFF" });
  chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: isEnabled ? "#4CAF50" : "#f44336" });
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  updateBadge(tab);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    updateBadge(tab);
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.url || tab.url.startsWith("about:")) return;
  const domain = getDomain(tab.url);
  if (!domain) return;

  const data = await chrome.storage.local.get(domain);
  const currentState = data[domain] !== false;
  const newState = !currentState;

  await chrome.storage.local.set({ [domain]: newState });

  updateBadge(tab);

  try {
    await chrome.tabs.sendMessage(tab.id, { action: "toggleTransparency", enabled: newState });
  } catch (err) {
    console.warn("Could not send toggle message to content script:", err);
  }
});