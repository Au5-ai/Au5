"use client";

import * as React from "react";
import { Star, Trash } from "lucide-react";
import { meetingsController } from "@/shared/network/api/meetingsController";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/shared/components/ui/button";
import { GLOBAL_CAPTIONS } from "../i18n/captions";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui";

interface NavActionsProps {
  meetingId?: string;
  meetId?: string;
  isFavorite?: boolean;
}

export function NavActions({
  meetingId,
  meetId,
  isFavorite = false,
}: NavActionsProps) {
  const [isToggling, setIsToggling] = React.useState(false);
  const [currentFavoriteStatus, setCurrentFavoriteStatus] =
    React.useState(isFavorite);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    setCurrentFavoriteStatus(isFavorite);
  }, [isFavorite]);

  const handleToggleFavorite = async () => {
    if (!meetingId || !meetId || isToggling) return;

    try {
      setIsToggling(true);

      setCurrentFavoriteStatus(!currentFavoriteStatus);
      await meetingsController.toggleFavorite(meetingId, meetId);
      await queryClient.invalidateQueries({ queryKey: ["meetings"] });
      await queryClient.invalidateQueries({
        queryKey: ["transcription", meetingId],
      });
      await queryClient.refetchQueries({
        queryKey: ["transcription", meetingId],
      });
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      setCurrentFavoriteStatus(!currentFavoriteStatus);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <Tooltip>
        <TooltipTrigger>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 cursor-pointer"
            onClick={handleToggleFavorite}
            disabled={!meetingId || !meetId || isToggling}>
            <Star
              className={
                currentFavoriteStatus ? "fill-yellow-400 text-yellow-400" : ""
              }
            />
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
        className="h-8 px-3 cursor-pointer hover:bg-gray-100 text-red-600 hover:text-red-700 hover:bg-red-50">
        <Trash className="h-4 w-4 mr-2" />
        {GLOBAL_CAPTIONS.actions.moveToArchive}
      </Button>
    </div>
  );
}
