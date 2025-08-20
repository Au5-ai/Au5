"use client";

import { useParams } from "next/navigation";

export default function TranscriptionPage() {
  const params = useParams();
  const meetingId = params.meetingId as string;
  const meetId = params.meetId as string;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Meeting Transcription</h1>
        <div className="text-sm text-muted-foreground">
          <p>
            Meeting ID: <span className="font-mono">{meetingId}</span>
          </p>
          <p>
            Meet ID: <span className="font-mono">{meetId}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
