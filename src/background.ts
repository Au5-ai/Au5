import {MessageDispatcher} from "./handlers/messageDispatcher";
import {MeetingEndedHandler, MeetingStartedHandler} from "./handlers/meetingEndedHandler";
import {ChromeStorageService} from "./services/storageService";
import {WebhookService} from "./services/webhookService";

/**
 * List of all available message handlers using the strategy pattern.
 */
const storageService = new ChromeStorageService();
const webhookService = new WebhookService(storageService);
const dispatcher = new MessageDispatcher([
  new MeetingStartedHandler(storageService),
  new MeetingEndedHandler(webhookService, storageService)
]);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  return dispatcher.dispatch(message, sendResponse);
});
