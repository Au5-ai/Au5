"use client";

import * as React from "react";
import { ArchiveIcon, Bot, Frame, GalleryVerticalEnd } from "lucide-react";
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
import Logo from "./logo";

// This is sample data.
const data = {
  navMain: [
    {
      title: "My Meetings",
      url: "/meeting/my",
      icon: Frame,
    },
    {
      title: "Archived Transcripts",
      url: "/meeting/archived",
      icon: ArchiveIcon,
    },
    {
      title: "Shared With Me",
      url: "#",
      icon: Frame,
      showBadge: true,
      badge: "soon",
    },
    {
      title: "AI Tools",
      url: "#",
      icon: Bot,
      showBadge: true,
      badge: "soon",
    },
  ],
  spaces: [
    {
      name: "Automation Team",
      url: "#",
      icon: Frame,
      showBadge: true,
      badge: "soon",
    },
    {
      name: "My Agah",
      url: "#",
      icon: Frame,
      showBadge: true,
      badge: "soon",
    },
    {
      name: "ENS Team",
      url: "#",
      icon: Frame,
      showBadge: true,
      badge: "soon",
    },
    {
      name: "ISS Team",
      url: "#",
      icon: Frame,
      showBadge: true,
      badge: "soon",
    },
  ],
  // navWithSubMenu: [
  //   {
  //     title: "Account & Settings",
  //     url: "#",
  //     icon: SettingsIcon,
  //     isActive: true,
  //     items: [
  //       {
  //         title: "Settings",
  //         url: "#",
  //       },
  //     ],
  //   },
  // ],
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
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
              <Logo />
            </div>
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
        {/* <NavWithSubMenu items={data.navWithSubMenu} /> */}
      </SidebarContent>
      <SidebarFooter>{user && <NavUser {...user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
