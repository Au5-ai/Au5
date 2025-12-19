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
import { getColorFromName } from "../lib";
import { Member } from "../types/space";

interface GroupAvatarProps {
  members: Member[];
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
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };
  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
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
          <TooltipTrigger asChild>
            <button
              onClick={onAddClick}
              className={`${sizeClasses[size]} rounded-full z-10 border-2 border-background bg-primary text-primary-foreground flex items-center justify-center font-medium hover:bg-primary/90 transition-colors`}>
              <Plus className={iconSizeClasses[size]} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Add member</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
