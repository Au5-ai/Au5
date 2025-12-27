"use client";

import { NavMain } from "@/shared/components/nav-main";
import { NavUser } from "@/shared/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/shared/components/ui/sidebar";
import { User, UserMenuItem } from "@/shared/types";
import * as React from "react";
import Logo from "./logo";
import { NavSpaces } from "./nav-spaces";
import { MySpacesResponse } from "../types/space";
import { NavSecondary } from "./nav-secondary";
import { navSecondary } from "../models/secondary-sidebar";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: User;
  menu?: UserMenuItem[];
  spaces?: MySpacesResponse[];
}

export function AppSidebar({ user, menu, spaces, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            {user?.organizationLogo ? (
              <img
                src={user.organizationLogo}
                alt={user.organizationName || "Organization"}
                className="size-8 rounded-lg object-cover"
              />
            ) : (
              <Logo width={32} height={32} noBackground />
            )}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">
              {user?.organizationName || "Riter"}
            </span>
            <span className="truncate text-xs">logged in as {user?.role}</span>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={menu} />
        {spaces !== undefined && spaces.length > 0 && (
          <NavSpaces spaces={spaces} />
        )}
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>{user && <NavUser {...user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
