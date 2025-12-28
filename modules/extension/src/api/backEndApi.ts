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
    return apiRequest<any, RequestAddBotModel>(ApiRoutes.getInstance(this.config).addBot(), {
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
    return apiRequest<any>(ApiRoutes.getInstance(this.config).closeMeeting(body.meetingId), {
      method: "POST",
      authToken: token || ""
    });
  }

  public async getUserMe(): Promise<any> {
    const token = await this.tokenManager.getToken();
    return apiRequest<any>(ApiRoutes.getInstance(this.config).getUserMe(), {
      method: "GET",
      authToken: token || ""
    });
  }
}
