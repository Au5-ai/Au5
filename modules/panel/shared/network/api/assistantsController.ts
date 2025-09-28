import { apiRequestClient } from "../apiRequestClient";
import { API_URLS } from "./urls";
import { Assistant } from "@/shared/types/assistants";

export const assistantsController = {
  getActive: (): Promise<Assistant[]> =>
    apiRequestClient<Assistant[]>(API_URLS.ASSISTANTS.LIST, {
      method: "GET",
    }),
};
