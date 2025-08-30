import {ApiRoutes} from "./apiRoutes";
import {AppConfiguration, Reaction} from "../core/types";
import {apiRequest} from "../core/network/apiRequest";
import {CloseMeetingModel, RequestAddBotModel} from "./types";

export class BackEndApi {
  constructor(private config: AppConfiguration) {}

  public async addBot(body: RequestAddBotModel): Promise<any> {
    return apiRequest<any, RequestAddBotModel>(ApiRoutes.getInstance(this.config).addBot(), {
      method: "POST",
      body,
      authToken: this.config.service.jwtToken
    });
  }

  public async getReactions(): Promise<Reaction[]> {
    return apiRequest<Reaction[]>(ApiRoutes.getInstance(this.config).getReactions(), {
      method: "GET",
      authToken: this.config.service.jwtToken
    });
  }

  public async closeMeeting(body: CloseMeetingModel): Promise<any> {
    return apiRequest<any>(ApiRoutes.getInstance(this.config).closeMeeting(body.meetingId, body.meetId), {
      method: "POST",
      authToken: this.config.service.jwtToken
    });
  }
}
