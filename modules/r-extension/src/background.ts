function openSidePanel(tabId: number) {
  chrome.sidePanel.setOptions({
    tabId,
    path: "src/sidePanel/sidepanel.html",
    enabled: true,
  });
  chrome.sidePanel.open({ tabId });
}

chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;
  openSidePanel(tab.id);
});
