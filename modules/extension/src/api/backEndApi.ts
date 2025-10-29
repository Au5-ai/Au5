import {ApiRoutes} from "./apiRoutes";
import {AppConfiguration, Reaction} from "../core/types";
import {apiRequest} from "../core/network/apiRequest";
import {CloseMeetingModel, RequestAddBotModel} from "./types";
import {TokenManager} from "../core/tokenManager";

export class BackEndApi {
  private tokenManager: TokenManager;

  constructor(private config: AppConfiguration) {
    this.tokenManager = new TokenManager();
  }

  public async addBot(body: RequestAddBotModel): Promise<any> {
    const token = await this.tokenManager.getToken();
    return apiRequest<any, RequestAddBotModel>(ApiRoutes.getInstance(this.config).addBot(body.meetingId, body.meetId), {
      method: "POST",
      body,
      authToken: token || ""
    });
  }

  public async getReactions(): Promise<Reaction[]> {
    const token = await this.tokenManager.getToken();
    return apiRequest<Reaction[]>(ApiRoutes.getInstance(this.config).getReactions(), {
      method: "GET",
      authToken: token || ""
    });
  }

  public async closeMeeting(body: CloseMeetingModel): Promise<any> {
    const token = await this.tokenManager.getToken();
    return apiRequest<any>(ApiRoutes.getInstance(this.config).closeMeeting(body.meetingId, body.meetId), {
      method: "POST",
      authToken: token || ""
    });
  }
}
