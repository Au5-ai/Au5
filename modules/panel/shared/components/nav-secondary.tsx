"use client";

import * as React from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import { Bell, LucideIcon } from "lucide-react";
import { AboutRiterDialog } from "./about-riter-dialog";
import { useExtensionDetection } from "../hooks/use-extension-detection";
import { EXTENSION_VERSION } from "../config";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url?: string;
    action?: string;
    icon: LucideIcon;
    checkVersion?: boolean;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const [aboutOpen, setAboutOpen] = React.useState(false);
  const { extensionVersion } = useExtensionDetection();

  const handleItemClick = (item: (typeof items)[number]) => {
    if (item.action === "about") {
      setAboutOpen(true);
    }
  };

  const hasUpdate = (item: (typeof items)[number]) => {
    if (!item.checkVersion || !extensionVersion) return false;
    return extensionVersion !== EXTENSION_VERSION;
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
                      {hasUpdate(item) && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Bell className="ml-auto h-4 w-4 text-blue-500 animate-pulse" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>New Version Available</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
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
