import {ConfigurationManager} from "../core/configurationManager";
import {MeetingPlatformFactory} from "../core/platforms/meetingPlatformFactory";
import {AppConfiguration, IMeetingPlatform} from "../core/types";
import {ChromeStorage} from "../core/utils/chromeStorage";
import {ChatPanel} from "./chatPanel";

function getCurrentUrl(): Promise<string> {
  return new Promise(resolve => {
    let currentUrl = window.location.href;

    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        if (tabs[0] && tabs[0].url) {
          resolve(tabs[0].url);
        } else {
          resolve(currentUrl);
        }
      });
    } else {
      resolve(currentUrl);
    }
  });
}

let platform: IMeetingPlatform | null;
let chatPanel: ChatPanel = new ChatPanel();
let config: AppConfiguration;
const configurationManager = new ConfigurationManager(new ChromeStorage());

async function initializeChatPanel(): Promise<void> {
  const url = await getCurrentUrl();
  platform = new MeetingPlatformFactory(url).getPlatform();

  try {
    config = await configurationManager.getConfig();
    if (!config) {
      chatPanel.showUserUnAuthorizedContainer();
      return;
    }
  } catch (error) {
    chatPanel.showUserUnAuthorizedContainer();
    return;
  }

  if (!platform) {
    chatPanel.showNoActiveMeetingContainer();
  } else {
    chatPanel.showJoinMeetingContainer();
  }
}

initializeChatPanel();

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if(message.type === ){
//     if (chatPanel) {
//       chatPanel.
//     }
//   }
// });

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("au5-btn-joinMeeting") as HTMLButtonElement | null;
  if (button) {
    button.addEventListener("click", () => {
      chatPanel?.showTranscriptionContainer(config.service.companyName, platform?.getMeetingId() || "Meeting Room");
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("au5-btn-reload") as HTMLButtonElement | null;
  if (button) {
    button.addEventListener("click", async () => {
      const url = await getCurrentUrl();
      platform = new MeetingPlatformFactory(url).getPlatform();
      if (!platform) {
        chatPanel.showNoActiveMeetingContainer();
      } else {
        chatPanel.showJoinMeetingContainer();
      }
    });
  }
});
