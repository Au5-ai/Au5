import {STORAGE_KEYS} from "../constants/storage.constants";
import {IStorageService} from "../types";

/**
 * Represents the synced structure stored in Chrome's local storage.
 */
export interface Configuration {
  env: string;

  /** Webhook endpoint URL */
  webhookUrl: string;

  /** Authentication token for the webhook */
  token: string;
}

export class ConfigurationService {
  constructor(private storageService: IStorageService) {}

  /**
   * Retrieves the entire configuration object from storage.
   */
  async getConfig(): Promise<Configuration | null> {
    try {
      const config = await this.storageService.get<Configuration>(STORAGE_KEYS.CONFIG);
      return config ?? null;
    } catch (error) {
      console.error("Failed to load configuration:", error);
      return null;
    }
  }

  /**
   * Updates the entire configuration object in storage.
   */
  async setConfig(config: Configuration): Promise<void> {
    try {
      await this.storageService.set<Configuration>(STORAGE_KEYS.CONFIG, config);
    } catch (error) {
      console.error("Failed to save configuration:", error);
    }
  }

  /**
   * Gets a single config field like webhookUrl or token.
   */
  async getValue<K extends keyof Configuration>(key: K): Promise<Configuration[K] | null> {
    const config = await this.getConfig();
    return config ? config[key] : null;
  }

  /**
   * Updates only one key of the configuration.
   */
  async setValue<K extends keyof Configuration>(key: K, value: Configuration[K]): Promise<void> {
    const config = (await this.getConfig()) || ({} as Configuration);
    config[key] = value;
    await this.setConfig(config);
  }

  /**
   * Removes the entire configuration.
   */
  async clearConfig(): Promise<void> {
    try {
      await this.storageService.remove(STORAGE_KEYS.CONFIG);
    } catch (error) {
      console.error("Failed to clear configuration:", error);
    }
  }
}
