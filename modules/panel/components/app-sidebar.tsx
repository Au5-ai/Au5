"use client";

import * as React from "react";
import {
  Bot,
  Frame,
  GalleryVerticalEnd,
  icons,
  Settings,
  SquareTerminal,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavSpaces } from "@/components/nav-spaces";
import { NavUser } from "@/components/nav-user";
import { User } from "@/type";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavWithSubMenu } from "./nav-withSubMenu";

// This is sample data.
const data = {
  navMain: [
    {
      title: "My Meetings",
      url: "#",
      icon: Frame,
    },
    {
      title: "Shared With Me",
      url: "#",
      icon: Frame,
    },
    {
      title: "AI Tools",
      url: "#",
      icon: Bot,
    },
    {
      title: "Archived Transcripts",
      url: "#",
      icon: Bot,
    },
  ],
  spaces: [
    {
      name: "Automation Team",
      url: "#",
      icon: Frame,
    },
    {
      name: "My Agah",
      url: "#",
      icon: Frame,
    },
    {
      name: "ENS Team",
      url: "#",
      icon: Frame,
    },
    {
      name: "ISS Team",
      url: "#",
      icon: Frame,
    },
  ],
  navWithSubMenu: [
    {
      title: "Account & Settings",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Settings",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: User;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">
              {user?.fullName || "User"}
            </span>
            <span className="truncate text-xs">
              {user?.email || "email@example.com"}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSpaces spaces={data.spaces} />
        <NavWithSubMenu items={data.navWithSubMenu} />
      </SidebarContent>
      <SidebarFooter>{user && <NavUser {...user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
