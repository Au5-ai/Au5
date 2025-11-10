export const ROUTES = {
  LOGIN: "/login",
  PLAYGROUND: "/playground",
  MEETINGS: {
    ROOT: "/meetings",
    TRANSCRIPTION: (meetingId: string) =>
      `/meetings/${meetingId}/transcription`,
  },
} as const;
