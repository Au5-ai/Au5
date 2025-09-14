import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function ParticipantAvatar({
  fullName,
  pictureUrl,
}: {
  fullName: string;
  pictureUrl: string;
}) {
  const getColorFromName = (fullName: string) => {
    if (!fullName) return "#6b7280";
    let hash = 0;
    for (let i = 0; i < fullName.length; i++) {
      hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 65%)`;
  };

  const fallbackColor = getColorFromName(fullName);

  return (
    <Tooltip>
      <TooltipTrigger className="flex items-start">
        <div className="avatar-container">
          <Avatar className="avatar-rounded">
            <AvatarImage src={pictureUrl} alt={fullName} />
            <AvatarFallback
              className="avatar-rounded text-white"
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
