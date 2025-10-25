"use client";

import * as React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Star, Archive, ArchiveRestore } from "lucide-react";
import { MeetingItem } from "@/shared/types";
import { useRouter } from "next/navigation";
import { API_URLS } from "@/shared/network/api/urls";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui";
import { meetingsController } from "@/shared/network/api/meetingsController";
import { toast } from "sonner";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import { ArchiveConfirmationModal } from "@/app/(authenticated)/meetings/[meetingId]/sessions/[meetId]/archiveConfirmationModal";

interface MeetingCardProps {
  item: MeetingItem;
  onDeleteClick?: (item: MeetingItem) => void;
}

export function MeetingCard({ item }: MeetingCardProps) {
  const [showArchiveModal, setShowArchiveModal] = React.useState(false);
  const [isArchiving, setIsArchiving] = React.useState(false);
  const [isArchived, setIsArchived] = React.useState(
    item.status === "Archived",
  );

  const router = useRouter();

  const onMeetingClick = (item: MeetingItem) => {
    const meetingId = item.meetingId;
    const meetId = item.meetId;
    router.push(API_URLS.MEETING.TRANSCRIPTION(meetingId, meetId));
  };

  const handleArchiveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowArchiveModal(true);
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
        item.meetId,
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
          <div className="flex gap-2">
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
                <p>{isArchived ? "Remove from Archive" : "Move to Archive"}</p>
              </TooltipContent>
            </Tooltip>
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
    </>
  );
}
