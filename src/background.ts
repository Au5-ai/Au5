import {MessageDispatcher} from "./handlers/messageDispatcher";
import {MeetingEndedHandler} from "./handlers/meetingEndedHandler";
import {ChromeStorageService} from "./services/storage.service";
import {WebhookService} from "./services/webhook.service";
import {MeetingStartedHandler} from "./handlers/meetingStartedHandler";
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
  return dispatcher.dispatch(message, sendResponse);
});
