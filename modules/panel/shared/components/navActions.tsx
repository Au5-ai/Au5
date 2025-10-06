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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";

const data = [
  [
    {
      label: "Rename",
      icon: Pencil,
    },
    // {
    //   label: "Add to space", // Commented out - no API for spaces
    //   icon: Blocks,
    // },
  ],
  [
    {
      label: "Copy Link",
      icon: Link,
    },
    {
      label: "Email",
      icon: AtSign,
    },
    {
      label: "Move to Archived",
      icon: Trash,
    },
  ],
];

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
      {/* <Button variant="ghost" size="icon" className="h-7 w-32 cursor-pointer"> // Commented out - no API for spaces
        <Blocks />
        Add to space
      </Button> */}
      <Button variant="ghost" size="icon" className="h-7 w-21 cursor-pointer">
        <Share2 />
        Share
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-24 cursor-pointer">
        <Link />
        Copy Link
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-7 w-7 cursor-pointer"
        onClick={handleToggleFavorite}
        disabled={!meetingId || !meetId || isToggling}
        title={currentFavoriteStatus ? "Remove from favorites" : "Add to favorites"}
      >
        <Star className={currentFavoriteStatus ? "fill-yellow-400 text-yellow-400" : ""} />
      </Button>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="data-[state=open]:bg-accent h-7 w-7 cursor-pointer">
            <MoreHorizontal />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-56 overflow-hidden rounded-lg p-0"
          align="end">
          <Sidebar collapsible="none" className="bg-transparent">
            <SidebarContent>
              {data.map((group, index) => (
                <SidebarGroup key={index} className="border-b last:border-none">
                  <SidebarGroupContent className="gap-0">
                    <SidebarMenu>
                      {group.map((item, index) => (
                        <SidebarMenuItem key={index}>
                          <SidebarMenuButton className="cursor-pointer">
                            <item.icon /> <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarContent>
          </Sidebar>
        </PopoverContent>
      </Popover>
    </div>
  );
}
