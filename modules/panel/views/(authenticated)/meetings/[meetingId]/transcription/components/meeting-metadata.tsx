import {
  Bot,
  LaptopMinimal,
  LucideIcon,
  Shield,
  Timer,
  Users,
} from "lucide-react";
import React from "react";
import { Meeting } from "@/shared/types";

interface MetadataItemProps {
  icon: LucideIcon;
  label: string;
}

function MetadataSeparator() {
  return <div className="w-1 h-1 rounded-full bg-gray-300" />;
}

function MetadataItem({ icon: Icon, label }: MetadataItemProps) {
  return (
    <div className="flex items-center gap-1">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
  );
}

export function MeetingMetadata({ meeting }: { meeting: Meeting }) {
  const totalParticipants = meeting.participants.length + meeting.guests.length;

  const metadata = [
    { icon: LaptopMinimal, label: meeting.meetingId },
    { icon: Timer, label: meeting.duration },
    { icon: Bot, label: meeting.botName },
    { icon: Shield, label: "Private" },
    { icon: Users, label: `Participants (${totalParticipants})` },
  ];

  return (
    <div className="flex items-center gap-3 text-sm text-gray-600">
      {metadata.map((item, index) => (
        <React.Fragment key={index}>
          <MetadataItem icon={item.icon} label={item.label} />
          {index < metadata.length - 1 && <MetadataSeparator />}
        </React.Fragment>
      ))}
    </div>
  );
}
