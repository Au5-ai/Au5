import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Mic } from "lucide-react";
import { format } from "date-fns";
import ReactionBadges from "./reactionBadges";
import { Entry } from "@/type";
import ParticipantAvatar from "./participantAvatar";

export default function TranscriptionEntry({
  entry,
  index,
}: {
  entry: Entry;
  index: number;
}) {
  const isChat = entry.entryType === "Chat";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className={`group relative py-4 px-6 hover:bg-slate-50/50 border-r-2 ${
        isChat ? "border-r-transparent bg-indigo-50/30" : "border-r-transparent"
      }`}
    >
      <div className="flex gap-2">
        {/* Avatar */}
        <ParticipantAvatar
          fullName={entry.fullName}
          pictureUrl={entry.pictureUrl}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex justify-between mb-2">
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-gray-900 text-sm">
                {entry.fullName}
              </h3>
              <div className="flex gap-2 text-xs text-gray-500">
                <span className="font-mono">{entry.timeline}</span>
                <span className="text-gray-300">•</span>
                <span>{format(new Date(entry.timestamp), "HH:mm")}</span>
              </div>
            </div>

            <div className="flex items-center items-start gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-2  bg-gray-50 p-2 rounded-xl">
                {isChat ? (
                  <div className="flex items-center gap-1 text-indigo-600">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Chat</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-500">
                    <Mic className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Transcription</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mb-3">
            <p className={`text-gray-800 leading-relaxed`} dir="auto">
              {entry.content}
            </p>
          </div>

          {/* Reactions */}
          <ReactionBadges reactions={entry.reactions} />
        </div>
      </div>

      {/* Hover indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </motion.div>
  );
}
