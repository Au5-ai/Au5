import { LoginRequest, LoginResponse } from "@/type";
import { apiRequest } from "../apiRequestClient";

export const authApi = {
  login: (credentials: LoginRequest): Promise<LoginResponse> =>
    apiRequest<LoginResponse>("/authentication/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  logout: (): Promise<void> =>
    apiRequest<void>("/authentication/logout", {
      method: "POST",
    }),
};
