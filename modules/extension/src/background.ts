function openSidePanel(tabId: number) {
  chrome.sidePanel.setOptions({
    tabId,
    path: "sidepanel.html",
    enabled: true
  });
  chrome.sidePanel.open({tabId});
}

chrome.action.onClicked.addListener(tab => {
  if (!tab.id) return;
  openSidePanel(tab.id);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "OPEN_SIDEPANEL" && sender.tab?.id) {
    openSidePanel(sender.tab.id);
  }
});
