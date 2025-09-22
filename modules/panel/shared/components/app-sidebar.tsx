"use client";

import { NavMain } from "@/shared/components/nav-main";
// import { NavSpaces } from "@/shared/components/nav-spaces"; // Commented out - no API for spaces
import { NavUser } from "@/shared/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenuButton,
    SidebarRail,
} from "@/shared/components/ui/sidebar";
import { User } from "@/shared/types";
import {
    ArchiveIcon,
    Brain,
    ClosedCaption,
    // Frame, // Commented out - no longer used after removing spaces
    Settings,
    UserPlus,
    Waypoints,
} from "lucide-react";
import * as React from "react";
import Logo from "./logo";

// This is sample data.
const data = {
  navMain: [
    {
      title: "My Meetings",
      url: "/meeting/my",
      icon: ClosedCaption,
    },
    {
      title: "Archived Transcripts",
      url: "/meeting/archived",
      icon: ArchiveIcon,
    },
    {
      title: "Shared With Me",
      url: "#",
      icon: Waypoints,
      showBadge: true,
      badge: "soon",
    },
    {
      title: "AI Tools",
      url: "#",
      icon: Brain,
      showBadge: true,
      badge: "soon",
    },
    {
      title: "System Settings",
      url: "/system",
      icon: Settings,
    },
    {
      title: "User Management",
      url: "/users",
      icon: UserPlus,
    },
  ],
  // spaces: [ // Commented out - no API for spaces
  //   {
  //     name: "Automation Team",
  //     url: "#",
  //     icon: Frame,
  //     showBadge: true,
  //     badge: "soon",
  //   },
  //   {
  //     name: "My Agah",
  //     url: "#",
  //     icon: Frame,
  //     showBadge: true,
  //     badge: "soon",
  //   },
  //   {
  //     name: "ENS Team",
  //     url: "#",
  //     icon: Frame,
  //     showBadge: true,
  //     badge: "soon",
  //   },
  //   {
  //     name: "ISS Team",
  //     url: "#",
  //     icon: Frame,
  //     showBadge: true,
  //     badge: "soon",
  //   },
  // ],
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
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <Logo width={32} height={32} />
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
        {/* <NavSpaces spaces={data.spaces} /> */} {/* Commented out - no API for spaces */}
        {/* <NavWithSubMenu items={data.navWithSubMenu} /> */}
      </SidebarContent>
      <SidebarFooter>{user && <NavUser {...user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
