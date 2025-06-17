import {AppConfiguration, ServiceIntegration, User} from "./types";

const CONFIGURATION_KEY: string = "configuration";

export class ConfigurationManager {
  /**
   * Retrieves the entire configuration object from storage.
   */
  async getConfig(): Promise<AppConfiguration | null> {
    try {
      return await new Promise<AppConfiguration | null>((resolve, reject) => {
        chrome.storage.local.get(CONFIGURATION_KEY, result => {
          const config = result[CONFIGURATION_KEY];
          if (config) {
            console.log("Configuration retrieved:", JSON.parse(config) as AppConfiguration);
            resolve(JSON.parse(config) as AppConfiguration);
          } else {
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error("Error retrieving configuration:", error);
      return null;
    }
  }
}
