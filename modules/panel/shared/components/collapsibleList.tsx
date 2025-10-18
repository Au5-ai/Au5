import * as React from "react";
import { Check, ChevronRight, LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";

export function CollapsibleList({
  row,
  defaultOpen = false,
}: {
  row: {
    icon: LucideIcon;
    name: string;
    items: string[];
  };
  defaultOpen: boolean;
}) {
  return (
    <React.Fragment key={row.name}>
      <SidebarGroup key={row.name} className="py-0 p-0">
        <Collapsible defaultOpen={defaultOpen} className="group/collapsible">
          <SidebarGroupLabel
            asChild
            className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full text-sm">
            <CollapsibleTrigger className="cursor-pointer">
              {row.icon && <row.icon className="mr-2 h-4 w-4" />} {row.name}{" "}
              <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent className="mt-2">
              <SidebarMenu>
                {row.items.map((item, index) => (
                  <SidebarMenuItem key={item}>
                    <SidebarMenuButton>
                      <div
                        data-active={index < 2}
                        className="group/calendar-item border-sidebar-border text-sidebar-primary-foreground data-[active=true]:border-sidebar-primary data-[active=true]:bg-sidebar-primary flex aspect-square size-4 shrink-0 items-center justify-center rounded-xs border">
                        <Check className="hidden size-3 group-data-[active=true]/calendar-item:block" />
                      </div>
                      {item}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </Collapsible>
      </SidebarGroup>
    </React.Fragment>
  );
}
