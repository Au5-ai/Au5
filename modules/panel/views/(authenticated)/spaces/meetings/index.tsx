"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MeetingListSkeleton } from "@/shared/components/meetings/meeting-list-skeleton";
import { meetingsController } from "@/shared/network/api/meetingsController";
import { NetworkError } from "@/shared/components/empty-states/error";
import { MeetingsList } from "@/shared/components/meetings";

export default function SpaceMeetingsView() {
  const params = useParams();
  const spaceId = params.spaceId as string;

  const {
    data: meetings = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["meetings", "space", spaceId],
    queryFn: meetingsController.my, // Using my meetings for now
  });

  if (loading) {
    return <MeetingListSkeleton />;
  }

  if (error) {
    return <NetworkError />;
  }

  return <MeetingsList meetings={meetings} title={`Space Meetings`} />;
}
