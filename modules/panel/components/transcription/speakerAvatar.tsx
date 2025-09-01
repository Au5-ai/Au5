import React from "react";

export default function SpeakerAvatar({ speaker, size = "md" }) {
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

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative flex-shrink-0">
      {speaker.pictureUrl ? (
        <img
          src={speaker.pictureUrl}
          alt={speaker.fullName}
          className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white shadow-sm`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium ${textSizeClasses[size]} shadow-sm`}
        >
          {getInitials(speaker.fullName)}
        </div>
      )}
    </div>
  );
}
