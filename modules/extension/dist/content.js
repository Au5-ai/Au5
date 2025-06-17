const CONFIGURATION_KEY = "configuration";
window.addEventListener("message", (event) => {
  var _a, _b;
  if (event.source !== window) return;
  if (((_a = event.data) == null ? void 0 : _a.source) !== "AU5_BACKOFFICE") return;
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
