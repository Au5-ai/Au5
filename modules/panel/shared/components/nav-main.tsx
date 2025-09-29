"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import { UserMenuItem } from "../types";

export function NavMain({ items }: { items: UserMenuItem[] | undefined }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Playground</SidebarGroupLabel>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items?.map((item) => (
            <SidebarMenuItem key={item.title} className="cursor-pointer">
              <SidebarMenuButton
                tooltip={item.title}
                className="cursor-pointer"
                onClick={() => (window.location.href = item.url)}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>

              {item.showBadge && (
                <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
