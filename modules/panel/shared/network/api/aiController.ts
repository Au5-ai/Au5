import { apiRequestClient } from "../apiRequestClient";
import { API_URLS } from "./urls";
import { Assistant } from "@/shared/types/assistants";

export const aiController = {
  generate: (data: {
    meetingId: string;
    meetId: string;
    assistantId: string;
  }): any =>
    apiRequestClient<Assistant>(API_URLS.AI.GENERATE, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    }),
};
