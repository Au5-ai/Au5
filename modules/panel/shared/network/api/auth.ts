import { LoginRequest, LoginResponse } from "@/shared/types";
import { apiRequestClient } from "../apiRequestClient";

export const authApi = {
  login: (credentials: LoginRequest): Promise<LoginResponse> =>
    apiRequestClient<LoginResponse>("/authentication/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  logout: (): Promise<void> =>
    apiRequestClient<void>("/authentication/logout", {
      method: "POST",
    }),
};
