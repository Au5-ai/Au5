import { Meeting, MeetingData } from "@/type";
import { apiRequest } from "./client";

export const meetingApi = {
  my: (): Promise<MeetingData> => {
    return apiRequest<MeetingData>("/meeting/my", {
      method: "GET",
    });
  },
  archived: (): Promise<MeetingData> => {
    return apiRequest<MeetingData>("/meeting/archived", {
      method: "GET",
    });
  },
  getTranscription: (meetingId: string, meetId: string): Promise<Meeting> => {
    return apiRequest<Meeting>(
      `/meeting/${meetingId}/${meetId}/transcription`,
      {
        method: "GET",
      }
    );
  },
};
