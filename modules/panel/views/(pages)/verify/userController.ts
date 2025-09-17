import { apiRequestClient } from "@/shared/network/apiRequestClient";
import { API_URLS } from "@/shared/network/api/urls";

export const userController = {
  verify: (userId: string, hash: string): Promise<boolean> =>
    apiRequestClient<boolean>(API_URLS.USERS.VERIFY(userId, hash), {
      method: "GET",
    }),
};
