"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MeetingListSkeleton } from "@/shared/components/meetings/meeting-list-skeleton";
import { NetworkError } from "@/shared/components/empty-states/error";
import { MeetingsList } from "@/shared/components/meetings";
import { useCurrentUserSpaces } from "@/shared/hooks/use-user";
import { spaceController } from "@/shared/network/api/spaceController";

export default function SpaceMeetingsView() {
  const params = useParams();
  const { data: spaces } = useCurrentUserSpaces();
  const title = spaces?.find((s) => s.id === params.spaceId)?.name || "Space";
  const spaceId = params.spaceId as string;

  const {
    data: meetings = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["meetings", "space", spaceId],
    queryFn: spaceController.meetings(spaceId),
  });

  if (loading) {
    return <MeetingListSkeleton />;
  }

  if (error) {
    return <NetworkError />;
  }

  return <MeetingsList meetings={meetings} title={`${title} Meetings`} />;
}
