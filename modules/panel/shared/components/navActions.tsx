"use client";

import * as React from "react";
import {
  AtSign,
  Blocks,
  Link,
  MoreHorizontal,
  Pencil,
  Share2,
  Star,
  Trash,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { GLOBAL_CAPTIONS } from "../i18n/captions";

export function NavActions() {
  return (
    <div className="flex items-center gap-2 text-sm">
      {/* <Button variant="ghost" size="sm" className="h-8 px-3 cursor-pointer">
        <Blocks className="h-4 w-4 mr-2" />
        Add to space
      </Button> */}
     
      <Button variant="ghost" size="sm" className="h-8  justify-center cursor-pointer hover:bg-gray-100">
        <Star className="h-4 w-4 " />
      </Button>
      
      <Button variant="ghost" size="sm" className="h-8 px-3 cursor-pointer hover:bg-gray-100 text-red-600 hover:text-red-700 hover:bg-red-50">
        <Trash className="h-4 w-4 mr-2" />
        {GLOBAL_CAPTIONS.actions.moveToArchive}
      </Button>
    </div>
  );
}
