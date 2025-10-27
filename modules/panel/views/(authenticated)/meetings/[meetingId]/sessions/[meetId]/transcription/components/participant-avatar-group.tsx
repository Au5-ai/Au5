import React from "react";
import { Participant } from "@/shared/types";
import ParticipantAvatar from "./participant-avatar";

export default function ParticipantAvatarGroup({
  participants,
  guests,
  maxVisible = 5,
}: {
  participants: Participant[];
  guests: Participant[];
  maxVisible?: number;
}) {
  const uniqueParticipants = React.useMemo(() => {
    const participantsMap = new Map<string, Participant>();

    participants?.forEach((participant) => {
      if (participant.fullName && !participantsMap.has(participant.fullName)) {
        participantsMap.set(participant.fullName, participant);
      }
    });

    guests?.forEach((guest) => {
      if (guest.fullName && !participantsMap.has(guest.fullName)) {
        participantsMap.set(guest.fullName, guest);
      }
    });

    return Array.from(participantsMap.values());
  }, [participants, guests]);

  if (uniqueParticipants.length === 0) return null;

  const visibleParticipants = uniqueParticipants.slice(0, maxVisible - 1);
  const remainingCount = uniqueParticipants.length - visibleParticipants.length;
  const shouldShowOverflow = remainingCount > 0;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {shouldShowOverflow && (
          <div
            className="relative z-20 w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs font-semibold ring-2 ring-white"
            title={`${remainingCount} more speaker${
              remainingCount > 1 ? "s" : ""
            }`}>
            +{remainingCount}
          </div>
        )}

        {visibleParticipants.map((participant, index) => (
          <div
            key={participant.fullName}
            className="relative z-10 ring-2 ring-white rounded-lg"
            style={{ zIndex: visibleParticipants.length - index }}
            title={participant.fullName}>
            <ParticipantAvatar
              fullName={participant.fullName}
              pictureUrl={participant.pictureUrl}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
