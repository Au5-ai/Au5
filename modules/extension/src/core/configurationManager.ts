import {AppConfiguration} from "./types";

const CONFIGURATION_KEY: string = "configuration";

export class ConfigurationManager {
  /**
   * Retrieves the entire configuration object from storage.
   */
  async getConfig(): Promise<AppConfiguration | null> {
    try {
      const localConfig = localStorage.getItem(CONFIGURATION_KEY);
      if (localConfig) {
        return JSON.parse(localConfig) as AppConfiguration;
      }
    } catch (error) {
      throw new Error("Configuration not found.");
    }
    return null;
  }
}

// return {
//   user: {
//     token: "23f45e89-8b5a-5c55-9df7-240d78a3ce15",
//     id: "23f45e89-8b5a-5c55-9df7-240d78a3ce15",
//     fullName: "Mohammad Karimi",
//     pictureUrl:
//       "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo"
//   } as User,

//   service: {
//     webhookUrl: "https://au5.ai/api/v1/",
//     direction: "rtl",
//     hubUrl: "http://localhost:1366/meetinghub",
//     companyName: "Asax Co"
//   } as ServiceIntegration
// } as AppConfiguration;

// Try to get from localStorage first
