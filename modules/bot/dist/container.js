import { ErrorMessages } from "./constants";
import { startMeetingBot } from "./program";
async function main() {
    //const rawConfig = process.env.MEETING_CONFIG;
    const rawConfig = `{
  "hubUrl": "https://hub.example.com",
  "platform": "googleMeet",
  "meetingUrl": "https://meet.google.com/kqt-byur-jya",
  "model": "liveCaption",
  "botDisplayName": "Au5Bot",
  "meetingId": "kqt-byur-jya",
  "language": "fa-IR",
  "autoLeave": {
    "waitingEnter": 30000,
    "noParticipant": 60000,
    "allParticipantsLeft": 120000
  },
  "meetingDom": {
    "leaveButton": "[aria-label=\"Leave call\"]",
    "enterNameField": "input[type=\"text\"][aria-label=\"Your name\"]",
    "joinButton": "//button[.//span[text()=\"Ask to join\"]]",
    "muteButton": "[aria-label*=\"Turn off microphone\"]",
    "cameraOffButton": "[aria-label*=\"Turn off camera\"]"
  }
}`;
    if (!rawConfig) {
        console.error(ErrorMessages.MEETING_CONFIG_NOT_SET);
        process.exit(1);
    }
    let parsedConfig;
    try {
        parsedConfig = JSON.parse(rawConfig);
    }
    catch (error) {
        console.error(ErrorMessages.INVALID_MEETING_CONFIG_JSON, error);
        process.exit(1);
    }
    try {
        await startMeetingBot(parsedConfig);
    }
    catch (error) {
        console.error(ErrorMessages.RUNNING_BOT, error);
        process.exit(1);
    }
}
main();
