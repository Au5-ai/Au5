import { apiRequest } from "./apiRequest";
export class BackEndApi {
    config;
    constructor(config) {
        this.config = config;
    }
    /**
     * Sends a request to the backend to join a bot in a meeting.
     * @returns A promise that resolves with the response from the backend.
     */
    async addBot(body) {
        const url = this.config.service.baseUrl + "/meeting/addBot";
        return apiRequest(url, {
            method: "POST",
            body,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
}
