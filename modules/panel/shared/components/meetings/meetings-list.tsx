"use client";

import { Card } from "@/shared/components/ui/card";
import { MeetingData } from "@/shared/types";
import { MeetingCard } from "./meeting-card";
import { EmptyMeetings } from "../empty-states/meeting-empty";

interface MeetingsListProps {
  meetings: MeetingData;
  allowArchive?: boolean;
  archivedView?: boolean;
  onRemoveSuccess?: (meetingId: string) => void;
}

export function MeetingsList({
  meetings,
  allowArchive = true,
  archivedView = false,
  onRemoveSuccess,
}: MeetingsListProps) {
  if (meetings.length === 0) {
    return <EmptyMeetings />;
  }

  return (
    <>
      {meetings.map((group, groupIndex) => (
        <div key={groupIndex}>
          <h2 className="text-sm font-medium bg-gray-100 px-8 py-3">
            {group.date}
          </h2>
          <Card className="divide-y shadow-none border-none p-0">
            {group.items.map((item, index) => (
              <MeetingCard
                key={index}
                item={item}
                allowArchive={allowArchive}
                archivedView={archivedView}
                onRemoveSuccess={onRemoveSuccess}
              />
            ))}
          </Card>
        </div>
      ))}
    </>
  );
}
