import {IBrowserService, ExtensionMessage, ExtensionResponse} from "../types";

export class ChromeBrowserService implements IBrowserService {
  reload(): void {
    chrome.runtime.reload();
  }
  sendMessage(message: ExtensionMessage, responseCallback: (response: ExtensionResponse) => void = () => {}): void {
    chrome.runtime.sendMessage(message, responseCallback);
  }
}
