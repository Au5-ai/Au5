import React from "react";
import { Calendar, Clock, Users, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import SpeakerAvatarGroup from "./speakerAvatarGroup";

const PLATFORM_CONFIGS = {
  GoogleMeet: {
    color: "bg-green-100 text-green-800",
    label: "Google Meet",
  },
  Zoom: {
    color: "bg-blue-100 text-blue-800",
    label: "Zoom",
  },
  Teams: {
    color: "bg-purple-100 text-purple-800",
    label: "Microsoft Teams",
  },
  Other: {
    color: "bg-gray-100 text-gray-800",
    label: "Other Platform",
  },
};

export default function TranscriptionHeader({ transcription }) {
  const platformConfig =
    PLATFORM_CONFIGS[transcription.platform] || PLATFORM_CONFIGS.Other;
  const totalEntries = transcription.entries?.length || 0;
  const transcriptionCount =
    transcription.entries?.filter((e) => e.entryType === "Transcription")
      .length || 0;
  const chatCount =
    transcription.entries?.filter((e) => e.entryType === "Chat").length || 0;

  // Get unique speakers
  const uniqueSpeakers = new Set();
  transcription.entries?.forEach((entry) => {
    if (entry.speaker?.fullName) {
      uniqueSpeakers.add(entry.speaker.fullName);
    }
  });

  const duration =
    transcription.entries?.length > 0
      ? transcription.entries[transcription.entries.length - 1].time
      : "00:00:00";

  const formatDuration = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
    return `${totalMinutes} min`;
  };
  const recordingDate = transcription.entries?.[0]?.timestamp
    ? new Date(transcription.entries[0].timestamp)
    : new Date(transcription.createdAt || Date.now());

  const lastUpdated = transcription.updated_date
    ? formatDistanceToNow(new Date(transcription.updated_date), {
        addSuffix: true,
      })
    : formatDistanceToNow(new Date(transcription.created_date || Date.now()), {
        addSuffix: true,
      });

  return (
    <div className="bg-white border-b border-gray-100 top-0 z-10">
      <div className="px-6 py-4">
        {/* Title Section */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Meeting Transcription
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="font-mono font-medium">
                {transcription.meetingId}
              </span>
              <div className="w-1 h-1 rounded-full bg-gray-300" />
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className="font-mono">{duration}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-300" />
              <span>{transcription.botName}</span>
            </div>
          </div>

          <Badge className={`${platformConfig.color} border-0 px-3 py-1`}>
            <Wifi className="w-3 h-3 mr-1" />
            {platformConfig.label}
          </Badge>
        </div>

        {/* Recording Info and Speaker Avatars */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              MK
            </div>
            <span>
              Recorded by{" "}
              <span className="font-medium text-gray-900">Mohammad Karimi</span>
              , {format(recordingDate, "M/d/yyyy")},{" "}
              {format(recordingDate, "h:mm:ss a")}, {formatDuration(duration)},{" "}
              Last updated {lastUpdated}
            </span>
          </div>
          <SpeakerAvatarGroup entries={transcription.entries} maxVisible={5} />
        </div>
      </div>
    </div>
  );
}
