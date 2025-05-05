export interface IStorageService {
  set<T>(key: string, value: T): Promise<void>;
  get<T>(key: string | string[]): Promise<T>;
  remove(keys: string | string[]): Promise<void>;
}

export class ChromeStorageService implements IStorageService {
  async remove(keys: string | string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(keys, () => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve();
      });
    });
  }

  async set<T>(key: string, value: any): Promise<T> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({[key]: value}, () => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve(value as T);
      });
    });
  }

  async get<T>(keys: string | string[]): Promise<T> {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(keyArray, result => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve(result as T);
      });
    });
  }

  async getSync<T>(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get([key], result => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve(result as T);
      });
    });
  }
}
