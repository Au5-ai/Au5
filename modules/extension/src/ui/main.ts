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

async function initializeChatPanel(): Promise<void> {
  const url = await getCurrentUrl();
  platform = new MeetingPlatformFactory(url).getPlatform();

  // if (!platform) {
  chatPanel = new ChatPanel("Asa Co", "No Active Meeting", "ltr");
  chatPanel.showTranscriptionContainer();
  chatPanel.addTranscription({
    transcriptBlockId: "12345",
    transcript: "Welcome to the meeting!",
    timestamp: new Date(),
    speaker: {
      fullName: "Mohammad Karimi",
      pictureUrl: "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo"
    }
  });
  //   chatPanel.showNoActiveMeetingContainer();
  // } else {
  //   chatPanel = new ChatPanel("Asa Co", platform.getMeetingId());
  //   chatPanel.showJoinMeetingContainer();
  // }
}

initializeChatPanel();

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if(message.type === ){
//     if (chatPanel) {
//       chatPanel.
//     }
//   }
// });
