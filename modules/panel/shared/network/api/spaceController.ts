import {
  CreateSpaceCommand,
  CreateSpaceResponse,
  Space,
} from "@/shared/types/space";
import { apiRequestClient } from "../apiRequestClient";
import { API_URLS } from "./urls";

export const spaceController = {
  getSpaces: (isActive?: boolean): Promise<Space[]> => {
    let url = API_URLS.SPACES.ROOT;
    if (isActive !== undefined && isActive !== null) {
      url += `?isActive=${isActive}`;
    }
    return apiRequestClient<Space[]>(url, {
      method: "GET",
    });
  },
  createSpace: (data: CreateSpaceCommand): Promise<CreateSpaceResponse> =>
    apiRequestClient<CreateSpaceResponse>(API_URLS.SPACES.ROOT, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    }),
};
