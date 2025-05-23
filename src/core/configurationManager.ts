import {IBrowserStorage} from "./types/browser";
import {AppConfiguration, ExtensionConfiguration, ServiceConfiguration, UserConfiguration} from "./types/configuration";

const CONFIGURATION_KEY: string = "configuration";

export class ConfigurationManager {
  constructor(private browserStorage: IBrowserStorage) {
    // TODO: Remove this in production
    this.setConfig({
      user: {
        token: "",
        userId: "23f45e89-8b5a-5c55-9df7-240d78a3ce15",
        fullName: "Mohammad Karimi",
        pictureUrl: "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo"
      } as UserConfiguration,

      service: {
        webhookUrl: "https://au5.ai/api/v1/",
        direction: "rtl",
        hubUrl: "https://localhost:7061/meetinghub"
      } as ServiceConfiguration,

      extension: {
        meetingEndIcon: {
          selector: ".google-symbols",
          text: "call_end"
        },
        captionsIcon: {
          selector: ".google-symbols",
          text: "closed_caption_off"
        },
        transcriptSelectors: {
          aria: 'div[role="region"][tabindex="0"]',
          fallback: ".a4cQT"
        },
        transcriptStyles: {
          opacity: "0.2"
        },
        maxTranscriptLength: 250,
        transcriptTrimThreshold: 125,
        btnTranscriptSelector: "au5-startTranscription-btn"
      } as ExtensionConfiguration
    } as AppConfiguration);
  }

  /**
   * Retrieves the entire configuration object from storage.
   */
  async getConfig(): Promise<AppConfiguration> {
    try {
      const config = (await this.browserStorage.get(CONFIGURATION_KEY)) as Promise<AppConfiguration>;
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
      await this.browserStorage.set({[CONFIGURATION_KEY]: config}, "local");
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
      await this.browserStorage.remove(CONFIGURATION_KEY);
    } catch (error) {
      console.error("Failed to clear configuration:", error);
    }
  }
}
