"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Link, Share2, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MeetingListSkeleton } from "@/app/(authenticated)/meetings/meeting-list-skeleton";
import { useRouter } from "next/navigation";
import { SidebarInset, SidebarTrigger } from "@/shared/components/ui/sidebar";
import { Separator } from "@/shared/components/ui/separator";
import { meetingsController } from "@/shared/network/api/meetingsController";
import { MeetingItem } from "@/shared/types";
import { NetworkError } from "@/shared/components/empty-states/error";
import BreadcrumbLayout from "@/shared/components/breadcrumb-layout";
import NoRecordsState from "@/shared/components/empty-states/no-record";
import { API_URLS } from "@/shared/network/api/urls";

export default function MyMeetingPage() {
  const router = useRouter();

  const {
    data: meetings = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["meetings", "my"],
    queryFn: meetingsController.my,
  });

  const handleMeetingClick = (item: MeetingItem) => {
    const meetingId = item.meetingId;
    const meetId = item.meetId;
    router.push(API_URLS.MEETING.TRANSCRIPTION(meetingId, meetId));
  };

  if (loading) {
    return <MeetingListSkeleton />;
  }

  if (error) {
    return <NetworkError />;
  }

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
          {/* Render a component passed from children via a prop */}
        </div>
      </header>
      {meetings.length === 0 && <NoRecordsState />}
      {meetings.length > 0 && (
        <div className="flex flex-1 flex-col">
          <div className="container mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold mb-1">Meeting Transcription</h1>
          </div>

          {meetings.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h2 className="text-sm font-medium bg-gray-100 px-8 py-3">
                {group.date}
              </h2>
              <Card className="divide-y shadow-none border-none p-0 ">
                {group.items.map((item, index) => (
                  <CardContent
                    key={index}
                    className="flex items-center justify-between px-3 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleMeetingClick(item)}>
                    <div className="flex items-center">
                      <div className="flex h-full w-16 min-w-16 max-w-16 flex-col-reverse items-start justify-between truncate pl-1">
                        <div aria-label="meeting-list-item-created">
                          <div className="align-baseline font-small text-neutral-subtle text-xs leading-5">
                            {item.time}
                          </div>
                        </div>
                        <div
                          aria-label="meeting-list-item-duration"
                          className="truncate text-center align-baseline font-semibold text-neutral-default text-sm">
                          {item.duration}
                        </div>
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={item.pictureUrl}
                          alt={item.meetName}
                        />
                        <AvatarFallback>{item.meetName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <p className="font-medium">{item.meetName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.guests.join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Open"
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle open action here
                          }}>
                          <Link className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Share"
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle share action here
                          }}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete"
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle delete action here
                          }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                ))}
              </Card>
            </div>
          ))}
        </div>
      )}
    </SidebarInset>
  );
}
