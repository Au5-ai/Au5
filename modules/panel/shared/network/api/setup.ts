import { AddUserRequest, AddUserResponse, HelloAdminResponse } from "@/type";
import { apiRequest } from "../apiRequestClient";

export const setUpApi = {
  helloAdmin: (): Promise<HelloAdminResponse> =>
    apiRequest<HelloAdminResponse>("/setUp/hello-admin", {
      method: "GET",
    }),
  addAdmin: (data: AddUserRequest): Promise<AddUserResponse> =>
    apiRequest<AddUserResponse>("/setUp/hello-admin", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
