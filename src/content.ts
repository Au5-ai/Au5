import {ChromeBrowserService} from "./services/browser.service";
import {ExtensionMessageType, IBrowserService, IconData, ExtensionMessage} from "./types";
import {waitForElement} from "./utils/dom.utils";

let userName = "Mohammad Karimi";
let hasMeetingStarted = false;

const meetingEndIcon: IconData = {
  selector: ".google-symbols",
  text: "call_end"
};

const captionsIcon: IconData = {
  selector: ".google-symbols",
  text: "closed_caption_off"
};

export async function meetingRoutines(browserService: IBrowserService): Promise<void> {
  try {
    await waitForElement(meetingEndIcon.selector, meetingEndIcon.text);
    browserService.sendMessage({type: ExtensionMessageType.MEETING_STARTED});
    hasMeetingStarted = true;
  } catch (error) {
    console.error("Failed to detect meeting start:", error);
  }
}

meetingRoutines(new ChromeBrowserService());
