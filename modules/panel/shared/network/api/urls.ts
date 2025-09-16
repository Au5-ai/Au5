export const API_URLS = {
  AUTH: {
    LOGIN: "/authentication/login",
    LOGOUT: "/authentication/logout",
  },
  MEETING: {
    MY: "/meeting/my",
    ARCHIVED: "/meeting/archived",
    TRANSCRIPTION: (meetingId: string, meetId: string) =>
      `/meeting/${meetingId}/${meetId}/transcription`,
  },
  SETUP: {
    HELLO_ADMIN: "/setUp/hello-admin",
  },
  SYSTEM: {
    CONFIG: "/system/config",
    EXTENSION_CONFIG: "/system/extension-config",
  },
  USERS: {
    ME: "/users/me",
    INVITE: "/users/invite",
    USER: (userId: string) => `/users/${userId}`,
    STATUS: (userId: string) => `/users/${userId}/status`,
  },
} as const;
