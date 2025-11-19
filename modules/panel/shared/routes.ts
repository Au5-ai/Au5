export const ROUTES = {
  LOGIN: "/login",
  PLAYGROUND: "/playground",
  FORBIDDEN: "/403",
  MEETINGS: {
    ROOT: "/meetings",
    TRANSCRIPTION: (meetingId: string) =>
      `/meetings/${meetingId}/transcription`,
  },
} as const;
