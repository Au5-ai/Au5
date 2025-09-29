import { User, UserMenuItem } from "@/shared/types";
import { apiRequestClient } from "../apiRequestClient";
import { API_URLS } from "./urls";

export const userController = {
  me: (): Promise<User> =>
    apiRequestClient<User>(API_URLS.USERS.ME, { method: "GET" }),
  myMenu: (): Promise<UserMenuItem[]> =>
    apiRequestClient<UserMenuItem[]>(API_URLS.USERS.MY_MENU, { method: "GET" }),
};
