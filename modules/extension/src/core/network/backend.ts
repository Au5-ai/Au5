import {AppConfiguration, Reaction, RequestAddBotModel} from "../types";
import {apiRequest} from "./apiRequest";

export class BackEndApi {
  constructor(private config: AppConfiguration) {}

  /**
   * Sends a request to the backend to join a bot in a meeting.
   * @returns A promise that resolves with the response from the backend.
   */
  public async addBot(body: RequestAddBotModel): Promise<any> {
    const url = this.config.service.baseUrl + "/meeting/addBot";

    return apiRequest<any, RequestAddBotModel>(url, {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  public async getReactions(): Promise<Array<Reaction>> {
    const url = this.config.service.baseUrl + "/reactions";
    return apiRequest<Array<Reaction>>(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}
