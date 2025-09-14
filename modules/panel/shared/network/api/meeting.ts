import { MeetingData } from "@/shared/types";
import { apiRequestClient } from "../apiRequestClient";
import { Meeting } from "@/app/(authenticated)/meeting/my/columns";

export const meetingApi = {
  my: (): Promise<MeetingData> => {
    return apiRequestClient<MeetingData>("/meeting/my", {
      method: "GET",
    });
  },
  archived: (): Promise<MeetingData> => {
    return apiRequestClient<MeetingData>("/meeting/archived", {
      method: "GET",
    });
  },
  getTranscription: (meetingId: string, meetId: string): Promise<Meeting> => {
    return apiRequestClient<Meeting>(
      `/meeting/${meetingId}/${meetId}/transcription`,
      {
        method: "GET",
      },
    );
  },
};
