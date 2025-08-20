"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, Share2, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { meetingApi } from "@/lib/api";
import { MeetingListSkeleton } from "@/components/meeting-list-skeleton";

export default function MyMeetingPage() {
  const {
    data: meetings = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["meetings", "my"],
    queryFn: meetingApi.my,
  });

  if (loading) {
    return <MeetingListSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-red-500">
          Error:{" "}
          {error instanceof Error ? error.message : "Failed to fetch meetings"}
        </div>
      </div>
    );
  }

  return (
    <>
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
              >
                <div className="flex items-center">
                  <div className="flex h-full w-16 min-w-16 max-w-16 flex-col-reverse items-start justify-between truncate pl-1">
                    <div aria-label="meeting-list-item-created">
                      <div className="align-baseline font-small text-neutral-subtle text-xs leading-5">
                        {item.time}
                      </div>
                    </div>
                    <div
                      aria-label="meeting-list-item-duration"
                      className="truncate text-center align-baseline font-semibold text-neutral-default text-sm"
                    >
                      {item.duration}
                    </div>
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={item.pictureUrl} alt={item.meetName} />
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
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Share"
                      className="cursor-pointer"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete"
                      className="cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            ))}
          </Card>
        </div>
      ))}
    </>
  );
}
