import React from "react";
import { Bot, Gem, LaptopMinimal, Timer } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { format } from "date-fns";
import { Meeting } from "@/shared/types";
import ParticipantAvatarGroup from "./participantAvatarGroup";
import ParticipantAvatar from "./participantAvatar";

export default function TranscriptionHeader({ meeting }: { meeting: Meeting }) {
  const recordingDate = meeting.entries?.[0]?.timestamp
    ? new Date(meeting.entries[0].timestamp)
    : new Date(meeting.createdAt || Date.now());

  return (
    <div className="bg-white top-0 z-10">
      <div className="px-6 py-4">
        {/* Title Section */}
        <div className="flex justify-start gap-4">
          <img src="/assets/images/googleMeets.svg" alt="Logo" />{" "}
          <div className="flex justify-between items-starts w-full">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {meeting.title}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <LaptopMinimal className="w-4 h-4" />
                  <span>{meeting.meetingId}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-300" />
                <div className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  <span>{meeting.duration}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-300" />
                <div className="flex items-center gap-1">
                  <Bot className="w-4 h-4" />
                  <span>{meeting.botName}</span>
                </div>
              </div>
            </div>
            <div>
              <Badge className="border-0 px-3 py-1 bg-purple-50 text-purple-800">
                <Gem className="w-3 h-3 mr-1" />
                {meeting.platform}
              </Badge>
            </div>
          </div>
        </div>

        {/* Recording Info and Speaker Avatars */}
        {/* <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <ParticipantAvatar
              fullName={meeting.userRecorder.fullName}
              pictureUrl={meeting.userRecorder.pictureUrl}
            />
            <span>
              Recorded by{" "}
              <span className="font-medium text-gray-900">
                {meeting.userRecorder.fullName}
              </span>
              , {format(recordingDate, "dd MMMM yy")}{" "}
              {format(recordingDate, "HH:mm")}
            </span>
          </div>
          <ParticipantAvatarGroup
            participants={meeting.participants}
            guests={meeting.guests}
            maxVisible={8}
          />
        </div> */}
      </div>
    </div>
  );
}
