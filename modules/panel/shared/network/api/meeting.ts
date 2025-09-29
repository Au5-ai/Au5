import { Meeting, MeetingData } from "@/shared/types";
import { apiRequestClient } from "../apiRequestClient";
import { API_URLS } from "./urls";

export const meetingApi = {
  my: (): Promise<MeetingData> => {
    return apiRequestClient<MeetingData>(API_URLS.MEETING.MY("ended"), {
      method: "GET",
    });
  },
  archived: (): Promise<MeetingData> => {
    return apiRequestClient<MeetingData>(API_URLS.MEETING.MY("archived"), {
      method: "GET",
    });
  },
  getTranscription: (meetingId: string, meetId: string): Promise<Meeting> => {
    return apiRequestClient<Meeting>(
      API_URLS.MEETING.TRANSCRIPTION(meetingId, meetId),
      {
        method: "GET",
      },
    );
  },
};
