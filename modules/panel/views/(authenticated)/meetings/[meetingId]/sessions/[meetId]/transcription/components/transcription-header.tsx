import React from "react";

import { Meeting } from "@/shared/types";
import { MeetingMetadata } from "./meeting-metadata";
import { PlatformLogo } from "@/shared/components/platform-logo";
import { TranscriptionActions } from "./transcription-actions";

interface TranscriptionHeaderProps {
  meeting: Meeting;
}

export default function TranscriptionHeader({
  meeting,
}: TranscriptionHeaderProps) {
  return (
    <div className="bg-white top-0 z-10">
      <div className="px-4 py-4">
        <div className="flex justify-start gap-4">
          <PlatformLogo platform={meeting.platform} />
          <div className="flex justify-between items-start w-full">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {meeting.title}
              </h1>
              <MeetingMetadata meeting={meeting} />
            </div>
            <TranscriptionActions
              meetingId={meeting.id}
              meetId={meeting.meetingId}
              isFavorite={meeting.isFavorite}
              meetingStatus={meeting.status}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
