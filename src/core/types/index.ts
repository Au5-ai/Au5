export interface IMeetingPlatform {
  getPlatformName(): string;
  getMeetingTitle(): string;
  extractCaptionData(block: Element): any;
  isCaptionBlock(container: HTMLElement | null, el: Element): boolean;
  findCaptionBlock(container: HTMLElement | null, el: Node): Element | null;
  processBlock(el: Element): any;
}

export interface PipelineContext {
  transcriptContainer?: HTMLElement | null;
  canUseAriaBasedTranscriptSelector: boolean;
}

export interface User {
  id: string;
  fullName: string;
  pictureUrl: string;
  joinedAt?: Date;
}

export interface TranscriptionEntry {
  meetingId: string;
  transcriptBlockId: string;
  speaker: User;
  transcript: string;
  timestamp: Date;
}

/**
 * Represents a single spoken block in a meeting transcript.
 */
export interface TranscriptBlock {
  /** Unique identifier for the transcript block */
  id: string;

  user: User;

  /** ISO timestamp of when the words were spoken */
  timestamp: string;

  /** The transcribed text spoken by the person */
  transcript: string;
  type?: "chat" | "transcript";
  reactions?: Record<string, User[]>;
}

/**
 * Represents a meeting and its related details.
 */
export interface Meeting {
  id: string;

  platform: string;

  /** ISO 8601 timestamp of when the meeting started */
  startAt: Date;

  /** ISO 8601 timestamp of when the meeting ended */
  endAt: Date | null;

  isStarted: boolean;
  isEnded: boolean;
  /** Transcript content as an array of structured transcript blocks */
  transcripts: TranscriptBlock[];

  users: User[];
}
