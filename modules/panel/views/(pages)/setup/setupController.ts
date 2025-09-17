import { apiRequestClient } from "@/shared/network/apiRequestClient";
import { AddUserRequest, AddUserResponse, HelloAdminResponse } from "./types";
import { API_URLS } from "@/shared/network/api/urls";

export const setupController = {
  helloAdmin: (): Promise<HelloAdminResponse> =>
    apiRequestClient<HelloAdminResponse>(API_URLS.SETUP.HELLO_ADMIN, {
      method: "GET",
    }),
  addAdmin: (data: AddUserRequest): Promise<AddUserResponse> =>
    apiRequestClient<AddUserResponse>(API_URLS.SETUP.HELLO_ADMIN, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
