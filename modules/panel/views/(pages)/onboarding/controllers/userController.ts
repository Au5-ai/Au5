import { apiRequestClient } from "@/shared/network/apiRequestClient";
import { API_URLS } from "@/shared/network/api/urls";
import { AddUserRequest, AddUserResponse } from "../types";

export const userController = {
  verify: (
    userId: string,
    hash: string,
  ): Promise<{ email: string; isRegistered: boolean }> =>
    apiRequestClient<{ email: string; isRegistered: boolean }>(
      API_URLS.USERS.VERIFY(userId, hash),
      {
        method: "GET",
      },
    ),
  verifyUser: (signupData: AddUserRequest): Promise<AddUserResponse> =>
    apiRequestClient<AddUserResponse>(
      API_URLS.USERS.VERIFY(signupData.userId, signupData.hashedEmail),
      {
        method: "POST",
        body: JSON.stringify(signupData),
      },
    ),
};
