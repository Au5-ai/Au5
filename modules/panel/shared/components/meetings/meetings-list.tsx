"use client";

import { Card } from "@/shared/components/ui/card";
import { MeetingData } from "@/shared/types";
import { MeetingCard } from "./meeting-card";
import NoRecordsState from "@/shared/components/empty-states/no-record";

interface MeetingsListProps {
  meetings: MeetingData;
  title: string;
}

export function MeetingsList({ meetings, title }: MeetingsListProps) {
  if (meetings.length === 0) {
    return <NoRecordsState />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="container mx-auto px-6 py-4">
        <h1 className="text-2xl font-bold mb-1">{title}</h1>
      </div>
      {meetings.map((group, groupIndex) => (
        <div key={groupIndex}>
          <h2 className="text-sm font-medium bg-gray-100 px-8 py-3">
            {group.date}
          </h2>
          <Card className="divide-y shadow-none border-none p-0">
            {group.items.map((item, index) => (
              <MeetingCard key={index} item={item} />
            ))}
          </Card>
        </div>
      ))}
    </div>
  );
}
