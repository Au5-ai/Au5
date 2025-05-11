import {MessageDispatcher} from "./handlers/message.dispatcher";
import {MeetingEndedHandler} from "./handlers/meeting.ended.handler";
import {ChromeStorageService} from "./services/storage.service";
import {MeetingStartedHandler} from "./handlers/meeting.started.handler";
import {WebhookService} from "./services/API";
import {ChromeBrowserService} from "./services/browser.service";

/**
 * List of all available message handlers using the strategy pattern.
 */
const broserService = new ChromeBrowserService();
const storageService = new ChromeStorageService();
const webhookService = new WebhookService(storageService, broserService);
const dispatcher = new MessageDispatcher([
  new MeetingStartedHandler(storageService),
  new MeetingEndedHandler(webhookService, storageService)
]);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  //return dispatcher.dispatch(message, sendResponse);
  console.log("Received message:", message, sender);
  sendResponse({success: true});
});
