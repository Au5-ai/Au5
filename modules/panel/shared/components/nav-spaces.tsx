"use client";

import { Frame, MoreHorizontal, Trash2 } from "lucide-react";

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

export function NavSpaces({
  spaces,
}: {
  spaces: MySpacesResponse[] | undefined;
}) {
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
                <DropdownMenuItem>
                  <Trash2 className="text-muted-foreground" />
                  <span>Leave Space</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
