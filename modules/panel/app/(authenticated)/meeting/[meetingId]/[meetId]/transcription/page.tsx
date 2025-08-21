"use client";

import BreadcrumbLayout from "@/components/breadcrumb-layout";
import { NavActions } from "@/components/navActions";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useParams } from "next/navigation";

export default function TranscriptionPage() {
  const params = useParams();
  const meetingId = params.meetingId as string;
  const meetId = params.meetId as string;

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <BreadcrumbLayout />
        </div>
        <div className="ml-auto px-4">
          <NavActions />
        </div>
      </header>
      <div className="flex flex-1 flex-col">
        <div className="container mx-auto p-2 px-4">
          <h1 className="text-2xl font-bold mb-1">Meeting Transcription</h1>
        </div>
        <div className="container mx-auto p-4 text-sm text-muted-foreground">
          <p>
            Meeting ID: <span className="font-mono">{meetingId}</span>
          </p>
          <p>
            Meet ID: <span className="font-mono">{meetId}</span>
          </p>
        </div>
      </div>
    </SidebarInset>
  );
}
