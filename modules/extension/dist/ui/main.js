import { MeetingPlatformFactory } from "../core/platforms/meetingPlatformFactory";
import { ChatPanel } from "./chatPanel";
const platform = new MeetingPlatformFactory(window.location.href).getPlatform();
let chatPanel = null;
(() => {
    if (!platform) {
        chatPanel = new ChatPanel("Asa Co", "No Active Meeting");
        chatPanel.showNoActiveMeeting();
    }
})();
