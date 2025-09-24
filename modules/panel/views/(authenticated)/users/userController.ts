import { API_URLS } from "@/shared/network/api/urls";
import { apiRequestClient } from "@/shared/network/apiRequestClient";
import { UserList } from "@/shared/types";

export const userController = {
  fetchUsers: (): Promise<UserList[]> =>
    apiRequestClient<UserList[]>(API_URLS.USERS.LIST, { method: "GET" }),

  inviteUsers: (
    invites: { email: string; role: number }[],
  ): Promise<{ success: string[]; failed: string[] }> =>
    apiRequestClient<{ success: string[]; failed: string[] }>(
      API_URLS.USERS.INVITE,
      {
        method: "POST",
        body: JSON.stringify(invites),
        headers: { "Content-Type": "application/json" },
      },
    ),

  retryInvite: (userId: string): Promise<{ link: string }> =>
    apiRequestClient<{ link: string }>(API_URLS.USERS.RETRY_INVITE(userId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }),
};
