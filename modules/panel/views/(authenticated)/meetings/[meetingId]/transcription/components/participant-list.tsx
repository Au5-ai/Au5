import React, { useMemo } from "react";
import { ChevronRight, Users } from "lucide-react";
import { Entry, Participant } from "@/shared/types";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/shared/components/ui/sidebar";
import { getColorFromName } from "@/shared/lib";

interface ParticipantListProps {
  participants: Participant[];
  guests: Participant[];
  entries: Entry[];
  defaultOpen?: boolean;
}

export default function ParticipantList({
  participants,
  guests,
  entries,
  defaultOpen = true,
}: ParticipantListProps) {
  const allParticipantsMap = new Map();
  participants.forEach((p) =>
    allParticipantsMap.set(p.fullName.toLowerCase(), p),
  );
  guests.forEach((g) => {
    const key = g.fullName.toLowerCase();
    if (!allParticipantsMap.has(key)) {
      allParticipantsMap.set(key, g);
    }
  });
  const allParticipants = Array.from(allParticipantsMap.values());

  const speakingData = useMemo(() => {
    if (!entries || entries.length === 0) return [];

    const speakingCounts = new Map<string, number>();
    entries.forEach((entry) => {
      if (entry.entryType === "Transcription") {
        const count = speakingCounts.get(entry.fullName) || 0;
        speakingCounts.set(entry.fullName, count + 1);
      }
    });

    const total = Array.from(speakingCounts.values()).reduce(
      (sum, count) => sum + count,
      0,
    );

    return Array.from(speakingCounts.entries())
      .map(([name, count]) => ({
        name,
        percentage: total > 0 ? (count / total) * 100 : 0,
        count,
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [entries]);

  if (allParticipants.length === 0) return null;

  return (
    <SidebarGroup className="py-0 p-0">
      <Collapsible defaultOpen={defaultOpen} className="group/collapsible">
        <SidebarGroupLabel
          asChild
          className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full text-sm">
          <CollapsibleTrigger className="cursor-pointer">
            <Users className="mr-2 h-4 w-4" />
            Participants & Contributions ({allParticipants.length})
            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent className="mt-2 mb-4 max-h-[600px] overflow-y-auto">
            {speakingData.length > 1 && (
              <div className="mb-2 mt-2 p-3 bg-gray-50 rounded-lg sticky top-0 z-10">
                <PieChart data={speakingData} />
              </div>
            )}
            <div className="space-y-2 pr-2">
              <div
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-dashed border-gray-300 hover:border-gray-400"
                onClick={() => {
                  console.log("Add participant clicked");
                }}>
                <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">
                    Add Participant
                  </p>
                  <p className="text-xs text-gray-500">
                    Invite others to this meeting
                  </p>
                </div>
              </div>

              {allParticipants.map((participant, index) => {
                const fallbackColor = getColorFromName(participant.fullName);
                return (
                  <div
                    key={`${participant.id}-${index}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={participant.pictureUrl}
                        alt={participant.fullName}
                      />
                      <AvatarFallback
                        className="text-white text-sm"
                        style={{ backgroundColor: fallbackColor }}>
                        {participant.fullName?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {participant.fullName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {participant.email}
                      </p>
                    </div>
                    {speakingData.find(
                      (s) => s.name === participant.fullName,
                    ) && (
                      <div className="text-xs font-medium text-gray-600">
                        {speakingData
                          .find((s) => s.name === participant.fullName)
                          ?.percentage.toFixed(1)}
                        %
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </SidebarGroupContent>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
}

interface PieChartProps {
  data: { name: string; percentage: number; count: number }[];
}

function PieChart({ data }: PieChartProps) {
  if (data.length === 0) return null;

  const size = 120;
  const center = size / 2;
  const radius = size / 2 - 8;

  let currentAngle = -90;

  const slices = data.map((item) => {
    const sliceAngle = (item.percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArc = sliceAngle > 180 ? 1 : 0;

    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");

    return {
      ...item,
      pathData,
      color: getColorFromName(item.name),
    };
  });

  return (
    <div className="flex gap-4 items-center">
      <svg width={size} height={size} className="flex-shrink-0">
        {slices.map((slice, index) => (
          <path
            key={index}
            d={slice.pathData}
            fill={slice.color}
            stroke="white"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="flex-1 space-y-2">
        {data.map((item, index) => {
          const color = getColorFromName(item.name);
          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {item.name}
                </p>
              </div>
              <span className="text-xs font-semibold text-gray-700 flex-shrink-0">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
