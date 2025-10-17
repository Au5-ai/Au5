"use client";

import * as React from "react";
import { Archive, ArchiveRestore, Star, Trash } from "lucide-react";
import { meetingsController } from "@/shared/network/api/meetingsController";
import { Button } from "@/shared/components/ui/button";
import { GLOBAL_CAPTIONS } from "../../../../../../shared/i18n/captions";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../../../../shared/components/ui";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArchiveConfirmationModal } from "./archiveConfirmationModal";
import { set } from "date-fns";

interface NavActionsProps {
  meetingId?: string;
  meetId?: string;
  isFavorite?: boolean;
  meetingStatus?: string;
}

export function NavActions({
  meetingId,
  meetId,
  isFavorite = false,
  meetingStatus,
}: NavActionsProps) {
  const [isToggling, setIsToggling] = React.useState(false);
  const [currentFavoriteStatus, setCurrentFavoriteStatus] =
    React.useState(isFavorite);
  const [showArchiveModal, setShowArchiveModal] = React.useState(false);
  const [isArchiving, setIsArchiving] = React.useState(false);
  const [isArchived, setIsArchived] = React.useState(
    meetingStatus === "Archived",
  );

  React.useEffect(() => {
    setCurrentFavoriteStatus(isFavorite);
  }, [isFavorite]);

  const handleToggleFavorite = async () => {
    if (!meetingId || !meetId || isToggling) return;

    try {
      setIsToggling(true);

      setCurrentFavoriteStatus(!currentFavoriteStatus);
      const response = await meetingsController.toggleFavorite(
        meetingId,
        meetId,
      );
      if (response.isFavorite) {
        toast.success("Meeting has been added to your favorite list");
      } else {
        toast.success("Meeting has been removed from your favorite list");
      }
      setCurrentFavoriteStatus(response.isFavorite);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast.error("Failed to Change state of Favorite");
      setCurrentFavoriteStatus(!currentFavoriteStatus);
    } finally {
      setTimeout(() => setIsToggling(false), 300);
    }
  };

  const handleArchiveConfirm = async () => {
    if (!meetingId || !meetId) return;

    try {
      setIsArchiving(true);
      const response = await meetingsController.toggleArchive(
        meetingId,
        meetId,
      );

      if (response.isArchived) {
        toast.success(GLOBAL_CAPTIONS.pages.meetings.archivedSuccess);
      } else {
        toast.success(GLOBAL_CAPTIONS.pages.meetings.unarchivedSuccess);
      }

      setIsArchived(response.isArchived);
    } catch (error) {
      console.error("Failed to toggle archive:", error);
      toast.error(GLOBAL_CAPTIONS.pages.meetings.archiveError);
    } finally {
      setIsArchiving(false);
      setShowArchiveModal(false);
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 cursor-pointer hover:bg-yellow-200 ${currentFavoriteStatus ? `bg-yellow-100` : ``}`}
            onClick={handleToggleFavorite}
            disabled={!meetingId || !meetId || isToggling}>
            <motion.div
              animate={{
                scale: isToggling ? [1, 1.3, 1] : 1,
                rotate: isToggling ? [0, 15, -15, 0] : 0,
              }}
              transition={{ duration: 0.3 }}>
              <Star
                className={`transition-all duration-200 ${
                  currentFavoriteStatus
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-400"
                }`}
              />
            </motion.div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {currentFavoriteStatus
              ? "Remove from favorites"
              : "Add to favorites"}
          </p>
        </TooltipContent>
      </Tooltip>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowArchiveModal(true)}
        disabled={!meetingId || !meetId}
        className={`h-8 cursor-pointer hover:bg-gray-100 ${
          isArchived
            ? "text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100"
            : "text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100"
        }`}>
        {isArchived ? (
          <ArchiveRestore className="w-5 h-5 text-green-600" />
        ) : (
          <Archive className="w-5 h-5 text-orange-600" />
        )}
        {isArchived
          ? GLOBAL_CAPTIONS.actions.removeFromArchive
          : GLOBAL_CAPTIONS.actions.moveToArchive}
      </Button>

      <ArchiveConfirmationModal
        open={showArchiveModal}
        onOpenChange={setShowArchiveModal}
        isArchived={isArchived}
        onConfirm={handleArchiveConfirm}
        isLoading={isArchiving}
      />
    </div>
  );
}
