import { User, UserList } from "@/type";
import { apiRequest } from "./client";

const API_BASE = "/users";

export const userApi = {
  me: (): Promise<User> =>
    apiRequest<User>(`${API_BASE}/me`, { method: "GET" }),

  fetchUsers: (): Promise<UserList[]> =>
    apiRequest<UserList[]>(API_BASE, { method: "GET" }),

  fetchUserStats: (): Promise<{
    total: number;
    active: number;
    admins: number;
    inactive: number;
  }> =>
    apiRequest<{
      total: number;
      active: number;
      admins: number;
      inactive: number;
    }>(`${API_BASE}/stats`, { method: "GET" }),

  inviteUsers: (
    invites: { email: string; role: string }[]
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

  toggleUserStatus: (userId: string, isValid: boolean): Promise<User> =>
    apiRequest<User>(`${API_BASE}/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isValid }),
      headers: { "Content-Type": "application/json" },
    }),

  searchUsers: (
    query: string,
    filters: Record<string, unknown>
  ): Promise<UserList[]> => {
    const params = new URLSearchParams({
      query,
      ...(filters as Record<string, string>),
    });
    return apiRequest<UserList[]>(`${API_BASE}/search?${params}`, {
      method: "GET",
    });
  },
};
