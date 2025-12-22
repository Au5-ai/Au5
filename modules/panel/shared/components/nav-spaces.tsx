"use client";

import { useState } from "react";
import { Frame, MoreHorizontal, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui";
import { MySpacesResponse } from "../types/space";
import Link from "next/link";
import LeaveSpaceModal from "./leave-space-modal";
import { spaceController } from "../network/api/spaceController";
import { useCurrentUser } from "../hooks/use-user";
import { toast } from "sonner";

export function NavSpaces({
  spaces,
}: {
  spaces: MySpacesResponse[] | undefined;
}) {
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<MySpacesResponse | null>(
    null,
  );
  const [isLeaving, setIsLeaving] = useState(false);
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();

  const handleLeaveSpace = async () => {
    if (!selectedSpace || !currentUser) return;

    setIsLeaving(true);
    try {
      await spaceController.removeUserFromSpace(
        selectedSpace.id,
        currentUser.id,
      );
      toast.success(`Left ${selectedSpace.name} successfully`);
      queryClient.invalidateQueries({ queryKey: ["userSpaces"] });
      setIsLeaveModalOpen(false);
    } catch (error) {
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Spaces</SidebarGroupLabel>
      <SidebarMenu>
        {spaces?.map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton asChild>
              <Link href={`/spaces/${item.id}/meetings`}>
                <Frame />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
            {/* {item.showBadge && (
              <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
            )} */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side="right"
                align="start">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedSpace(item);
                    setIsLeaveModalOpen(true);
                  }}
                  className="text-red-600 focus:text-red-600">
                  <Trash2 className="text-red-600" />
                  <span>Leave Space</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>

      <LeaveSpaceModal
        open={isLeaveModalOpen}
        onOpenChange={setIsLeaveModalOpen}
        onConfirm={handleLeaveSpace}
        spaceName={selectedSpace?.name || ""}
        isLoading={isLeaving}
      />
    </SidebarGroup>
  );
}
