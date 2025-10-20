"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Star, Trash2 } from "lucide-react";
import { MeetingItem } from "@/shared/types";
import { useRouter } from "next/navigation";
import { API_URLS } from "@/shared/network/api/urls";

interface MeetingCardProps {
  item: MeetingItem;
  onDeleteClick?: (item: MeetingItem) => void;
}

export function MeetingCard({ item }: MeetingCardProps) {
  const onDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const router = useRouter();

  const onMeetingClick = (item: MeetingItem) => {
    const meetingId = item.meetingId;
    const meetId = item.meetId;
    router.push(API_URLS.MEETING.TRANSCRIPTION(meetingId, meetId));
  };

  return (
    <CardContent
      className="flex items-center justify-between px-3 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onMeetingClick(item)}>
      <div className="flex items-center">
        <div className="flex flex-col justify-center items-center size-9">
          <Star
            className={`h-4 w-4 ${
              item.isFavorite
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-400"
            }`}
          />
        </div>
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
            title="Delete"
            className="cursor-pointer"
            onClick={onDeleteClick}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  );
}
