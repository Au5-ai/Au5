import { BotIcon, ChevronDownIcon, Shield, ShieldOff } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { ButtonGroup } from "@/shared/components/ui/button-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Separator } from "@/shared/components/ui";
import { Textarea } from "@/shared/components/ui/textarea";

export function PrivacyGroupPopover() {
  return (
    <ButtonGroup>
      <Button variant="outline">
        <Shield /> Private
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Open Popover">
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="rounded-xl p-0 text-sm">
          <div className="px-4 py-3">
            <div className="text-sm font-medium">Meeting Access</div>
          </div>
          <Separator />
          <div className="p-4 text-sm *:[p:not(:last-child)]:mb-2">
            <Button variant="destructive" className="w-full mb-4 ">
              <ShieldOff className="w-4 h-4 mr-2 text-white" />
              Make Meeting Public
            </Button>
            <p className="text-muted-foreground">
              Making the meeting public will allow anyone with the link to see
              this meeting.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </ButtonGroup>
  );
}
