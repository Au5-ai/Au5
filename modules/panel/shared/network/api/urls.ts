export const API_URLS = {
  ASSISTANTS: {
    ROOT: "/assistants",
  },
  AUTH: {
    LOGIN: "/authentication/login",
    LOGOUT: "/authentication/logout",
  },
  MEETING: {
    MY: `/meetings/my?status=ended`,
    ARCHIVED: `/meetings/my?status=archived`,
    TRANSCRIPTION: (meetingId: string, meetId: string) =>
      `/meetings/${meetingId}/sessions/${meetId}/transcription`,
    TOGGLE_FAVORITE: (meetingId: string, meetId: string) =>
      `/meetings/${meetingId}/sessions/${meetId}/toggle-favorite`,
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
    MY_MENU: "/users/me/menus",
    INVITATIONS: "/users/invitations", // bulk invite
    USER_INVITATIONS: (userId: string) => `/users/${userId}/invitations`, // resend invite
    VERIFY: (userId: string, hash: string) =>
      `/users/${userId}/verify?hash=${hash}`,
  },
} as const;
