const CONFIGURATION_KEY = "configuration";
const ACCESS_TOKEN_KEY = "access_token";
const MESSAGE_SOURCE = "AU5_PANEL";
const EXTENSION_SOURCE = "AU5_EXTENSION";

type MessageEventData = {
  source?: string;
  type?: string;
  payload?: any;
};

type AppConfiguration = {
  user: {
    id: string;
    fullName: string;
    pictureUrl: string;
  };
  service: {
    backendUrl: string;
    [key: string]: any;
  };
};

function isValidMessage(event: MessageEvent<MessageEventData>): boolean {
  return event.source === window && !!event.data && event.data.source === MESSAGE_SOURCE;
}

function handlePingExtension() {
  const version = chrome.runtime.getManifest().version;
  window.postMessage({source: EXTENSION_SOURCE, type: "PING_REPLY", installed: true, version}, "*");
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
  try {
    chrome.storage.local.set({[ACCESS_TOKEN_KEY]: token}, () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving auth token:", chrome.runtime.lastError);
        return;
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

// let addBotDisabled = false;
// async function handleAddBot() {
//   console.log("Add bot button clicked");
//   if (addBotDisabled) {
//     console.warn("Button is disabled, please wait before retrying.");
//     return;
//   }

//   const button = document.getElementById("au5-meet-button");
//   if (!button) return;

//   try {
//     // Get configuration from storage
//     const configStr = await new Promise<string | null>(resolve => {
//       chrome.storage.local.get([CONFIGURATION_KEY], result => {
//         resolve(result[CONFIGURATION_KEY] || null);
//       });
//     });

//     if (!configStr) {
//       console.error("Configuration is not set.");
//       handleOpenSidePanel();
//       return;
//     }

//     const config: AppConfiguration = JSON.parse(configStr);

//     // Get access token
//     const token = await new Promise<string | null>(resolve => {
//       chrome.storage.local.get([ACCESS_TOKEN_KEY], result => {
//         resolve(result[ACCESS_TOKEN_KEY] || null);
//       });
//     });

//     if (!token) {
//       console.error("Access token is not set.");
//       handleOpenSidePanel();
//       return;
//     }

//     // Get meet ID from URL
//     const url = window.location.href;
//     const meetRegex = /https:\/\/meet\.google\.com\/([a-zA-Z0-9]{3}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{3})/;
//     const match = url.match(meetRegex);

//     if (!match) {
//       console.error("Could not extract meet ID from URL");
//       return;
//     }

//     const meetId = match[1];

//     // Call backend API to add bot
//     const response = await fetch(`${config.service.serviceBaseUrl}/meetings/bots`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`
//       },
//       body: JSON.stringify({
//         meetId: meetId,
//         platform: "GoogleMeet"
//       })
//     });

//     if (!response.ok) {
//       throw new Error("Failed to add bot");
//     }

//     const data = await response.json();
//     localStorage.setItem("au5-meetingId", JSON.stringify(data));

//     // Update button state with countdown
//     let seconds = 60;
//     addBotDisabled = true;
//     button.textContent = `${seconds}s to retry`;

//     const interval = setInterval(() => {
//       seconds--;
//       if (seconds > 0) {
//         button.textContent = `${seconds}s to retry`;
//       } else {
//         clearInterval(interval);
//         addBotDisabled = false;
//         button.textContent = "Join bot in Meet";
//       }
//     }, 1000);

//     // Open side panel to show transcription
//     handleOpenSidePanel();
//   } catch (error) {
//     console.error("Failed to add bot:", error);
//     addBotDisabled = false;
//     if (button) {
//       button.textContent = "Join bot in Meet";
//     }
//   }
// }

// function detectGoogleMeetURL(): string | null {
//   const url = window.location.href;
//   const meetRegex = /https:\/\/meet\.google\.com\/([a-zA-Z0-9]{3}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{3})/;
//   const match = url.match(meetRegex);
//   return match ? match[0] : null;
// }

// function createMeetingContainer() {
//   // Check if container already exists
//   if (document.getElementById("au5-meet-container")) {
//     return;
//   }

//   const container = document.createElement("div");
//   container.id = "au5-meet-container";

//   const innerContainer = document.createElement("div");
//   innerContainer.id = "au5-meet-container-inner";

//   const button = document.createElement("button");
//   button.id = "au5-meet-button";
//   button.textContent = "Join bot in Meet";
//   button.onclick = () => {
//     handleAddBot();
//   };

//   innerContainer.appendChild(button);
//   container.appendChild(innerContainer);
//   document.body.appendChild(container);

//   injectStyles();
// }

// function injectStyles() {
//   if (document.getElementById("au5-meet-styles")) {
//     return;
//   }

//   const style = document.createElement("style");
//   style.id = "au5-meet-styles";
//   style.textContent = `
//     @keyframes au5-gradient-glow-1 {
//       0% {
//         background-position: 0% 50%;
//       }
//       50% {
//         background-position: 100% 50%;
//       }
//       100% {
//         background-position: 0% 50%;
//       }
//     }

//     @keyframes au5-gradient-glow-2 {
//       0% {
//         background-position: 100% 50%;
//       }
//       50% {
//         background-position: 0% 50%;
//       }
//       100% {
//         background-position: 100% 50%;
//       }
//     }

//     #au5-meet-container {
//       position: fixed;
//       top: 24px;
//       right: 24px;
//       z-index: 9999;
//       cursor: pointer;
//     }

//     #au5-meet-container::after {
//     content: '';
//     position: absolute;
//     inset: 16px;
//     border-radius: 24px;
//     background: linear-gradient(270deg, #06b6d4, #8b5cf6, #f43f5e, #06b6d4);
//     background-size: 300% 300%;
//     animation: au5-gradient-glow-2 7s
//     linear infinite;
//     opacity: 0.5;
//     filter: blur(30px);
//     }

//     #au5-meet-container-inner {
//       position: relative;
//       background: rgba(255, 255, 255, 0.95);
//       backdrop-filter: blur(12px);
//       border-radius: 16px;
//       box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
//       transition: transform 0.3s ease;
//     }

//     #au5-meet-container:hover #au5-meet-container-inner {
//       transform: translateY(-2px);
//     }

//     #au5-meet-button {
//       position: relative;
//       background: transparent;
//       color: #1e293b;
//       border: none;
//       padding: 16px;
//       font-size: 13px;
//       font-weight: 600;
//       cursor: pointer;
//       transition: all 0.3s ease;
//       font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//     }

//     #au5-meet-button:hover {
//       color: #0f172a;
//     }

//     #au5-meet-button:active {
//       transform: scale(0.98);
//     }
//   `;

//   document.head.appendChild(style);
// }

// function checkForParticipants() {
//   const participantElements = document.querySelectorAll("div[data-participant-id]");
//   return participantElements.length > 0;
// }

// function initGoogleMeetDetection() {
//   const meetURL = detectGoogleMeetURL();
//   if (!meetURL) return;

//   const observer = new MutationObserver(() => {
//     if (checkForParticipants()) {
//       createMeetingContainer();
//       observer.disconnect();
//     }
//   });

//   if (document.readyState === "loading") {
//     document.addEventListener("DOMContentLoaded", () => {
//       if (checkForParticipants()) {
//         createMeetingContainer();
//       } else {
//         observer.observe(document.body, {
//           childList: true,
//           subtree: true
//         });
//       }
//     });
//   } else {
//     if (checkForParticipants()) {
//       createMeetingContainer();
//     } else {
//       observer.observe(document.body, {
//         childList: true,
//         subtree: true
//       });
//     }
//   }
// }

// // Initialize on load
// initGoogleMeetDetection();

// // Also watch for URL changes in SPAs
// let lastUrl = window.location.href;
// new MutationObserver(() => {
//   const currentUrl = window.location.href;
//   if (currentUrl !== lastUrl) {
//     lastUrl = currentUrl;
//     initGoogleMeetDetection();
//   }
// }).observe(document, {subtree: true, childList: true});
