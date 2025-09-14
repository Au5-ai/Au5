import {
  AddUserRequest,
  AddUserResponse,
  HelloAdminResponse,
} from "@/shared/types";
import { apiRequestClient } from "../apiRequestClient";

export const setUpApi = {
  helloAdmin: (): Promise<HelloAdminResponse> =>
    apiRequestClient<HelloAdminResponse>("/setUp/hello-admin", {
      method: "GET",
    }),
  addAdmin: (data: AddUserRequest): Promise<AddUserResponse> =>
    apiRequestClient<AddUserResponse>("/setUp/hello-admin", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
