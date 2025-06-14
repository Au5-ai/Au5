import {ConfigurationManager} from "../core/configurationManager";
import {MeetingPlatformFactory} from "../core/platforms/meetingPlatformFactory";
import {AppConfiguration, IMeetingPlatform} from "../core/types";
import {ChromeStorage} from "../core/utils/chromeStorage";
import {ChatPanel} from "./chatPanel";

const configurationManager = new ConfigurationManager(new ChromeStorage());
const chatPanel = new ChatPanel();

let platform: IMeetingPlatform | null = null;
let config: AppConfiguration | undefined;

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

  try {
    config = await configurationManager.getConfig();
    if (!config) throw new Error("Missing configuration.");
  } catch (error) {
    console.warn("Configuration error:", error);
    chatPanel.showUserUnAuthorizedContainer();
    return;
  }
  return;
  if (!platform) {
    chatPanel.showNoActiveMeetingContainer();
  } else {
    chatPanel.showJoinMeetingContainer();
  }
}

/**
 * Sets up all UI button handlers.
 */
function setupButtonHandlers(): void {
  const joinButton = document.getElementById("au5-btn-joinMeeting") as HTMLButtonElement | null;
  const reloadButton = document.getElementById("au5-btn-reload") as HTMLButtonElement | null;

  joinButton?.addEventListener("click", handleJoinMeetingClick);
  reloadButton?.addEventListener("click", handleReloadMeetingClick);
}

/**
 * Handles click event for join button.
 */
function handleJoinMeetingClick(): void {
  if (!config || !platform) return;

  const meetingId = platform.getMeetingId() || "Meeting Room";
  chatPanel.showTranscriptionContainer(config.service.companyName, meetingId);
}

/**
 * Handles click event for reload Meeting enterance button.
 */
async function handleReloadMeetingClick(): Promise<void> {
  const url = await getCurrentUrl();
  platform = new MeetingPlatformFactory(url).getPlatform();

  if (!platform) {
    chatPanel.showNoActiveMeetingContainer();
  } else {
    chatPanel.showJoinMeetingContainer();
  }
}

/**
 * Initialize everything on DOM ready.
 */
document.addEventListener("DOMContentLoaded", () => {
  initializeChatPanel();
  setupButtonHandlers();
});
