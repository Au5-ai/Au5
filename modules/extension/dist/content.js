import { ConfigurationManager } from "./core/configurationManager";
import { MessageTypes, PostMessageSource } from "./core/types/index";
import { MeetingPlatformFactory } from "./core/platforms/meetingPlatformFactory";
import { ChromeStorage } from "./core/utils/chromeStorage";
import { DomUtils } from "./core/utils/dom.utils";
import { MeetingHubClient } from "./hub/meetingHubClient";
import SidePanel from "./ui/chatPanel.ts.backup";
import { WindowMessageHandler } from "./core/windowMessageHandler.ts.backup";
const platform = new MeetingPlatformFactory(window.location.href).getPlatform();
let domUtils = new DomUtils();
let meetingHubClient;
let config;
const meetingEndIcon = {
    selector: ".google-symbols",
    text: "call_end"
};
const windowMessageHandler = new WindowMessageHandler(PostMessageSource.ContentScript, PostMessageSource.BackgroundScript, handleWindowMessage);
(async function main() {
    try {
        const configurationManager = new ConfigurationManager(new ChromeStorage());
        config = await configurationManager.getConfig();
        await domUtils.waitForMatch(meetingEndIcon.selector, meetingEndIcon.text);
        SidePanel.createSidePanel(config, platform.getMeetingId());
        document.getElementById("au5-joinMeeting-btn")?.addEventListener("click", () => {
            meetingHubClient = new MeetingHubClient(config, platform.getMeetingId());
            const isConnected = meetingHubClient.startConnection(); // TODO: Handle when the user clicks to join the meeting
            if (!isConnected) {
                console.error("Failed to connect to the meeting hub.");
                return;
            }
            SidePanel.showTranscriptionsContainer();
        });
    }
    catch (error) {
        console.error("Meeting routine execution failed:", error);
    }
})();
export function handleWindowMessage(action, payload) {
    console.log("Received message from background script:", action, payload);
    switch (action) {
        case MessageTypes.TranscriptionEntry:
            const transcriptEntry = payload;
            SidePanel.addTranscription({
                meetingId: transcriptEntry.meetingId,
                transcriptBlockId: transcriptEntry.transcriptBlockId,
                speaker: transcriptEntry.speaker,
                transcript: transcriptEntry.transcript,
                timestamp: transcriptEntry.timestamp
            });
            break;
        case MessageTypes.NotifyUserJoining:
            const userJoinedMsg = payload;
            if (!userJoinedMsg.user) {
                return;
            }
            SidePanel.usersJoined({
                id: userJoinedMsg.user.id,
                fullName: userJoinedMsg.user.fullName,
                pictureUrl: userJoinedMsg.user.pictureUrl
            });
            break;
        case MessageTypes.ReactionApplied:
            const reactionMsg = payload;
            if (!reactionMsg.meetingId || !reactionMsg.transcriptBlockId || !reactionMsg.user || !reactionMsg.reaction) {
                return;
            }
            SidePanel.addReaction(reactionMsg);
            break;
        default:
            console.warn("Unknown message action received:", action);
    }
}
