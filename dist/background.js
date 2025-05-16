chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message, sender);
  sendResponse({ success: true });
});
