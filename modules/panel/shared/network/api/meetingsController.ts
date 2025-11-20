import { AIContent, Meeting, MeetingData } from "@/shared/types";
import {
  apiRequestClient,
  apiRequestClientStream,
  apiRequestClientText,
} from "../apiRequestClient";
import { API_URLS } from "./urls";

export const meetingsController = {
  my: (): Promise<MeetingData> => {
    return apiRequestClient<MeetingData>(API_URLS.USERS.MY_MEETINGS(), {
      method: "GET",
    });
  },
  getAIContents: (meetingId: string): Promise<AIContent[]> => {
    return apiRequestClient<AIContent[]>(
      API_URLS.MEETING.AI_CONTENTS(meetingId),
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
  getTranscription: (meetingId: string): Promise<Meeting> => {
    return apiRequestClient<Meeting>(
      API_URLS.MEETING.TRANSCRIPTION(meetingId),
      {
        method: "GET",
      },
    );
  },
  toggleFavorite: (meetingId: string): Promise<{ isFavorite: boolean }> => {
    return apiRequestClient<{ isFavorite: boolean }>(
      API_URLS.MEETING.TOGGLE_FAVORITE(meetingId),
      {
        method: "POST",
      },
    );
  },
  toggleArchive: (
    meetingId: string,
    archive: boolean = true,
  ): Promise<{ isArchived: boolean }> => {
    return apiRequestClient<{ isArchived: boolean }>(
      archive
        ? API_URLS.MEETING.ARCHIVE(meetingId)
        : API_URLS.MEETING.UNARCHIVE(meetingId),
      {
        method: "POST",
      },
    );
  },
  rename: (
    meetingId: string,
    newName: string,
  ): Promise<{ isSuccess: boolean; message: string }> => {
    return apiRequestClient<{ isSuccess: boolean; message: string }>(
      API_URLS.MEETING.RENAME(meetingId),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newTitle: newName }),
      },
    );
  },
  addMeetingToSpace: (
    meetingId: string,
    spaceId: string,
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequestClient<{ success: boolean; message: string }>(
      API_URLS.SPACES.ADD_MEETING(spaceId, meetingId),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
    );
  },
  removeMeetingFromSpace: (
    meetingId: string,
    spaceId: string,
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequestClient<{ success: boolean; message: string }>(
      API_URLS.SPACES.REMOVE_MEETING(spaceId, meetingId),
      {
        method: "DELETE",
      },
    );
  },
  exportToText: (meetingId: string): Promise<string> => {
    return apiRequestClientText(API_URLS.MEETING.EXPORT(meetingId, "text"), {
      method: "GET",
    });
  },
  generate: (data: {
    meetingId: string;
    assistantId: string;
    signal?: AbortSignal;
    onDelta?: (text: string) => void;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }) => {
    const { signal, onDelta, onStart, onEnd, onError, ...bodyData } = data;
    (async (meetingId: string) => {
      try {
        onStart?.();
        const response = await apiRequestClientStream(
          API_URLS.MEETING.GENERATE_AI(meetingId),
          {
            method: "POST",
            body: JSON.stringify(bodyData),
            signal,
          },
        );
        if (!response.ok || !response.body) {
          throw new Error("Failed to connect to stream");
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer = decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          for (const line of lines) {
            const clean = line.trim();
            if (!clean) continue;
            try {
              const json = JSON.parse(clean);
              if (json.error) {
                onError?.(new Error(json.error));
              }
              if (json.content) {
                onDelta?.(json.content);
              } else if (json.event === "thread.message.delta") {
                await new Promise((res) => setTimeout(res, 60));
                onDelta?.(json.data.delta.content[0].text.value);
              } else if (json.event === "thread.message.completed") {
                onEnd?.();
              } else if (json.event === "thread.run.completed") {
                onDelta?.("");
              }
            } catch {
              // ignore parse errors for incomplete chunks
            }
          }
        }
      } catch (err) {
        onError?.(err);
      }
    })(data.meetingId);
  },
  delete: (
    meetingId: string,
    contentId: string,
  ): Promise<{ isSuccess: boolean }> => {
    return apiRequestClient<{ isSuccess: boolean }>(
      API_URLS.MEETING.DELETE_AI_CONTENT(meetingId, contentId),
      {
        method: "DELETE",
      },
    );
  },
};
