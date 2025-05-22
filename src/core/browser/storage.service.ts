import {IBrowser} from "../types";

export class StorageService {
  constructor(private browser: IBrowser) {}

  async remove(keys: string | string[]): Promise<void> {
    return this.browser.remove(keys, "local");
  }

  async set<T>(key: string, value: any): Promise<T> {
    await this.browser.set({[key]: value}, "local");
    return value as T;
  }

  async get<T>(keys: string | string[]): Promise<T> {
    return this.browser.get(keys, "local") as Promise<T>;
  }

  async getSync<T>(key: string): Promise<T> {
    return this.browser.get([key], "sync") as Promise<T>;
  }
}
