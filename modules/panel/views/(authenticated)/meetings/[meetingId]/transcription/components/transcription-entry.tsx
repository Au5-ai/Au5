"use client";

import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Mic } from "lucide-react";
import { format } from "date-fns";
import { Entry } from "@/shared/types";
import ParticipantAvatar from "@/shared/components/participant-avatar";
import ReactionBadges from "./transcription-reaction-badges";

export default function TranscriptionEntry({
  entry,
  participants,
  index,
}: {
  entry: Entry;
  participants: { fullName: string; pictureUrl?: string }[];
  index: number;
}) {
  const isChat = entry.entryType === "Chat";

  const getPicturesUrl = (fullName: string): string => {
    const participant = participants.find((p) => p.fullName === fullName);
    return participant?.pictureUrl || "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className={`group relative py-4 px-6 hover:bg-slate-50/50 border-r-2 ${
        isChat ? "border-r-transparent bg-indigo-50/30" : "border-r-transparent"
      }`}>
      <div className="flex gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex justify-between mb-2">
            <div className="flex gap-2">
              <div className="flex items-center">
                <ParticipantAvatar
                  fullName={entry.fullName}
                  pictureUrl={getPicturesUrl(entry.fullName)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {entry.fullName}
                </h3>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span>{entry.timeline}</span>
                  <span className="text-gray-300">•</span>
                  <span>{entry.time}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center items-start gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-2  bg-gray-50 p-2 rounded-xl">
                {isChat ? (
                  <div className="flex items-center gap-1 text-indigo-600">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-500">
                    <Mic className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-3">
            <p
              className={`text-gray-800 leading-relaxed text-justify`}
              dir="auto">
              {entry.content}
            </p>
          </div>

          <ReactionBadges reactions={entry.reactions} />
        </div>
      </div>

      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </motion.div>
  );
}
