import {ChromeBrowserService} from "./services/browser.service";
import {ExtensionMessageType, IBrowserService, IconData} from "./types";
import {waitForElement} from "./utils/dom.utils";
import {Logger} from "./utils/logger";

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

meetingRoutines(new ChromeBrowserService()).then(() => {
  console.log(getMeetingTitleFromUrl());
});

function getMeetingTitleFromUrl(): string | null {
  const url = new URL(window.location.href);
  const pathSegments = url.pathname.split("/").filter(Boolean);
  const meetingId = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : null;
  return meetingId;
}
