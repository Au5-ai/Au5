import {MessageDispatcher} from "./backgroundHandlers/message.dispatcher";
import {MeetingEndedHandler} from "./backgroundHandlers/meeting.ended.handler";
import {MeetingStartedHandler} from "./backgroundHandlers/meeting.started.handler";
import {StorageService} from "./core/browser/storage.service";

// /**
//  * List of all available message handlers using the strategy pattern.
//  */
// const storageService = new StorageService();

// const dispatcher = new MessageDispatcher([
//   new MeetingStartedHandler(storageService),
//   new MeetingEndedHandler(storageService)
// ]);

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   //return dispatcher.dispatch(message, sendResponse);
//   console.log("Received message:", message, sender);
//   sendResponse({success: true});
// });
