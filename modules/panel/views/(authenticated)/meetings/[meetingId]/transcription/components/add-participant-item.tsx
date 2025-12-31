import React from "react";
import { Users } from "lucide-react";

interface AddParticipantItemProps {
  onClick?: () => void;
}

export default function AddParticipantItem({
  onClick,
}: AddParticipantItemProps) {
  return (
    <div
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-dashed border-gray-300 hover:border-gray-400"
      onClick={onClick}>
      <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
        <Users className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700">Add Participant</p>
        <p className="text-xs text-gray-500">Invite others to this meeting</p>
      </div>
    </div>
  );
}
