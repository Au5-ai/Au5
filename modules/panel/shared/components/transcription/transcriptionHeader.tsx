import React from "react";
import { Bot, LaptopMinimal, Shield, ShieldOff, Timer } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Meeting } from "@/shared/types";

export default function TranscriptionHeader({ meeting }: { meeting: Meeting }) {
  return (
    <div className="bg-white top-0 z-10">
      <div className="px-6 py-4">
        {/* Title Section */}
        <div className="flex justify-start gap-4">
          <img src="/assets/images/googleMeets.svg" alt="Logo" />{" "}
          <div className="flex justify-between items-starts w-full">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {meeting.title}
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
              </div>
            </div>
            <div>
              <Badge className="border-0 px-3 py-1 bg-purple-50 text-purple-800">
                <ShieldOff className="w-3 h-3 mr-1" />
                {"Public"}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
