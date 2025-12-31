"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Mic, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Entry } from "@/shared/types";
import ParticipantAvatar from "@/shared/components/participant-avatar";
import ReactionBadges from "./transcription-reaction-badges";
import { Button } from "@/shared/components/ui";
import { Textarea } from "@/shared/components/ui/textarea";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import { meetingsController } from "@/shared/network/api/meetingsController";

export default function TranscriptionEntry({
  entry,
  participants,
  index,
  meetingId,
}: {
  entry: Entry;
  participants: { fullName: string; pictureUrl?: string }[];
  index: number;
  meetingId: string;
}) {
  const isChat = entry.entryType === "Chat";
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(entry.content);
  const [isSaving, setIsSaving] = useState(false);

  const getPicturesUrl = (fullName: string): string => {
    const participant = participants.find((p) => p.fullName === fullName);
    return participant?.pictureUrl || "";
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(entry.content);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(entry.content);
  };

  const handleSave = async () => {
    if (!editedContent.trim()) {
      toast.error("Content cannot be empty");
      return;
    }

    if (editedContent === entry.content) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await meetingsController.updateEntry(meetingId, entry.id, editedContent);
      entry.content = editedContent;
      setIsEditing(false);
      toast.success(GLOBAL_CAPTIONS.pages.meetings.updateEntrySuccess);
    } catch (error) {
      console.error("Failed to update entry:", error);
      toast.error(GLOBAL_CAPTIONS.pages.meetings.updateEntryError);
    } finally {
      setIsSaving(false);
    }
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
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[100px] text-gray-800"
                  disabled={isSaving}
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    onClick={handleCancel}
                    size="sm"
                    variant="outline"
                    disabled={isSaving}>
                    <X className="w-4 h-4" />
                    {GLOBAL_CAPTIONS.actions.cancel}
                  </Button>
                  <Button
                    onClick={handleSave}
                    size="sm"
                    disabled={isSaving}
                    className="gap-1">
                    <Check className="w-4 h-4" />
                    {isSaving
                      ? GLOBAL_CAPTIONS.actions.saving
                      : GLOBAL_CAPTIONS.actions.save}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative group/content">
                <p
                  className={`text-gray-800 leading-relaxed text-justify`}
                  dir="auto">
                  {entry.content}
                </p>
                <Button
                  onClick={handleEdit}
                  size="sm"
                  variant="ghost"
                  className="absolute -right-2 -top-2 opacity-0 group-hover/content:opacity-100 transition-opacity gap-1">
                  <Pencil className="w-3 h-3" />
                  {GLOBAL_CAPTIONS.actions.edit}
                </Button>
              </div>
            )}
          </div>

          <ReactionBadges reactions={entry.reactions} />
        </div>
      </div>

      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </motion.div>
  );
}
