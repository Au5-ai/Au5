import React from "react";
import { Clock, Gem } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Meeting } from "@/type";
import ParticipantAvatarGroup from "./participantAvatarGroup";
import ParticipantAvatar from "./participantAvatar";

export default function TranscriptionHeader({ meeting }: { meeting: Meeting }) {
  const uniqueSpeakers = new Set();
  meeting.participants?.forEach((participant) => {
    if (participant?.fullName) {
      uniqueSpeakers.add(participant.fullName);
    }
  });

  meeting.guests?.forEach((guest) => {
    if (guest?.fullName) {
      uniqueSpeakers.add(guest.fullName);
    }
  });

  const recordingDate = meeting.entries?.[0]?.timestamp
    ? new Date(meeting.entries[0].timestamp)
    : new Date(meeting.createdAt || Date.now());

  return (
    <div className="bg-white border-b border-gray-100 top-0 z-10">
      <div className="px-6 py-4">
        {/* Title Section */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {meeting.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="font-medium">{meeting.meetingId}</span>
              <div className="w-1 h-1 rounded-full bg-gray-300" />
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{meeting.duration}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-300" />
              <span>{meeting.botName}</span>
            </div>
          </div>

          <Badge className="border-0 px-3 py-1 bg-green-100 text-green-800">
            <Gem className="w-3 h-3 mr-1" />
            {meeting.platform}
          </Badge>
        </div>

        {/* Recording Info and Speaker Avatars */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <ParticipantAvatar
              fullName={meeting.userRecorder.fullName}
              pictureUrl={meeting.userRecorder.pictureUrl}
              size="sm"
            />
            <span>
              Recorded by{" "}
              <span className="font-medium text-gray-900">
                {meeting.userRecorder.fullName}
              </span>
              , {format(recordingDate, "dd MMMM yy")}{" "}
              {format(recordingDate, "hh:mm")}
            </span>
          </div>
          <ParticipantAvatarGroup
            participants={meeting.participants}
            guests={meeting.guests}
            maxVisible={8}
          />
        </div>
      </div>
    </div>
  );
}
