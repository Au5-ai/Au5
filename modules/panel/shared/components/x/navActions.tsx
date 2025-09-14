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
    {
      label: "Add to space",
      icon: Blocks,
    },
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

export function NavActions() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-2 text-sm">
      <Button variant="ghost" size="icon" className="h-7 w-32 cursor-pointer">
        <Blocks />
        Add to space
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-21 cursor-pointer">
        <Share2 />
        Share
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-24 cursor-pointer">
        <Link />
        Copy Link
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer">
        <Star />
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
