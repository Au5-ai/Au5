import {ExtensionMessageType} from "./types";
import {waitForElement} from "./utils/dom.utils";

let userName = "Mohammad Karimi";
let hasMeetingStarted = false;

async function meetingRoutines(): Promise<void> {
  const meetingEndIconData = {
    selector: "",
    text: ""
  };
  const captionsIconData = {
    selector: "",
    text: ""
  };

  meetingEndIconData.selector = ".google-symbols";
  meetingEndIconData.text = "call_end";
  captionsIconData.selector = ".google-symbols";
  captionsIconData.text = "closed_caption_off";

  const element = await waitForElement(meetingEndIconData.selector, meetingEndIconData.text);
  const message = {
    type: ExtensionMessageType.MEETING_STARTED
  };
  chrome.runtime.sendMessage(message, function () {});
  hasMeetingStarted = true;
}

meetingRoutines();
