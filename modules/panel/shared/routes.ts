export const ROUTES = {
  SIGNUP: "/signup",
  LOGIN: "/login",
  REGISTERED: "/registered",
  PLAYGROUND: "/playground",
  FORBIDDEN: "/403",
  MEETINGS: {
    ROOT: "/meetings",
    TRANSCRIPTION: (meetingId: string) =>
      `/meetings/${meetingId}/transcription`,
  },
  EXTENSION_LINK: "/dl/riter-extension.rar",
} as const;
