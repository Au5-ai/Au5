"use client";

import * as React from "react";
import {
  Archive,
  ArchiveRestore,
  Star,
  Download,
  FileText,
  FileDown,
  Pen,
  Copy,
  Link,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { meetingsController } from "@/shared/network/api/meetingsController";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import { ArchiveConfirmationModal } from "@/shared/components/meetings/archive-confirmation-modal";
import { RenameMeetingModal } from "@/shared/components/meetings/rename-meeting-modal";
import { Separator } from "@/shared/components/ui";

interface TranscriptionActionsProps {
  meetingId?: string;
  meetId?: string;
  meetingName?: string;
  isFavorite?: boolean;
  meetingStatus?: string;
  onMeetingRenamed?: (newName: string) => void;
}

export function TranscriptionActions({
  meetingId,
  meetId,
  meetingName = "",
  isFavorite = false,
  meetingStatus,
  onMeetingRenamed,
}: TranscriptionActionsProps) {
  const [isToggling, setIsToggling] = React.useState(false);
  const [currentFavoriteStatus, setCurrentFavoriteStatus] =
    React.useState(isFavorite);
  const [showArchiveModal, setShowArchiveModal] = React.useState(false);
  const [showRenameModal, setShowRenameModal] = React.useState(false);
  const [isArchiving, setIsArchiving] = React.useState(false);
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [isArchived, setIsArchived] = React.useState(
    meetingStatus === "Archived",
  );
  const [isExporting, setIsExporting] = React.useState(false);

  React.useEffect(() => {
    setCurrentFavoriteStatus(isFavorite);
  }, [isFavorite]);

  const handleToggleFavorite = async () => {
    if (!meetingId || !meetId || isToggling) return;

    try {
      setIsToggling(true);
      setCurrentFavoriteStatus(!currentFavoriteStatus);

      const response = await meetingsController.toggleFavorite(meetingId);

      if (response.isFavorite) {
        toast.success("Meeting has been added to your favorite list");
      } else {
        toast.success("Meeting has been removed from your favorite list");
      }

      setCurrentFavoriteStatus(response.isFavorite);
    } catch (error) {
      toast.error("Failed to Change state of Favorite");
      setCurrentFavoriteStatus(currentFavoriteStatus);
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
        isArchived,
      );

      if (response.isArchived) {
        toast.success(GLOBAL_CAPTIONS.pages.meetings.archivedSuccess);
      } else {
        toast.success(GLOBAL_CAPTIONS.pages.meetings.unarchivedSuccess);
      }

      setIsArchived(response.isArchived);
    } catch (error) {
      console.error("Failed to toggle archive:", error);
    } finally {
      setIsArchiving(false);
      setShowArchiveModal(false);
    }
  };

  const handleRenameConfirm = async (newName: string) => {
    if (!meetingId || !meetId) return;

    try {
      setIsRenaming(true);
      await meetingsController.rename(meetingId, newName);

      toast.success(GLOBAL_CAPTIONS.pages.meetings.renameSuccess);
      onMeetingRenamed?.(newName);
    } catch (error) {
      console.error("Failed to rename meeting:", error);
      toast.error(GLOBAL_CAPTIONS.pages.meetings.renameError);
    } finally {
      setIsRenaming(false);
      setShowRenameModal(false);
    }
  };

  const handleExportToText = async () => {
    if (!meetingId || !meetId) return;

    try {
      setIsExporting(true);
      const textContent = await meetingsController.exportToText(meetingId);

      const blob = new Blob([textContent], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `meeting-${meetingId}-${meetId}-transcription.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(GLOBAL_CAPTIONS.pages.meetings.exportSuccess);
    } catch (error) {
      console.error("Failed to export transcription:", error);
      toast.error(GLOBAL_CAPTIONS.pages.meetings.exportError);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportToPdf = () => {
    toast.info("PDF export feature coming soon!");
  };

  const handleCopyUrl = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      toast.success(GLOBAL_CAPTIONS.actions.copySuccess);
    } catch (error) {
      console.error("Failed to copy URL:", error);
      toast.error("Failed to copy URL to clipboard");
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyUrl}
            disabled={!meetingId || !meetId}
            className="h-8 gap-2 cursor-pointer hover:bg-gray-100">
            <Link className="w-4 h-4" />
            {GLOBAL_CAPTIONS.actions.copy}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Copy meeting URL to clipboard</p>
        </TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={!meetingId || !meetId || isExporting}
            className="h-8 gap-2 cursor-pointer">
            <Download className="w-4 h-4" />
            {GLOBAL_CAPTIONS.actions.export}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={handleExportToText}
            disabled={isExporting}
            className="cursor-pointer gap-2">
            <FileText className="w-4 h-4" />
            {GLOBAL_CAPTIONS.actions.exportToText}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleExportToPdf}
            disabled
            className="gap-2 opacity-60">
            <FileDown className="w-4 h-4" />
            {GLOBAL_CAPTIONS.actions.exportToPdf}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Separator
        orientation="vertical"
        className="data-[orientation=vertical]:h-4"
      />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 cursor-pointer hover:bg-yellow-200`}
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

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRenameModal(true)}
            disabled={!meetingId || !meetId}
            className={`h-8 cursor-pointer hover:bg-gray-100`}>
            <Pen className="w-5 h-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Rename Meeting</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowArchiveModal(true)}
            disabled={!meetingId || !meetId}
            className={`h-8 cursor-pointer hover:bg-gray-100 ${
              isArchived
                ? "text-green-600 hover:text-green-700  hover:bg-green-100"
                : ""
            }`}>
            {isArchived ? (
              <ArchiveRestore className="w-5 h-5" />
            ) : (
              <Archive className="w-5 h-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {" "}
            {isArchived
              ? GLOBAL_CAPTIONS.actions.removeFromArchive
              : GLOBAL_CAPTIONS.actions.moveToArchive}{" "}
          </p>
        </TooltipContent>
      </Tooltip>
      <ArchiveConfirmationModal
        open={showArchiveModal}
        onOpenChange={setShowArchiveModal}
        isArchived={isArchived}
        onConfirm={handleArchiveConfirm}
        isLoading={isArchiving}
      />
      <RenameMeetingModal
        open={showRenameModal}
        onOpenChange={setShowRenameModal}
        currentName={meetingName}
        onConfirm={handleRenameConfirm}
        isLoading={isRenaming}
      />
    </div>
  );
}
