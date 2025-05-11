import {IStorageService} from "../types";

const CONFIGURATION_KEY: string = "configuration";

/**
 * Represents the synced structure stored in Chrome's local storage.
 */
interface ServiceConfiguration {
  /** Webhook endpoint URL */
  webhookUrl: string;
  /** Authentication token for the webhook */
  token: string;
  userId: string;
  fullName: string;
}

interface ExtensionConfiguration {
  meetingEndIcon: {
    selector: string;
    text: string;
  };
  captionsIcon: {
    selector: string;
    text: string;
  };
  transcriptSelectors: {
    aria: string;
    fallback: string;
  };
  transcriptStyles: {
    opacity: string;
  };
  maxTranscriptLength: number;
  transcriptTrimThreshold: number;
}

export interface AppConfiguration {
  Service: ServiceConfiguration;
  Extension: ExtensionConfiguration;
}

export class ConfigurationService {
  constructor(private storageService: IStorageService) {}

  /**
   * Retrieves the entire configuration object from storage.
   */
  async getConfig(): Promise<AppConfiguration> {
    try {
      return AppConfig as AppConfiguration;
      const config = await this.storageService.get<AppConfiguration>(CONFIGURATION_KEY);
      return config ?? null;
    } catch (error) {
      console.error("Failed to load configuration:", error);
      throw new Error("Configuration not found.");
    }
  }

  /**
   * Updates the entire configuration object in storage.
   */
  async setConfig(config: AppConfiguration): Promise<void> {
    try {
      await this.storageService.set<AppConfiguration>(CONFIGURATION_KEY, config);
    } catch (error) {
      console.error("Failed to save configuration:", error);
    }
  }

  /**
   * Gets a single config field like webhookUrl or token.
   */
  async getValue<K extends keyof AppConfiguration>(key: K): Promise<AppConfiguration[K] | null> {
    const config = await this.getConfig();
    return config ? config[key] : null;
  }

  /**
   * Updates only one key of the configuration.
   */
  async setValue<K extends keyof AppConfiguration>(key: K, value: AppConfiguration[K]): Promise<void> {
    const config = (await this.getConfig()) || ({} as AppConfiguration);
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
const ExtensionConfig: ExtensionConfiguration = {
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
  transcriptTrimThreshold: 125,
  canUseAriaBasedTranscriptSelector: true
};

const AppConfig: AppConfiguration = {
  Service: {
    webhookUrl: "https://au5.ai/api/v1/",
    token: "",
    userId: "23f45e89-8b5a-5c55-9df7-240d78a3ce15",
    fullName: "Mohammad Karimi"
  } as ServiceConfiguration,
  Extension: ExtensionConfig as ExtensionConfiguration
};
