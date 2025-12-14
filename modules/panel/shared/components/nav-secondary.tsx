"use client";

import * as React from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import { LucideIcon } from "lucide-react";
import { AboutRiterDialog } from "./about-riter-dialog";

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url?: string;
    action?: string;
    icon: LucideIcon;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const [aboutOpen, setAboutOpen] = React.useState(false);

  const handleItemClick = (item: (typeof items)[number]) => {
    if (item.action === "about") {
      setAboutOpen(true);
    }
  };

  return (
    <>
      <SidebarGroup {...props}>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                {item.url ? (
                  <SidebarMenuButton tooltip={item.title} asChild>
                    <a href={item.url} target="_blank" rel="noreferrer">
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton
                    tooltip={item.title}
                    onClick={() => handleItemClick(item)}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <AboutRiterDialog open={aboutOpen} onOpenChange={setAboutOpen} />
    </>
  );
}
