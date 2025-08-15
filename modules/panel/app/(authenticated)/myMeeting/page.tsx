"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, Share2, Trash2 } from "lucide-react";

const meetings = [
  {
    date: "Saturday, June 7",
    items: [
      {
        duration: "3m",
        time: "10:51 PM",
        title: "Meeting Transcription",
        participants: ["You"],
        avatar: "/avatar1.jpg",
      },
    ],
  },
  {
    date: "Monday, May 12",
    items: [
      {
        duration: "0m",
        time: "4:08 PM",
        title: "Meeting Transcription",
        participants: ["You"],
        avatar: "/avatar1.jpg",
      },
      {
        duration: "4m",
        time: "4:03 PM",
        title: "Meeting Transcription",
        participants: ["You"],
        avatar: "/avatar1.jpg",
      },
    ],
  },
  {
    date: "Tuesday, April 29",
    items: [
      {
        duration: "41m",
        time: "9:00 PM",
        title: "WebEngage Technical Discussion",
        participants: ["Ajay", "Behnam", "Bharath", "Mohammad", "You"],
        avatar: "/avatar2.jpg",
      },
      {
        duration: "1m",
        time: "8:22 PM",
        title: "Meeting Transcription",
        participants: ["You"],
        avatar: "/avatar1.jpg",
      },
      {
        duration: "4m",
        time: "8:10 PM",
        title: "Meeting Transcription",
        participants: ["You"],
        avatar: "/avatar1.jpg",
      },
    ],
  },
];

export default function MyMeetingPage() {
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
                    <AvatarImage src={item.avatar} alt={item.title} />
                    <AvatarFallback>{item.title[0]}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.participants.join(", ")}
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
