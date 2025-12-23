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
import { getColorFromName } from "../lib";

export default function ParticipantAvatar({
  fullName,
  pictureUrl,
  className,
}: {
  fullName: string;
  pictureUrl: string;
  className?: string;
}) {
  const fallbackColor = getColorFromName(fullName);

  return (
    <Tooltip>
      <TooltipTrigger className="flex items-start">
        <div className="avatar-container">
          <Avatar className={`${className ?? ""}`}>
            <AvatarImage src={pictureUrl} alt={fullName} />
            <AvatarFallback
              className="text-white"
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
