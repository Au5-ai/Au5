"use client";

import * as React from "react";
import { Star, Trash } from "lucide-react";
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
      console.log(response);
      setCurrentFavoriteStatus(response.isFavorite);
      // await queryClient.invalidateQueries({ queryKey: ["meetings"] });
      // await queryClient.invalidateQueries({
      //   queryKey: ["transcription", meetingId],
      // });
      // await queryClient.refetchQueries({
      //   queryKey: ["transcription", meetingId],
      // });
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast.error("Failed to Change state of Favorite");
      setCurrentFavoriteStatus(!currentFavoriteStatus);
    } finally {
      setTimeout(() => setIsToggling(false), 300);
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 cursor-pointer"
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
        className="h-8 px-3 cursor-pointer hover:bg-gray-100 text-red-600 hover:text-red-700 hover:bg-red-50">
        <Trash className="h-4 w-4 mr-2" />
        {GLOBAL_CAPTIONS.actions.moveToArchive}
      </Button>
    </div>
  );
}
