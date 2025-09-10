import { User } from "@/type";
import { apiRequest } from "./client";

export const userApi = {
  me: (): Promise<User> =>
    apiRequest<User>("/user/me", {
      method: "GET",
    }),
};
