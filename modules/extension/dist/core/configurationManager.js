const CONFIGURATION_KEY = "configuration";
export class ConfigurationManager {
    chrome;
    constructor(chrome) {
        this.chrome = chrome;
    }
    /**
     * Retrieves the entire configuration object from storage.
     */
    async getConfig() {
        try {
            return {
                user: {
                    token: "23f45e89-8b5a-5c55-9df7-240d78a3ce15",
                    id: "23f45e89-8b5a-5c55-9df7-240d78a3ce15",
                    fullName: "Mohammad Karimi",
                    pictureUrl: "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo"
                },
                service: {
                    webhookUrl: "https://au5.ai/api/v1/",
                    direction: "rtl",
                    hubUrl: "http://localhost:1366/meetinghub",
                    companyName: "Asax Co"
                }
            };
            const config = (await this.chrome.get(CONFIGURATION_KEY));
            return config ?? null;
        }
        catch (error) {
            console.error("Failed to load configuration:", error);
            throw new Error("Configuration not found.");
        }
    }
    /**
     * Updates the entire configuration object in storage.
     */
    async setConfig(config) {
        try {
            await this.chrome.set({ [CONFIGURATION_KEY]: config }, "local");
        }
        catch (error) {
            console.error("Failed to save configuration:", error);
        }
    }
    /**
     * Gets a single config field like webhookUrl or token.
     */
    async getValue(key) {
        const config = await this.getConfig();
        return config ? config[key] : null;
    }
    /**
     * Updates only one key of the configuration.
     */
    async setValue(key, value) {
        const config = (await this.getConfig()) || {};
        config[key] = value;
        await this.setConfig(config);
    }
    /**
     * Removes the entire configuration.
     */
    async clearConfig() {
        try {
            await this.chrome.remove(CONFIGURATION_KEY);
        }
        catch (error) {
            console.error("Failed to clear configuration:", error);
        }
    }
}
