import {MeetingPlatformFactory} from "../core/platforms/meetingPlatformFactory";
import {IMeetingPlatform} from "../core/types";
import {ChatPanel} from "./chatPanel";

const platform = new MeetingPlatformFactory(window.location.href).getPlatform();
let chatPanel: ChatPanel | null = null;
((): void => {
  if (!platform) {
    chatPanel = new ChatPanel("Asa Co", "No Active Meeting");
    chatPanel.showNoActiveMeeting();
  }
})();
