const CONFIGURATION_KEY = "configuration";
const ACCESS_TOKEN_KEY = "access_token";
const MESSAGE_SOURCE = "AU5_PANEL";
const EXTENSION_SOURCE = "AU5_EXTENSION";

type MessageEventData = {
  source?: string;
  type?: string;
  payload?: any;
};

function isValidMessage(event: MessageEvent<MessageEventData>): boolean {
  return event.source === window && !!event.data && event.data.source === MESSAGE_SOURCE;
}

function handlePingExtension() {
  window.postMessage({source: EXTENSION_SOURCE, type: "PING_REPLY", installed: true}, "*");
}

function handleOpenSidePanel() {
  try {
    chrome.runtime.sendMessage({type: "OPEN_SIDEPANEL"});
  } catch (e) {
    console.error("Extension context invalidated:", e);
  }
}

function handleConfigUpdate(config: any) {
  if (!chrome?.storage?.local) {
    console.error("chrome.storage.local is undefined in content.js");
    return;
  }
  chrome.storage.local.set({[CONFIGURATION_KEY]: JSON.stringify(config)}, () => {
    console.log("Config saved from content.js:", config);
  });
}

function handleTokenUpdate(token: string) {
  if (!chrome?.storage?.local) {
    console.error("chrome.storage.local is undefined in content.js");
    return;
  }
  console.log("Saving auth token to extension storage...", token);

  try {
    chrome.storage.local.set({[ACCESS_TOKEN_KEY]: token}, () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving auth token:", chrome.runtime.lastError);
        return;
      }
      console.log("Auth token saved from content.js with key:", ACCESS_TOKEN_KEY);
      try {
        chrome.storage.local.get(ACCESS_TOKEN_KEY, result => {
          console.log("Verification - Token in storage:", result[ACCESS_TOKEN_KEY] ? "Yes" : "No");
        });
      } catch (e) {
        console.warn("Extension context invalidated during verification");
      }
    });
  } catch (e) {
    console.error("Extension context invalidated:", e);
  }
}

function handleTokenRemove() {
  if (!chrome?.storage?.local) {
    console.error("chrome.storage.local is undefined in content.js");
    return;
  }

  try {
    chrome.storage.local.remove(ACCESS_TOKEN_KEY, () => {
      if (chrome.runtime.lastError) {
        console.error("Error removing auth token:", chrome.runtime.lastError);
        return;
      }
      console.log("Auth token removed from content.js");
    });
  } catch (e) {
    console.error("Extension context invalidated:", e);
  }
}

function handleMessage(event: MessageEvent<MessageEventData>) {
  if (!isValidMessage(event)) return;

  const {type, payload} = event.data;

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
    case "TOKEN_UPDATE":
      handleTokenUpdate(payload);
      break;
    case "TOKEN_REMOVE":
      handleTokenRemove();
      break;
    default:
      break;
  }
}

window.addEventListener("message", handleMessage);
