import {AppConfiguration} from "../core/types";

export class ApiRoutes {
  private static instance: ApiRoutes;

  private constructor(private config: AppConfiguration) {}

  public static getInstance(config: AppConfiguration): ApiRoutes {
    if (!ApiRoutes.instance) {
      ApiRoutes.instance = new ApiRoutes(config);
    }
    return ApiRoutes.instance;
  }

  public addBot(): string {
    return `${this.config.service.baseUrl}/meetings/bots`;
  }

  public getReactions(): string {
    return `${this.config.service.baseUrl}/reactions`;
  }

  public closeMeeting(meetingId: string): string {
    return `${this.config.service.baseUrl}/meetings/${meetingId}/close`;
  }
}
