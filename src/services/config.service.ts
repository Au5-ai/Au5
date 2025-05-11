import {IStorageService} from "../types";

const CONFIGURATION_KEY: string = "configuration";

/**
 * Represents the synced structure stored in Chrome's local storage.
 */
export interface Configuration {
  /** Webhook endpoint URL */
  webhookUrl: string;
  /** Authentication token for the webhook */
  token: string;
  userId: string;
  fullName: string;
}

export interface ExtensionConfiguration {
  meetingEndIcon: {
    selector: string;
    text: string;
  };
  captionsIcon: {
    selector: string;
    text: string;
  };
  transcriptSelectors: {
    ariaBased: string;
    fallback: string;
  };
  transcriptStyles: {
    opacity: string;
  };
  maxTranscriptLength: number;
  transcriptTrimThreshold: number;
}

export class ConfigurationService {
  constructor(private storageService: IStorageService) {}

  /**
   * Retrieves the entire configuration object from storage.
   */
  async getConfig(): Promise<Configuration | null> {
    try {
      const config = await this.storageService.get<Configuration>(CONFIGURATION_KEY);
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
      await this.storageService.set<Configuration>(CONFIGURATION_KEY, config);
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
      await this.storageService.remove(CONFIGURATION_KEY);
    } catch (error) {
      console.error("Failed to clear configuration:", error);
    }
  }
}

// sample data for testing
// Get these values from API or config.service.ts
export const ExtensionConfig: ExtensionConfiguration = {
  meetingEndIcon: {
    selector: ".google-symbols",
    text: "call_end"
  },
  captionsIcon: {
    selector: ".google-symbols",
    text: "closed_caption_off"
  },
  transcriptSelectors: {
    ariaBased: 'div[role="region"][tabindex="0"]',
    fallback: ".a4cQT"
  },
  transcriptStyles: {
    opacity: "0.2"
  },
  maxTranscriptLength: 250,
  transcriptTrimThreshold: 125
};

export const AppConfig = {
  User: {webhookUrl: "", token: "", userId: "", fullName: ""} as Configuration,
  Extension: ExtensionConfig as ExtensionConfiguration
};
