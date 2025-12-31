export const API_URLS = {
  SPACES: {
    ROOT: "/spaces",
    MY_SPACES: "/users/spaces",
    MEETINGS: (spaceId: string) => `/spaces/${spaceId}/meetings`,
    MEMBERS: (spaceId: string) => `/spaces/${spaceId}/members`,
    ADD_MEMBERS: (spaceId: string) => `/spaces/${spaceId}/members`,
    REMOVE_MEMBER: (spaceId: string, userId: string) =>
      `/spaces/${spaceId}/members/${userId}`,
    ADD_MEETING: (spaceId: string, meetingId: string) =>
      `/spaces/${spaceId}/meetings/${meetingId}`,
    REMOVE_MEETING: (spaceId: string, meetingId: string) =>
      `/spaces/${spaceId}/meetings/${meetingId}`,
  },
  ASSISTANTS: {
    ROOT: "/assistants",
  },
  AUTH: {
    LOGIN: "/authentication/login",
    LOGOUT: "/authentication/logout",
  },
  MEETING: {
    AI_CONTENTS: (meetingId: string) => `/meetings/${meetingId}/ai-contents`,
    DELETE_AI_CONTENT: (meetingId: string, id: string) =>
      `/meetings/${meetingId}/ai-contents/${id}`,
    ARCHIVED: `/users/me/archived-meetings`,
    TRANSCRIPTION: (meetingId: string) => `/meetings/${meetingId}/transcript`,
    TOGGLE_FAVORITE: (meetingId: string) => `/meetings/${meetingId}/favorite`,
    ARCHIVE: (meetingId: string) => `/meetings/${meetingId}/archive`,
    UNARCHIVE: (meetingId: string) => `/meetings/${meetingId}/unarchive`,
    EXPORT: (meetingId: string, format: string = "text") =>
      `/meetings/${meetingId}/export?format=${format}`,
    RENAME: (meetingId: string) => `/meetings/${meetingId}/rename`,
    CLOSE: (meetingId: string) => `/meetings/${meetingId}/close`,
    ADD_BOT: "/meetings/bots",
    GENERATE_AI: (meetingId: string) => `/meetings/${meetingId}/ai-contents`,
    REMOVE: (meetingId: string) => `/meetings/${meetingId}`,
    ADD_PARTICIPANTS: (meetingId: string) =>
      `/meetings/${meetingId}/participants`,
  },
  SINGUP: {
    ADD_ADMIN: "/admin/hello",
  },
  ORGANIZATION: {
    CONFIG: "/organizations",
    EXTENSION_CONFIG: "/organizations/extension",
  },
  USERS: {
    LIST: "/users",
    ME: "/users/me",
    MY_MENU: "/users/me/menus",
    MY_MEETINGS: (status?: string) =>
      status
        ? `/users/me/meetings?status=${status}`
        : "/users/me/meetings?status=ended",
    SEARCH: "/users/search",
    INVITATIONS: "/users/invitations",
    RESEND_INVITATION: (userId: string) =>
      `/users/invitations/${userId}/resend`,
    VERIFY: (userId: string, hash: string) =>
      `/users/${userId}/verify?hash=${hash}`,
    VERIFY_POST: (userId: string) => `/users/${userId}/verify`,
  },
} as const;
