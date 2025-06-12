import {MeetingPlatformFactory} from "../core/platforms/meetingPlatformFactory";
import {IMeetingPlatform} from "../core/types";
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
let chatPanel: ChatPanel | null = null;

((): void => {
  getCurrentUrl().then(url => {
    platform = new MeetingPlatformFactory(url).getPlatform();

    if (!platform) {
      console.log("Platform detected:", url);
      chatPanel = new ChatPanel("Asa Co", "No Active Meeting");
      chatPanel.showNoActiveMeeting();
    } else {
      chatPanel = new ChatPanel("Asa Co", platform.getMeetingId());
      chatPanel.showJoinMeeting();
    }
  });
})();
