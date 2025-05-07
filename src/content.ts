import {ChromeBrowserService} from "./services/browser.service";
import {ExtensionMessageType, IBrowserService, IconData} from "./types";
import {waitForElement} from "./utils/dom.utils";

let userName = "Mohammad Karimi";
let hasMeetingStarted = false;
let meetingTitle = "";
let hasMeetingEnded = false;

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
    console.log("Meeting started detected.", {type: ExtensionMessageType.MEETING_STARTED});
    hasMeetingStarted = true;
  } catch (error) {
    console.error("Failed to detect meeting start:", error);
  }
}

await meetingRoutines(new ChromeBrowserService());
setTimeout(() => updateMeetingTitle(), 5000);

function updateMeetingTitle() {
  try {
    // NON CRITICAL DOM DEPENDENCY
    const meetingTitleElement = document.querySelector(".u6vdEc");
    if (meetingTitleElement?.textContent) {
      meetingTitle = meetingTitleElement.textContent;
      overWriteChromeStorage(["meetingTitle"], false);
    } else {
      throw new Error("Meeting title element not found in DOM");
    }
  } catch (err) {
    console.error(err);

    if (!hasMeetingEnded) {
    }
  }
}
