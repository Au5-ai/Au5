"use client";

import { useQuery } from "@tanstack/react-query";
import { MeetingListSkeleton } from "@/shared/components/meetings/meeting-list-skeleton";
import { meetingsController } from "@/shared/network/api/meetingsController";
import { NetworkError } from "@/shared/components/empty-states/error";
import { MeetingsList } from "@/shared/components/meetings";

export default function ArchivedMeetingsView() {
  const {
    data: meetings = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["meetings", "archived"],
    queryFn: meetingsController.archived,
  });

  if (loading) {
    return <MeetingListSkeleton />;
  }

  if (error) {
    return <NetworkError />;
  }

  return <MeetingsList meetings={meetings} title="Archived Transcription" />;
}
