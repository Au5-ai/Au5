import {
  CreateSpaceCommand,
  CreateSpaceResponse,
  MySpacesResponse,
  Space,
} from "@/shared/types/space";
import { apiRequestClient } from "../apiRequestClient";
import { API_URLS } from "./urls";

export const spaceController = {
  getSpaces: (): Promise<Space[]> => {
    return apiRequestClient<Space[]>(API_URLS.SPACES.ROOT, {
      method: "GET",
    });
  },
  createSpace: (data: CreateSpaceCommand): Promise<CreateSpaceResponse> =>
    apiRequestClient<CreateSpaceResponse>(API_URLS.SPACES.ROOT, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    }),
  mySpaces: (): Promise<MySpacesResponse[]> => {
    return apiRequestClient<MySpacesResponse[]>(API_URLS.SPACES.MY_SPACES, {
      method: "GET",
    });
  },
};
