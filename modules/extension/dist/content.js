const CONFIGURATION_KEY = "configuration";
window.addEventListener("message", (event) => {
  var _a, _b;
  if (event.source !== window) return;
  if (!event.data) return;
  if (((_a = event.data) == null ? void 0 : _a.source) !== "AU5_BACKOFFICE") return;
  console.log("Received message from AU5_BACKOFFICE:", event.data.type, event.data.type === "PING_EXTENSION");
  if (event.data.type === "PING_EXTENSION") {
    console.log("Sending PING_REPLY to AU5_BACKOFFICE");
    window.postMessage({ source: "AU5_EXTENSION", type: "PING_REPLY", installed: true }, "*");
    return;
  }
  if (event.data.type === "CONFIG_UPDATE") {
    const config = event.data.payload;
    if (!((_b = chrome == null ? void 0 : chrome.storage) == null ? void 0 : _b.local)) {
      console.error("chrome.storage.local is undefined in content.js");
      return;
    }
    chrome.storage.local.set({ [CONFIGURATION_KEY]: JSON.stringify(config) }, () => {
      console.log("✅ Config saved from content.js:", config);
    });
  }
});
