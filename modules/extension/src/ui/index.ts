import {ConfigurationManager} from "../core/configurationManager";
import {MeetingPlatformFactory} from "../core/platforms/meetingPlatformFactory";
import {AppConfiguration, IMeetingPlatform} from "../core/types";
import {ChatPanel} from "./chatPanel";
import {UIHandlers} from "./uiHandlers";
import {BackEndApi} from "../api/backEndApi";

const configurationManager = new ConfigurationManager();
const chatPanel = new ChatPanel();
let platform: IMeetingPlatform | null = null;
let config: AppConfiguration;

/**
 * Gets the current URL from the browser tab or window.
 */
async function getCurrentUrl(): Promise<string> {
  if (typeof chrome !== "undefined" && chrome.tabs) {
    return new Promise(resolve => {
      chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        resolve(tabs[0]?.url || window.location.href);
      });
    });
  }

  return window.location.href;
}

/**
 * Initializes platform and config, and shows relevant panel.
 */
async function initializeChatPanel(): Promise<void> {
  const url = await getCurrentUrl();
  platform = new MeetingPlatformFactory(url).getPlatform();

  chatPanel.showLoading();

  try {
    const local_config = await configurationManager.getConfig();
    if (local_config == null || local_config == undefined) {
      chatPanel.showUserUnAuthorizedContainer();
      return;
    }

    const api = new BackEndApi(local_config);
    try {
      await api.getUserMe();
    } catch (error) {
      console.error("Failed to authenticate user:", error);
      chatPanel.showUserUnAuthorizedContainer();
      return;
    }

    config = local_config;
  } catch (error) {
    chatPanel.showUserUnAuthorizedContainer();
    return;
  }
  chatPanel.setUserLogin(config.user);
  chatPanel.setDirection(config.service.direction);

  if (!platform) {
    chatPanel.showNoActiveMeetingContainer(url);
  } else {
    chatPanel.showJoinMeetingContainer(url);
  }
}

/**
 * Initialize everything on DOM ready.
 */
document.addEventListener("DOMContentLoaded", async () => {
  await initializeChatPanel();
  // Initialize UI handlers with the configuration, platform, and chat panel

  const btn = document.getElementById("au5-btn-login") as HTMLButtonElement | null;
  btn?.addEventListener("click", () => {
    chrome.runtime.sendMessage({
      action: "CLOSE_SIDEPANEL",
      panelUrl: config?.service?.panelUrl || "https://riter.ir"
    });
  });

  if (config && chatPanel) {
    new UIHandlers(config, chatPanel).init();
  }
});
