export const API_URLS = {
  ASSISTANTS: {
    ROOT: "/assistants",
  },
  AUTH: {
    LOGIN: "/authentication/login",
    LOGOUT: "/authentication/logout",
  },
  MEETING: {
    MY: (status: string) => `/meetings/my?status=${status}`,
    TRANSCRIPTION: (meetingId: string, meetId: string) =>
      `/meetings/${meetingId}/sessions/${meetId}/transcription`,
  },
  SETUP: {
    HELLO_ADMIN: "/setUp/hello-admin",
  },
  SYSTEM: {
    CONFIG: "/system/config",
    EXTENSION_CONFIG: "/system/extension-config",
  },
  USERS: {
    LIST: "/users",
    ME: "/users/me",
    MENUS: "/users/me/menus",
    INVITATIONS: "/users/invitations", // bulk invite
    USER_INVITATIONS: (userId: string) => `/users/${userId}/invitations`, // resend invite
    VERIFY: (userId: string, hash: string) =>
      `/users/${userId}/verify?hash=${hash}`,
  },
} as const;
