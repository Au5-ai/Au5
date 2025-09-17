import { LoginRequest, LoginResponse } from "@/shared/types";
import { apiRequestClient } from "../apiRequestClient";
import { API_URLS } from "./urls";

export const authController = {
  login: (credentials: LoginRequest): Promise<LoginResponse> =>
    apiRequestClient<LoginResponse>(API_URLS.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  logout: (): Promise<void> =>
    apiRequestClient<void>(API_URLS.AUTH.LOGOUT, {
      method: "POST",
    }),
};
