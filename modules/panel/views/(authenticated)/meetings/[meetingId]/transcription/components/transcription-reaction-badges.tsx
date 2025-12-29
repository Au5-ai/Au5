import React from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Reaction } from "@/shared/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { getColorFromName } from "@/shared/lib";

export default function TranscriptionReactionBadges({
  reactions,
}: {
  reactions: Reaction[];
}) {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {reactions.map((reaction, index) => {
        if (!reaction.participants || reaction.participants.length === 0)
          return null;

        const visibleParticipants = reaction.participants.slice(0, 3);
        const remainingCount = reaction.participants.length - 3;

        return (
          <Tooltip key={reaction.id}>
            <TooltipTrigger>
              <Badge
                variant="outline"
                className={`${reaction.className} border rounded-xl text-xs font-medium px-1.5 py-1 flex items-center gap-1.5`}>
                <span className="text-center">{reaction.emoji}</span>
                <div className="flex items-center -space-x-2">
                  {visibleParticipants.map((participant, pIndex) => {
                    const fallbackColor = getColorFromName(
                      participant.fullName,
                    );
                    return (
                      <Avatar
                        key={pIndex}
                        className="h-4 w-4 border border-background">
                        <AvatarImage
                          src={participant.pictureUrl}
                          alt={participant.fullName}
                        />
                        <AvatarFallback
                          className="text-[8px] text-white"
                          style={{ backgroundColor: fallbackColor }}>
                          {participant.fullName?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })}
                  {remainingCount > 0 && (
                    <div className="h-4 w-4 rounded-full border border-background bg-muted flex items-center justify-center text-[8px] font-medium text-muted-foreground">
                      +{remainingCount}
                    </div>
                  )}
                </div>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <p className="font-medium mb-1">
                  {reaction.emoji} {reaction.type}
                </p>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  {reaction.participants.map((p, idx) => (
                    <div key={idx}>{p.fullName}</div>
                  ))}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
