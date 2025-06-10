import {ConfigurationManager} from "./core/configurationManager";
import {MessageTypes} from "./core/constants";
import {MeetingPlatformFactory} from "./core/platforms/meetingPlatformFactory";
import {
  AppConfiguration,
  IMeetingPlatform,
  IMessage,
  ReactionAppliedMessage,
  TranscriptionEntry,
  User
} from "./core/types";
import {ChromeStorage} from "./core/utils/chromeStorage";
import {DomUtils} from "./core/utils/dom.utils";
import {MeetingHubClient} from "./hub/meetingHubClient";
import SidePanel from "./ui/chatPanel";

const platform: IMeetingPlatform = new MeetingPlatformFactory(window.location.href).getPlatform();
let domUtils = new DomUtils();
let meetingHubClient: MeetingHubClient;
let config: AppConfiguration;
const meetingEndIcon = {
  selector: ".google-symbols",
  text: "call_end"
};

(async function initMeetingRoutine(): Promise<void> {
  try {
    const configurationManager = new ConfigurationManager(new ChromeStorage());
    config = await configurationManager.getConfig();
    await domUtils.waitForMatch(meetingEndIcon.selector, meetingEndIcon.text);

    SidePanel.createSidePanel(config, platform.getMeetingId());

    document.getElementById("")?.addEventListener("click", () => {
      meetingHubClient = new MeetingHubClient(config, platform.getMeetingId());
      const isConnected = meetingHubClient.startConnection(); // TODO: Handle when the user clicks to join the meeting

      if (!isConnected) {
        console.error("Failed to connect to the meeting hub.");
        return;
      }

      SidePanel.showTranscriptionsContainer();
    });
  } catch (error) {
    console.error("Meeting routine execution failed:", error);
  }
})();

export function handleWindowMessage(action: string, payload: IMessage): void {
  switch (action) {
    case MessageTypes.NotifyRealTimeTranscription:
      const transcriptEntry = payload as TranscriptionEntryMessage;

      SidePanel.addTranscription({
        meetingId: transcriptEntry.meetingId,
        transcriptBlockId: transcriptEntry.transcriptBlockId,
        speaker: transcriptEntry.speaker,
        transcript: transcriptEntry.transcript,
        timestamp: transcriptEntry.timestamp
      } as TranscriptionEntry);
      break;

    case MessageTypes.NotifyUserJoining:
      const userJoinedMsg = payload as UserJoinedInMeetingMessage;

      if (!userJoinedMsg.user) {
        return;
      }

      const item: User = {
        id: userJoinedMsg.user.id,
        fullName: userJoinedMsg.user.fullName,
        pictureUrl: userJoinedMsg.user.pictureUrl,
        joinedAt: userJoinedMsg.user.joinedAt || new Date()
      };
      meeting.users.push(item);
      SidePanel.usersJoined(item, meeting.isStarted);
      break;

    case MessageTypes.ReactionApplied:
      const reactionMsg = payload as ReactionAppliedMessage;
      if (!reactionMsg.meetingId || !reactionMsg.transcriptBlockId || !reactionMsg.user || !reactionMsg.reaction) {
        return;
      }
      SidePanel.addReaction(reactionMsg);
      break;
    default:
      console.warn("Unknown message action received:", action);
  }
}
