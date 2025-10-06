import { Meeting, MeetingData } from "@/shared/types";
import { apiRequestClient } from "../apiRequestClient";
import { API_URLS } from "./urls";

export const meetingsController = {
  my: (): Promise<MeetingData> => {
    return apiRequestClient<MeetingData>(API_URLS.MEETING.MY, {
      method: "GET",
    });
  },
  archived: (): Promise<MeetingData> => {
    return apiRequestClient<MeetingData>(API_URLS.MEETING.ARCHIVED, {
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
  toggleFavorite: (
    meetingId: string,
    meetId: string,
  ): Promise<{ isFavorite: boolean }> => {
    return apiRequestClient<{ isFavorite: boolean }>(
      API_URLS.MEETING.TOGGLE_FAVORITE(meetingId, meetId),
      {
        method: "POST",
      },
    );
  },
};
