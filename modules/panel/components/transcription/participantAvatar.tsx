import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function ParticipantAvatar({
  fullName,
  pictureUrl,
  size = "md",
}: {
  fullName: string;
  pictureUrl: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const getInitials = (fullName: string) => {
    return fullName
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Tooltip>
      <TooltipTrigger className="flex items-start">
        <div className="relative flex-shrink-0">
          {/* {pictureUrl ? (
            <img
              src={pictureUrl}
              alt={fullName}
              className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white shadow-sm`}
            />
          ) : (
            <div
              className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium ${textSizeClasses[size]} shadow-sm`}
            >
              {getInitials(fullName)}
            </div>
          )} */}

          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={pictureUrl} alt={fullName} />
            <AvatarFallback className="rounded-lg">
              {fullName.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      </TooltipTrigger>
      <TooltipContent>{fullName}</TooltipContent>
    </Tooltip>
  );
}
