import React, { useMemo, useState } from "react";
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
import { PieChart } from "@/shared/components/charts/pie-chart";
import AddParticipantItem from "./add-participant-item";
import AddParticipantsModal from "./add-participants-modal";

interface ParticipantListProps {
  participants: Participant[];
  guests: Participant[];
  entries: Entry[];
  meetingId: string;
  defaultOpen?: boolean;
}

export default function ParticipantList({
  participants,
  guests,
  entries,
  meetingId,
  defaultOpen = true,
}: ParticipantListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newParticipants, setNewParticipants] = useState<Participant[]>([]);
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
  newParticipants.forEach((p) => {
    const key = p.fullName.toLowerCase();
    if (!allParticipantsMap.has(key)) {
      allParticipantsMap.set(key, p);
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
            <div className="space-y-2">
              <AddParticipantItem onClick={() => setIsModalOpen(true)} />

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

      <AddParticipantsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        meetingId={meetingId}
        existingParticipantIds={allParticipants.map((p) => p.id)}
        onParticipantsAdded={(addedParticipants) => {
          setNewParticipants([...newParticipants, ...addedParticipants]);
        }}
      />
    </SidebarGroup>
  );
}
