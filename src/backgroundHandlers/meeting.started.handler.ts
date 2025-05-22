// import {ExtensionMessage, IMessageHandler, IStorageService} from "../types";

// /**
//  * Handles the "new_meeting_started" message type.
//  * Saves the current active tab ID to local Chrome storage under `meetingTabId`.
//  */
// export class MeetingStartedHandler implements IMessageHandler {
//   constructor(private storageService: IStorageService) {}

//   canHandle(message: ExtensionMessage): boolean {
//     return message.type === "meetingStarted";
//   }

//   async handle(_: ExtensionMessage): Promise<void> {
//     try {
//       const tabs = await chrome.tabs.query({active: true, currentWindow: true});
//       const tabId = tabs[0]?.id;

//       if (tabId !== undefined) {
//         await this.storageService.set("meetingTabId", tabId);
//         console.log("Meeting tab id saved");
//       }
//     } catch (error) {
//       console.error("Error saving meeting tab ID:", error);
//     }
//   }
// }
