import React from "react";
import { Bot, LaptopMinimal, Shield, Timer } from "lucide-react";
import { Meeting } from "@/shared/types";
import { NavActions } from "@/app/(authenticated)/meetings/[meetingId]/sessions/[meetId]/navActions";

export default function TranscriptionHeader({ meeting }: { meeting: Meeting }) {
  return (
    <div className="bg-white top-0 z-10">
      <div className="px-4 py-4">
        {/* Title Section */}
        <div className="flex justify-start gap-4">
          <img src="/assets/images/googleMeets.svg" alt="Logo" />{" "}
          <div className="flex justify-between items-starts w-full">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                <span>{meeting.title}</span>
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <LaptopMinimal className="w-4 h-4" />
                  <span>{meeting.meetingId}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-300" />
                <div className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  <span>{meeting.duration}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-300" />
                <div className="flex items-center gap-1">
                  <Bot className="w-4 h-4" />
                  <span>{meeting.botName}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-300" />
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span>Private</span>
                </div>
              </div>
            </div>
            <NavActions
              meetingId={meeting?.id}
              meetId={meeting?.meetingId}
              isFavorite={meeting?.isFavorite}
              meetingStatus={meeting?.status}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
