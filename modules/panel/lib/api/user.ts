import { User, UserList } from "@/type";
import { apiRequest } from "./client";

const API_BASE = "/users";

export const userApi = {
  me: (): Promise<User> =>
    apiRequest<User>(`${API_BASE}/me`, { method: "GET" }),

  fetchUsers: (): Promise<UserList[]> =>
    apiRequest<UserList[]>(API_BASE, { method: "GET" }),

  inviteUsers: (
    invites: { email: string; role: number }[]
  ): Promise<{ success: string[]; failed: string[] }> =>
    apiRequest<{ success: string[]; failed: string[] }>(`${API_BASE}/invite`, {
      method: "POST",
      body: JSON.stringify(invites),
      headers: { "Content-Type": "application/json" },
    }),

  editUser: (userId: string, data: Partial<User>): Promise<User> =>
    apiRequest<User>(`${API_BASE}/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    }),

  toggleUserStatus: (userId: string, isActive: boolean): Promise<User> =>
    apiRequest<User>(`${API_BASE}/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
      headers: { "Content-Type": "application/json" },
    }),
};
