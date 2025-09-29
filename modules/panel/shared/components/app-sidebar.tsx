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
import * as React from "react";
import Logo from "./logo";
import { LucideIcon } from "lucide-react";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: User;
  menu: {
    title: string;
    url: string;
    icon?: LucideIcon;
    showBadge?: boolean;
    badge?: string;
  };
}

export function AppSidebar({ user, menu, ...props }: AppSidebarProps) {
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
        <NavMain items={menu} />
        {/* <NavSpaces spaces={data.spaces} /> */}{" "}
        {/* Commented out - no API for spaces */}
        {/* <NavWithSubMenu items={data.navWithSubMenu} /> */}
      </SidebarContent>
      <SidebarFooter>{user && <NavUser {...user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
