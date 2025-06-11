chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const isMeet = tab.url.includes("meet.google.com");
    console.log("Tab updated:", tabId, changeInfo, tab.url);
    chrome.sidePanel.setOptions({
      tabId,
      path: "sidepanel.html",
      enabled: isMeet
    });
  }
});
