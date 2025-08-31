// Background service worker for Au5 Chrome Extension

console.log("Au5 Extension background script loaded");

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed:", details);

  if (details.reason === "install") {
    // Set default settings
    chrome.storage.sync.set({
      enabled: true,
      settings: {
        theme: "light",
        notifications: true,
      },
    });
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in background:", message);

  switch (message.type) {
    case "GET_TAB_INFO":
      if (sender.tab) {
        sendResponse({
          success: true,
          data: {
            url: sender.tab.url,
            title: sender.tab.title,
            id: sender.tab.id,
          },
        });
      }
      break;

    case "STORAGE_GET":
      chrome.storage.sync.get(message.keys, (result) => {
        sendResponse({ success: true, data: result });
      });
      return true; // Keep message channel open for async response

    case "STORAGE_SET":
      chrome.storage.sync.set(message.data, () => {
        sendResponse({ success: true });
      });
      return true; // Keep message channel open for async response

    default:
      console.warn("Unknown message type:", message.type);
      sendResponse({ success: false, error: "Unknown message type" });
  }
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    console.log("Tab updated:", tab.url);
    // Inject content script if needed
  }
});

export {};
