const CONFIGURATION_KEY = "configuration";
const MESSAGE_SOURCE = "AU5_BACKOFFICE";
const EXTENSION_SOURCE = "AU5_EXTENSION";
function isValidMessage(event) {
  return event.source === window && !!event.data && event.data.source === MESSAGE_SOURCE;
}
function handlePingExtension() {
  window.postMessage({ source: EXTENSION_SOURCE, type: "PING_REPLY", installed: true }, "*");
}
function handleOpenSidePanel() {
  chrome.runtime.sendMessage({ type: "OPEN_SIDEPANEL" });
}
function handleConfigUpdate(config) {
  var _a;
  if (!((_a = chrome == null ? void 0 : chrome.storage) == null ? void 0 : _a.local)) {
    console.error("chrome.storage.local is undefined in content.js");
    return;
  }
  chrome.storage.local.set({ [CONFIGURATION_KEY]: JSON.stringify(config) }, () => {
    console.log("✅ Config saved from content.js:", config);
  });
}
function handleMessage(event) {
  if (!isValidMessage(event)) return;
  const { type, payload } = event.data;
  switch (type) {
    case "PING_EXTENSION":
      handlePingExtension();
      break;
    case "OPEN_SIDEPANEL":
      handleOpenSidePanel();
      break;
    case "CONFIG_UPDATE":
      handleConfigUpdate(payload);
      break;
  }
}
window.addEventListener("message", handleMessage);
