export interface RequestAddBotModel {
  meetId: string;
  botName: string;
  platform: string;
}

export interface CloseMeetingModel {
  meetId: string;
  meetingId: string;
}
