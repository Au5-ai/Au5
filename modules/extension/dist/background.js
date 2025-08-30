function openSidePanel(tabId) {
  chrome.sidePanel.setOptions({
    tabId,
    path: "sidepanel.html",
    enabled: true
  });
  chrome.sidePanel.open({ tabId });
}
chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;
  openSidePanel(tab.id);
});
chrome.runtime.onMessage.addListener((message, sender) => {
  var _a;
  if ((message == null ? void 0 : message.type) === "OPEN_SIDEPANEL" && ((_a = sender.tab) == null ? void 0 : _a.id)) {
    openSidePanel(sender.tab.id);
  }
  if ((message == null ? void 0 : message.action) === "CLOSE_SIDEPANEL") {
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        chrome.sidePanel.setOptions({
          tabId: tab.id,
          enabled: false
        });
      }
    });
  }
});
