import { apiRequestClient } from "../apiRequestClient";
import { API_URLS } from "./urls";
import { Assistant } from "@/shared/types/assistants";

export const assistantsController = {
  getActive: (): Promise<Assistant[]> =>
    apiRequestClient<Assistant[]>(API_URLS.ASSISTANTS.ROOT, {
      method: "GET",
    }),
  create: (data: { name: string; description: string }): Promise<Assistant> =>
    apiRequestClient<Assistant>(API_URLS.ASSISTANTS.ROOT, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    }),
};
