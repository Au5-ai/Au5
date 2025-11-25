import { apiRequestClient } from "@/shared/network/apiRequestClient";
import { AddUserRequest, AddUserResponse } from "../types";
import { API_URLS } from "@/shared/network/api/urls";

export const signupController = {
  createAdmin: (data: AddUserRequest): Promise<AddUserResponse> =>
    apiRequestClient<AddUserResponse>(API_URLS.SINGUP.ADD_ADMIN, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
