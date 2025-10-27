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

export default function ParticipantAvatar({
  fullName,
  pictureUrl,
  className,
}: {
  fullName: string;
  pictureUrl: string;
  className?: string;
}) {
  const getColorFromName = (name: string) => {
    if (!name) return "#6b7280";
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 65%)`;
  };

  const fallbackColor = getColorFromName(fullName);

  return (
    <Tooltip>
      <TooltipTrigger className="flex items-start">
        <div className="avatar-container">
          <Avatar className={`rounded-lg ${className ?? ""}`}>
            <AvatarImage src={pictureUrl} alt={fullName} />
            <AvatarFallback
              className="rounded-lg text-white"
              style={{ backgroundColor: fallbackColor }}>
              {fullName?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </TooltipTrigger>
      <TooltipContent>{fullName}</TooltipContent>
    </Tooltip>
  );
}
