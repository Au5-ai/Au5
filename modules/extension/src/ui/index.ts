import {ConfigurationManager} from "../core/configurationManager";
import {MeetingPlatformFactory} from "../core/platforms/meetingPlatformFactory";
import {
  AppConfiguration,
  IMeetingPlatform,
  IMessage,
  MessageTypes,
  ReactionAppliedMessage,
  TranscriptionEntryMessage,
  UserJoinedInMeetingMessage
} from "../core/types";
import {MeetingHubClient} from "../hub/meetingHubClient";
import {ChatPanel} from "./chatPanel";

const configurationManager = new ConfigurationManager();
const chatPanel = new ChatPanel();
let meetingHubClient: MeetingHubClient;
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
    if (config == null || config == undefined) {
      chatPanel.showUserUnAuthorizedContainer();
      return;
    }
  } catch (error) {
    chatPanel.showUserUnAuthorizedContainer();
    return;
  }
  chatPanel.setDirection(config.service.direction);

  if (!platform) {
    chatPanel.showNoActiveMeetingContainer(url);
  } else {
    chatPanel.showJoinMeetingContainer(url);
  }
}

/**
 * Sets up all UI button handlers.
 */
function setupButtonHandlers(): void {
  const joinButton = document.getElementById("au5-btn-joinMeeting") as HTMLButtonElement | null;
  const reloadButton = document.getElementById("au5-btn-reload") as HTMLButtonElement | null;
  const optionsButton = document.getElementById("au5-btn-options") as HTMLButtonElement | null;
  const themeToggle = document.getElementById("au5-theme-toggle");

  const github = document.getElementById("github-link");
  const discord = document.getElementById("discord-link");

  joinButton?.addEventListener("click", handleJoinMeetingClick);
  reloadButton?.addEventListener("click", handleReloadMeetingClick);

  document.addEventListener("click", event => {
    const target = event.target as HTMLElement;
    const reaction = target.closest(".au5-reaction");
    if (reaction) {
      const reactionType = reaction.getAttribute("reaction-type");
      const blockId = reaction.getAttribute("data-blockId");
      if (reactionType && blockId) {
        if (meetingHubClient) {
          meetingHubClient.sendMessage({
            type: MessageTypes.ReactionApplied,
            meetingId: platform?.getMeetingId(),
            transcriptBlockId: blockId,
            user: {
              fullName: config?.user.fullName || "Unknown",
              pictureUrl: config?.user.pictureUrl || ""
            },
            reactionType: reactionType
          } as ReactionAppliedMessage);
          chatPanel.addReaction({
            type: MessageTypes.ReactionApplied,
            transcriptBlockId: blockId,
            user: {fullName: config?.user.fullName || "Unknown", pictureUrl: config?.user.pictureUrl || ""},
            reactionType: reactionType
          });
        }
      }
    }
  });

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const html = document.documentElement;
      const currentTheme = html.getAttribute("data-gpts-theme");
      html.setAttribute("data-gpts-theme", currentTheme === "light" ? "dark" : "light");
      const darkSvg = document.getElementById("darkmode");
      const lightSvg = document.getElementById("lightmode");
      if (currentTheme === "light") {
        darkSvg?.setAttribute("style", "display: inline;");
        lightSvg?.setAttribute("style", "display: none;");
      } else {
        darkSvg?.setAttribute("style", "display: none;");
        lightSvg?.setAttribute("style", "display: inline;");
      }
    });
  }

  optionsButton?.addEventListener("click", () => {
    window.open("options.html", "_blank");
  });

  github?.addEventListener("click", () => {
    window.open("https://github.com/Au5-ai/Au5", "_blank");
  });
  discord?.addEventListener("click", () => {
    window.open("https://discord.com/channels/1385091638422016101", "_blank");
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

  // Initialize the meeting hub client
  meetingHubClient = new MeetingHubClient(config, platform.getMeetingId());
  const isConnected = meetingHubClient.startConnection(handleMessage);

  if (!isConnected) {
    console.error("Failed to connect to the meeting hub.");
    return;
  }
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
    chatPanel.showJoinMeetingContainer(url);
  }
}

/**
 * Initialize everything on DOM ready.
 */
document.addEventListener("DOMContentLoaded", async () => {
  // await initializeChatPanel();
  setupButtonHandlers();
});

function handleMessage(msg: IMessage): void {
  switch (msg.type) {
    case MessageTypes.TranscriptionEntry:
      const transcriptEntry = msg as TranscriptionEntryMessage;

      chatPanel.addTranscription({
        meetingId: transcriptEntry.meetingId,
        transcriptBlockId: transcriptEntry.transcriptBlockId,
        speaker: transcriptEntry.speaker,
        transcript: transcriptEntry.transcript,
        timestamp: transcriptEntry.timestamp
      });
      break;

    case MessageTypes.NotifyUserJoining:
      const userJoinedMsg = msg as UserJoinedInMeetingMessage;

      if (!userJoinedMsg.user) {
        return;
      }

      chatPanel.usersJoined({
        type: MessageTypes.NotifyUserJoining,
        user: {
          id: userJoinedMsg.user.id,
          fullName: userJoinedMsg.user.fullName,
          pictureUrl: userJoinedMsg.user.pictureUrl
        }
      });
      break;

    case MessageTypes.ReactionApplied:
      const reactionMsg = msg as ReactionAppliedMessage;
      if (!reactionMsg.meetingId || !reactionMsg.transcriptBlockId || !reactionMsg.user || !reactionMsg.reactionType) {
        return;
      }
      chatPanel.addReaction(reactionMsg);
      break;
    default:
      break;
  }
}
