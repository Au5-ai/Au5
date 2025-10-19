import { AIContent, Meeting, MeetingData } from "@/shared/types";
import { apiRequestClient } from "../apiRequestClient";
import { API_URLS } from "./urls";

export const meetingsController = {
  my: (): Promise<MeetingData> => {
    return apiRequestClient<MeetingData>(API_URLS.MEETING.MY, {
      method: "GET",
    });
  },
  getAIContents: (meetingId: string, meetId: string): Promise<AIContent[]> => {
    return apiRequestClient<AIContent[]>(
      API_URLS.MEETING.AI_CONTENTS(meetingId, meetId),
      {
        method: "GET",
      },
    );
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
  toggleArchive: (
    meetingId: string,
    meetId: string,
  ): Promise<{ isArchived: boolean }> => {
    return apiRequestClient<{ isArchived: boolean }>(
      API_URLS.MEETING.TOGGLE_ARCHIVE(meetingId, meetId),
      {
        method: "POST",
      },
    );
  },
  addMeetingToSpace: (
    meetingId: string,
    meetId: string,
    spaceId: string,
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequestClient<{ success: boolean; message: string }>(
      API_URLS.MEETING.ADD_TO_SPACE(meetingId, meetId),
      {
        method: "POST",
        body: JSON.stringify({ meetingId, spaceId }),
        headers: { "Content-Type": "application/json" },
      },
    );
  },
  removeMeetingFromSpace: (
    meetingId: string,
    meetId: string,
    spaceId: string,
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequestClient<{ success: boolean; message: string }>(
      API_URLS.MEETING.REMOVE_FROM_SPACE(meetingId, meetId, spaceId),
      {
        method: "DELETE",
      },
    );
  },
};
