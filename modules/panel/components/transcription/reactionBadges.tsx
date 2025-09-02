import React from "react";
import { Badge } from "@/components/ui/badge";
import { Reaction } from "@/type";

export default function ReactionBadges({
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

        return (
          <Badge
            key={index}
            variant="outline"
            className={`${reaction.className} border text-xs font-medium px-1 py-1 flex items-center gap-1`}
          >
            <p className="w-4 h-4 text-center">{reaction.emoji}</p>
            <span className="w-4 h-4 text-center">
              {reaction.participants.length}
            </span>
          </Badge>
        );
      })}
    </div>
  );
}
