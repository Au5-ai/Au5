import React from "react";
import { ChevronRight, Users } from "lucide-react";
import { Participant } from "@/shared/types";
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
  defaultOpen?: boolean;
}

export default function ParticipantList({
  participants,
  guests,
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
  if (allParticipants.length === 0) return null;

  return (
    <SidebarGroup className="py-0 p-0">
      <Collapsible defaultOpen={defaultOpen} className="group/collapsible">
        <SidebarGroupLabel
          asChild
          className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full text-sm">
          <CollapsibleTrigger className="cursor-pointer">
            <Users className="mr-2 h-4 w-4" />
            Participants ({allParticipants.length})
            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent className="mt-2">
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
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
