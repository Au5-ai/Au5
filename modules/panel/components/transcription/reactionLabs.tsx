import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Lightbulb, Target, Heart } from "lucide-react";

const REACTION_CONFIGS = {
  Task: {
    icon: CheckSquare,
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    label: "Task",
  },
  GoodPoint: {
    icon: Lightbulb,
    color: "bg-amber-100 text-amber-700 border-amber-200",
    label: "Good Point",
  },
  Goal: {
    icon: Target,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    label: "Goal",
  },
  Like: {
    icon: Heart,
    color: "bg-rose-100 text-rose-700 border-rose-200",
    label: "Like",
  },
};

export default function ReactionBadges({ reactions }) {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {reactions.map((reaction, index) => {
        const config = REACTION_CONFIGS[reaction.reactionType];
        if (!config || reaction.users.length === 0) return null;

        const Icon = config.icon;

        return (
          <Badge
            key={index}
            variant="outline"
            className={`${config.color} border text-xs font-medium px-2 py-0.5 flex items-center gap-1`}
          >
            <Icon className="w-3 h-3" />
            <span>{reaction.users.length}</span>
          </Badge>
        );
      })}
    </div>
  );
}
