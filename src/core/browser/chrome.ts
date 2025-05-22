import {IBrowser} from "../types";

export class ChromeStorageBackend implements IBrowser {
  get(keys: string[] | string, area: "local" | "sync" = "local"): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.storage[area].get(keys, result => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve(result);
      });
    });
  }

  set(items: Record<string, any>, area: "local" | "sync" = "local"): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage[area].set(items, () => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve();
      });
    });
  }

  remove(keys: string[] | string, area: "local" | "sync" = "local"): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage[area].remove(keys, () => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve();
      });
    });
  }
}
