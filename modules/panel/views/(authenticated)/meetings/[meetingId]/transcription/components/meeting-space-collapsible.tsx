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
import { MySpacesResponse } from "@/shared/types/space";

export function MeetingSpaceCollapsible({
  spaces,
  defaultOpen = false,
  icon,
  name,
  onSelect,
  selectedSpaceIds = [],
}: {
  spaces: MySpacesResponse[] | undefined;
  defaultOpen: boolean;
  icon: LucideIcon;
  name: string;
  onSelect?: (spaceId: string, isSelected: boolean) => void;
  selectedSpaceIds?: string[];
}) {
  const [internalSelectedSpaces, setInternalSelectedSpaces] = React.useState<
    Set<string>
  >(new Set(selectedSpaceIds));

  const handleSpaceSelect = (spaceId: string) => {
    const isCurrentlySelected = internalSelectedSpaces.has(spaceId);
    const newSelectedState = !isCurrentlySelected;

    setInternalSelectedSpaces((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelectedState) {
        newSelected.add(spaceId);
      } else {
        newSelected.delete(spaceId);
      }
      return newSelected;
    });

    onSelect?.(spaceId, newSelectedState);
  };

  return (
    <SidebarGroup className="py-0 p-0">
      <Collapsible defaultOpen={defaultOpen} className="group/collapsible">
        <SidebarGroupLabel
          asChild
          className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full text-sm">
          <CollapsibleTrigger className="cursor-pointer">
            {icon && React.createElement(icon, { className: "mr-2 h-4 w-4" })}{" "}
            {name}{" "}
            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu>
              {!spaces || spaces.length === 0 ? (
                <SidebarMenuItem>
                  <div className="text-center w-full p-2 bg-yellow-100 text-yellow-800 text-sm rounded-md">
                    No spaces found. Create a space to get started.
                  </div>
                </SidebarMenuItem>
              ) : null}
              {spaces?.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    className="cursor-pointer"
                    onClick={() => handleSpaceSelect(item.id)}>
                    <div
                      data-active={internalSelectedSpaces.has(item.id)}
                      className="cursor-pointer group/calendar-item border-sidebar-border text-sidebar-primary-foreground data-[active=true]:border-sidebar-primary data-[active=true]:bg-sidebar-primary flex aspect-square size-4 shrink-0 items-center justify-center rounded-xs border">
                      <Check className="hidden size-3 group-data-[active=true]/calendar-item:block" />
                    </div>
                    {item.name}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
}
