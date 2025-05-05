import {MessageDispatcher} from "./messageDispatcher";
import {MeetingEndedHandler, MeetingStartedHandler} from "./messageHandler";
import {ChromeStorageService} from "./storageService";
import {WebhookService} from "./webhookService";

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
