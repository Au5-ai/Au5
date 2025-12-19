import React from "react";
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
import { Plus } from "lucide-react";

interface GroupAvatarProps {
  members: SpaceMember[];
  maxVisible?: number;
  size?: "sm" | "md" | "lg";
  showAddButton?: boolean;
  onAddClick?: () => void;
}

export function GroupAvatar({
  members,
  maxVisible = 5,
  size = "md",
  showAddButton = false,
  onAddClick,
}: GroupAvatarProps) {
  const getColorFromName = (name: string) => {
    if (!name) return "#6b7280";
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 65%)`;
  };

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const visibleMembers = members.slice(0, maxVisible);
  const remainingCount = members.length - maxVisible;

  return (
    <div className="flex items-center -space-x-4">
      {visibleMembers.map((member) => {
        const fallbackColor = getColorFromName(member.fullName);
        return (
          <Tooltip key={member.userId}>
            <TooltipTrigger>
              <Avatar
                className={`${sizeClasses[size]} border-2 border-background`}>
                <AvatarImage src={member.pictureUrl} alt={member.fullName} />
                <AvatarFallback
                  className="text-white"
                  style={{ backgroundColor: fallbackColor }}>
                  {member.fullName?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>{member.fullName}</TooltipContent>
          </Tooltip>
        );
      })}
      {remainingCount > 0 && (
        <Tooltip>
          <TooltipTrigger>
            <div
              className={`${sizeClasses[size]} rounded-full border-2 border-background bg-muted flex items-center justify-center font-medium text-muted-foreground`}>
              +{remainingCount}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {members
              .slice(maxVisible)
              .map((m) => m.fullName)
              .join(", ")}
          </TooltipContent>
        </Tooltip>
      )}
      {showAddButton && onAddClick && (
        <Tooltip>
          <TooltipTrigger className="z-10">
            <button
              onClick={onAddClick}
              className={`${sizeClasses[size]} rounded-full z-50 border-2 border-background bg-primary text-primary-foreground flex items-center justify-center font-medium hover:bg-primary/90 transition-colors`}>
              <Plus className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Add member</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
