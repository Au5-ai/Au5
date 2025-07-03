const CONFIGURATION_KEY = "configuration";
export class ConfigurationManager {
    /**
     * Retrieves the entire configuration object from storage.
     */
    async getConfig() {
        try {
            return await new Promise((resolve, reject) => {
                chrome.storage.local.get(CONFIGURATION_KEY, result => {
                    const config = result[CONFIGURATION_KEY];
                    if (config) {
                        resolve(JSON.parse(config));
                    }
                    else {
                        resolve(null);
                    }
                });
            });
        }
        catch (error) {
            console.error("Error retrieving configuration:", error);
            return null;
        }
    }
}
