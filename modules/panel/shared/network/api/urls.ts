export const API_URLS = {
  AI: {
    GENERATE: "/ai/generate",
  },
  SPACES: {
    ROOT: "/spaces",
    MY_SPACES: "/spaces/my-spaces",
    MEETINGS: (spaceId: string) => `/spaces/${spaceId}/meetings`,
  },
  ASSISTANTS: {
    ROOT: "/assistants",
  },
  AUTH: {
    LOGIN: "/authentication/login",
    LOGOUT: "/authentication/logout",
  },
  MEETING: {
    MY: `/meetings/my?status=ended`,
    AI_CONTENTS: (meetingId: string, meetId: string) =>
      `/meetings/${meetingId}/sessions/${meetId}/ai-contents`,
    ARCHIVED: `/meetings/my?status=archived`,
    TRANSCRIPTION: (meetingId: string, meetId: string) =>
      `/meetings/${meetingId}/sessions/${meetId}/transcription`,
    TOGGLE_FAVORITE: (meetingId: string, meetId: string) =>
      `/meetings/${meetingId}/sessions/${meetId}/toggle-favorite`,
    TOGGLE_ARCHIVE: (meetingId: string, meetId: string) =>
      `/meetings/${meetingId}/sessions/${meetId}/toggle-archive`,
    ADD_TO_SPACE: (meetingId: string, meetId: string, spaceId: string) =>
      `/meetings/${meetingId}/sessions/${meetId}/spaces/${spaceId}`,
    REMOVE_FROM_SPACE: (meetingId: string, meetId: string, spaceId: string) =>
      `/meetings/${meetingId}/sessions/${meetId}/spaces/${spaceId}`,
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
    FIND: "/users/find",
    INVITATIONS: "/users/invitations", // bulk invite
    USER_INVITATIONS: (userId: string) => `/users/${userId}/invitations`, // resend invite
    VERIFY: (userId: string, hash: string) =>
      `/users/${userId}/verify?hash=${hash}`,
  },
} as const;
