import { API_URLS } from "@/shared/network/api/urls";
import { apiRequestClient } from "@/shared/network/apiRequestClient";
import { UserListItem } from "@/shared/types";

export interface InvitationResult {
  email: string;
  storedInDatabase: boolean;
  emailSent: boolean;
  alreadyExists: boolean;
  errorMessage?: string;
}

export interface InviteUsersResponse {
  results: InvitationResult[];
}

export const userController = {
  fetchUsers: (): Promise<UserListItem[]> =>
    apiRequestClient<UserListItem[]>(API_URLS.USERS.LIST, { method: "GET" }),

  inviteUsers: (
    invites: { email: string; role: number }[],
  ): Promise<InviteUsersResponse> =>
    apiRequestClient<InviteUsersResponse>(
      API_URLS.USERS.INVITATIONS,
      {
        method: "POST",
        body: JSON.stringify(invites),
        headers: { "Content-Type": "application/json" },
      },
    ),

  retryInvite: (userId: string): Promise<{ link: string }> =>
    apiRequestClient<{ link: string }>(
      API_URLS.USERS.RESEND_INVITATION(userId),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
    ),
};

