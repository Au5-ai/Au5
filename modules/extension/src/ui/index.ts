import {ConfigurationManager} from "../core/configurationManager";
import {MeetingPlatformFactory} from "../core/platforms/meetingPlatformFactory";
import {AppConfiguration, IMeetingPlatform, MessageTypes} from "../core/types";
import {ChatPanel} from "./chatPanel";

const configurationManager = new ConfigurationManager();
const chatPanel = new ChatPanel();

let platform: IMeetingPlatform | null = null;
let config: AppConfiguration | null = null;

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
    console.log("Configuration loaded:", config);
    if (config == null || config == undefined) {
      chatPanel.showUserUnAuthorizedContainer();
      return;
    }
  } catch (error) {
    console.warn("Configuration error:", error);
    chatPanel.showUserUnAuthorizedContainer();
    return;
  }

  if (!platform) {
    chatPanel.showNoActiveMeetingContainer(url);
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
  const optionsButton = document.getElementById("au5-btn-options") as HTMLButtonElement | null;
  const checkLoginButton = document.getElementById("au5-btn-check") as HTMLButtonElement | null;
  joinButton?.addEventListener("click", handleJoinMeetingClick);
  reloadButton?.addEventListener("click", handleReloadMeetingClick);

  optionsButton?.addEventListener("click", () => {
    window.open("options.html", "_blank");
  });

  checkLoginButton?.addEventListener("click", async () => {
    await initializeChatPanel();
  });

  document.addEventListener("click", event => {
    const target = event.target as HTMLElement;
    const reaction = target.closest(".au5-reaction");
    if (reaction) {
      const reactionType = reaction.getAttribute("reaction-type");
      const blockId = reaction.getAttribute("data-blockId");
      if (reactionType && blockId) {
        chatPanel.addReaction({
          type: MessageTypes.ReactionApplied,
          transcriptBlockId: blockId,
          user: {fullName: config?.user.fullName || "Unknown", pictureUrl: config?.user.pictureUrl || ""},
          reactionType: reactionType
        });
      }
    }
  });
}

/**
 * Handles click event for join button.
 */
async function handleJoinMeetingClick(): Promise<void> {
  if (!config || !platform) return;

  const url = await getCurrentUrl();
  platform = new MeetingPlatformFactory(url).getPlatform();

  if (!platform) {
    chatPanel.showNoActiveMeetingContainer(url);
    return;
  }

  const meetingId = platform.getMeetingId();
  chatPanel.showTranscriptionContainer(config.service.companyName, meetingId);
}

/**
 * Handles click event for reload Meeting enterance button.
 */
async function handleReloadMeetingClick(): Promise<void> {
  const url = await getCurrentUrl();
  platform = new MeetingPlatformFactory(url).getPlatform();

  if (!platform) {
    chatPanel.showNoActiveMeetingContainer(url);
  } else {
    chatPanel.showJoinMeetingContainer();
  }
}

/**
 * Initialize everything on DOM ready.
 */
document.addEventListener("DOMContentLoaded", async () => {
  await initializeChatPanel();
  setupButtonHandlers();
});
