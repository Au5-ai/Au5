export const API_URLS = {
  ASSISTANTS: {
    ROOT: "/assistants",
  },
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
    LIST: "/users",
    ME: "/users/me",
    INVITE: "/users/invite",
    RETRY_INVITE: (userId: string) => `/users/${userId}/invite`,
    STATUS: (userId: string) => `/users/${userId}/status`,
    VERIFY: (userId: string, hash: string) =>
      `/users/${userId}/verify?hash=${hash}`,
  },
} as const;
