import { API_URLS } from "@/shared/network/api/urls";
import { apiRequestClient } from "@/shared/network/apiRequestClient";
import { UserListItem } from "@/shared/types";

export const userController = {
  fetchUsers: (): Promise<UserListItem[]> =>
    apiRequestClient<UserListItem[]>(API_URLS.USERS.LIST, { method: "GET" }),

  inviteUsers: (
    invites: { email: string; role: number }[],
  ): Promise<{ success: string[]; failed: string[] }> =>
    apiRequestClient<{ success: string[]; failed: string[] }>(
      API_URLS.USERS.INVITATIONS,
      {
        method: "POST",
        body: JSON.stringify(invites),
        headers: { "Content-Type": "application/json" },
      },
    ),

  retryInvite: (userId: string): Promise<{ link: string }> =>
    apiRequestClient<{ link: string }>(
      API_URLS.USERS.USER_INVITATIONS(userId),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
    ),
};
