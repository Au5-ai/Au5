import {
  CreateSpaceCommand,
  CreateSpaceResponse,
  MySpacesResponse,
  Space,
  SpaceMembersResponse,
} from "@/shared/types/space";
import { apiRequestClient } from "../apiRequestClient";
import { API_URLS } from "./urls";
import { MeetingData } from "@/shared/types";

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
  meetings: (spaceId: string) => (): Promise<MeetingData> => {
    return apiRequestClient<MeetingData>(API_URLS.SPACES.MEETINGS(spaceId), {
      method: "GET",
    });
  },
  members:
    (spaceId: string) =>
    (): Promise<SpaceMembersResponse> => {
      return apiRequestClient(API_URLS.SPACES.MEMBERS(spaceId), {
        method: "GET",
      });
    },
};
