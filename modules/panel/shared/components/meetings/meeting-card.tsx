"use client";

import * as React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Star, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { MeetingItem } from "@/shared/types";
import { useRouter } from "next/navigation";
import {
  Badge,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui";
import { meetingsController } from "@/shared/network/api/meetingsController";
import { toast } from "sonner";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import { ArchiveConfirmationModal } from "./archive-confirmation-modal";
import { ROUTES } from "@/shared/routes";
import { RemoveConfirmationModal } from "./remove-confirmation-modal";

interface MeetingCardProps {
  item: MeetingItem;
  onDeleteClick?: (item: MeetingItem) => void;
  onRemoveSuccess?: (meetingId: string) => void;
}

export function MeetingCard({ item, onRemoveSuccess }: MeetingCardProps) {
  const [showArchiveModal, setShowArchiveModal] = React.useState(false);
  const [showRemoveModal, setShowRemoveModal] = React.useState(false);
  const [isArchiving, setIsArchiving] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);
  const [isArchived, setIsArchived] = React.useState(
    item.status === "Archived",
  );

  const router = useRouter();

  const onMeetingClick = (item: MeetingItem) => {
    const meetingId = item.meetingId;
    router.push(ROUTES.MEETINGS.TRANSCRIPTION(meetingId));
  };

  const handleArchiveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowArchiveModal(true);
  };

  const handleRemoveMeeting = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRemoveModal(true);
  };

  const handleModalOpenChange = (open: boolean) => {
    setShowArchiveModal(open);
  };

  const handleArchiveConfirm = async () => {
    if (!item.meetingId || !item.meetId) return;

    try {
      setIsArchiving(true);
      const response = await meetingsController.toggleArchive(
        item.meetingId,
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

  const handleRemoveConfirm = async () => {
    if (!item.meetingId || !item.meetId) return;

    try {
      setIsRemoving(true);
      const response = await meetingsController.removeMeeting(item.meetingId);

      if (response.isRemoved) {
        toast.success(GLOBAL_CAPTIONS.pages.meetings.removeSuccess);
        onRemoveSuccess?.(item.meetingId);
      } else {
        toast.error(GLOBAL_CAPTIONS.pages.meetings.removeError);
      }
    } catch (error) {
      console.error("Failed to Remove Meeting:", error);
      toast.error(GLOBAL_CAPTIONS.pages.meetings.removeError);
    } finally {
      setIsRemoving(false);
      setShowRemoveModal(false);
    }
  };

  return (
    <>
      <CardContent
        className="flex items-center justify-between px-3 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => onMeetingClick(item)}>
        <div className="flex items-center">
          <div className="flex flex-col justify-center items-center size-9">
            <Star
              className={`h-4 w-4 ${
                item.isFavorite
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-400"
              }`}
            />
          </div>
          <div className="flex h-full w-16 min-w-16 max-w-16 flex-col-reverse items-start justify-between truncate pl-1">
            <div aria-label="meeting-list-item-created">
              <div className="align-baseline font-small text-neutral-subtle text-xs leading-5">
                {item.time}
              </div>
            </div>
            <div
              aria-label="meeting-list-item-duration"
              className="truncate text-center align-baseline font-semibold text-neutral-default text-sm">
              {item.duration}
            </div>
          </div>
          <Avatar className="h-10 w-10">
            <AvatarImage src={item.pictureUrl} alt={item.meetName} />
            <AvatarFallback>{item.meetName[0]}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="font-medium">{item.meetName}</p>
            <p className="text-xs text-muted-foreground">
              {item.guests.join(", ")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div>
            {item.status != "Ended" && (
              <Badge variant="outline" className="px-2 py-1">
                {item.status}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {(item.status === "Ended" || item.status === "Archived") && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`cursor-pointer ${
                      isArchived
                        ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                        : "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    }`}
                    onClick={handleArchiveClick}>
                    {isArchived ? (
                      <ArchiveRestore className="h-4 w-4" />
                    ) : (
                      <Archive className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isArchived ? "Remove from Archive" : "Move to Archive"}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
            {item.status !== "Ended" && item.status !== "Archived" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    onClick={handleRemoveMeeting}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Remove Meeting</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </CardContent>

      <ArchiveConfirmationModal
        open={showArchiveModal}
        onOpenChange={handleModalOpenChange}
        isArchived={isArchived}
        onConfirm={handleArchiveConfirm}
        isLoading={isArchiving}
      />
      <RemoveConfirmationModal
        open={showRemoveModal}
        onOpenChange={(open) => setShowRemoveModal(open)}
        onConfirm={handleRemoveConfirm}
        isLoading={isRemoving}
      />
    </>
  );
}
