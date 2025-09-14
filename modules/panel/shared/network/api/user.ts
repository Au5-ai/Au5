import { User, UserList } from "@/shared/types";
import { apiRequestClient } from "../apiRequestClient";

const API_BASE = "/users";

export const userApi = {
  me: (): Promise<User> =>
    apiRequestClient<User>(`${API_BASE}/me`, { method: "GET" }),

  fetchUsers: (): Promise<UserList[]> =>
    apiRequestClient<UserList[]>(API_BASE, { method: "GET" }),

  inviteUsers: (
    invites: { email: string; role: number }[],
  ): Promise<{ success: string[]; failed: string[] }> =>
    apiRequestClient<{ success: string[]; failed: string[] }>(
      `${API_BASE}/invite`,
      {
        method: "POST",
        body: JSON.stringify(invites),
        headers: { "Content-Type": "application/json" },
      },
    ),

  editUser: (userId: string, data: Partial<User>): Promise<User> =>
    apiRequestClient<User>(`${API_BASE}/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    }),

  toggleUserStatus: (userId: string, isActive: boolean): Promise<User> =>
    apiRequestClient<User>(`${API_BASE}/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
      headers: { "Content-Type": "application/json" },
    }),
};
