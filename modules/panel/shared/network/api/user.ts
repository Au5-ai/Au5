import { User } from "@/shared/types";
import { apiRequestClient } from "../apiRequestClient";
import { API_URLS } from "./urls";

export const userApi = {
  me: (): Promise<User> =>
    apiRequestClient<User>(API_URLS.USERS.ME, { method: "GET" }),
};
