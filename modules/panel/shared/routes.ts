export const ROUTES = {
  SIGNUP: "/signup",
  LOGIN: "/login",
  PLAYGROUND: "/playground",
  FORBIDDEN: "/403",
  MEETINGS: {
    ROOT: "/meetings",
    TRANSCRIPTION: (meetingId: string) =>
      `/meetings/${meetingId}/transcription`,
  },
  EXTENSION_LINK:
    "https://github.com/Au5-ai/Au5/tree/main/modules/extension/dist/extension.rar",
} as const;
