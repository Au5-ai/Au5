export type MeetingPlatform = "google_meet" | "zoom" | "teams";

export type AutoLeaveTimeouts = {
  waitingEnter: number;
  noParticipant: number;
  allParticipantsLeft: number;
};

export type MeetingConfiguration = {
  hubUrl: string;
  platform: MeetingPlatform;
  meetingUrl: string | null;
  botDisplayName: string;
  meetingId: string;
  language?: string | null;
  autoLeave: AutoLeaveTimeouts;
};
