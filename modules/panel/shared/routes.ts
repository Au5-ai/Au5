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
  EXTENSION_LINK: "/dl/extension.rar",
} as const;
