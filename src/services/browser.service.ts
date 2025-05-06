import {IBrowserService} from "../types";

export class ChromeBrowserService implements IBrowserService {
  reload(): void {
    chrome.runtime.reload();
  }
}
