import React from "react";
import SpeakerAvatar from "./speakerAvatar";

export default function SpeakerAvatarGroup({ entries, maxVisible = 5 }) {
  // Extract unique speakers with their info
  const uniqueSpeakers = React.useMemo(() => {
    const speakersMap = new Map();

    entries?.forEach((entry) => {
      if (entry.speaker?.fullName && !speakersMap.has(entry.speaker.fullName)) {
        speakersMap.set(entry.speaker.fullName, entry.speaker);
      }
    });

    return Array.from(speakersMap.values());
  }, [entries]);

  if (uniqueSpeakers.length === 0) return null;

  const visibleSpeakers = uniqueSpeakers.slice(0, maxVisible - 1);
  const remainingCount = uniqueSpeakers.length - visibleSpeakers.length;
  const shouldShowOverflow = remainingCount > 0;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visibleSpeakers.map((speaker, index) => (
          <div
            key={speaker.fullName}
            className="relative z-10 ring-2 ring-white rounded-full"
            style={{ zIndex: visibleSpeakers.length - index }}
            title={speaker.fullName}
          >
            <SpeakerAvatar speaker={speaker} size="sm" />
          </div>
        ))}

        {shouldShowOverflow && (
          <div
            className="relative z-0 w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs font-semibold ring-2 ring-white"
            title={`${remainingCount} more speaker${
              remainingCount > 1 ? "s" : ""
            }`}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  );
}
