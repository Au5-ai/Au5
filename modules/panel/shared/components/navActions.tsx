"use client";

import * as React from "react";
import {
  AtSign,
  Blocks,
  Link,
  MoreHorizontal,
  Pencil,
  Share2,
  Star,
  Trash,
} from "lucide-react";
import { meetingsController } from "@/shared/network/api/meetingsController";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/shared/components/ui/button";
import { GLOBAL_CAPTIONS } from "../i18n/captions";

interface NavActionsProps {
  meetingId?: string;
  meetId?: string;
  isFavorite?: boolean;
}

export function NavActions({ meetingId, meetId, isFavorite = false }: NavActionsProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isToggling, setIsToggling] = React.useState(false);
  const [currentFavoriteStatus, setCurrentFavoriteStatus] = React.useState(isFavorite);
  const queryClient = useQueryClient();

  // Update local state when prop changes
  React.useEffect(() => {
    setCurrentFavoriteStatus(isFavorite);
  }, [isFavorite]);

  const handleToggleFavorite = async () => {
    if (!meetingId || !meetId || isToggling) return;
    
    try {
      setIsToggling(true);
      
      // Optimistically update the UI
      setCurrentFavoriteStatus(!currentFavoriteStatus);
      
      await meetingsController.toggleFavorite(meetingId, meetId);
      
      // Invalidate and refetch the meetings queries to update the UI
      await queryClient.invalidateQueries({ queryKey: ["meetings"] });
      await queryClient.invalidateQueries({ queryKey: ["transcription", meetingId] });
      
      // Also refetch the full transcription to update the favorite status
      await queryClient.refetchQueries({ queryKey: ["transcription", meetingId] });
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      // Revert the optimistic update on error
      setCurrentFavoriteStatus(!currentFavoriteStatus);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-7 w-7 cursor-pointer"
        onClick={handleToggleFavorite}
        disabled={!meetingId || !meetId || isToggling}
        title={currentFavoriteStatus ? "Remove from favorites" : "Add to favorites"}
      >
        <Star className={currentFavoriteStatus ? "fill-yellow-400 text-yellow-400" : ""} />
      
      <Button variant="ghost" size="sm" className="h-8 px-3 cursor-pointer hover:bg-gray-100 text-red-600 hover:text-red-700 hover:bg-red-50">
        <Trash className="h-4 w-4 mr-2" />
        {GLOBAL_CAPTIONS.actions.moveToArchive}
      </Button>
    </div>
  );
}
