"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MeetingListSkeleton } from "@/shared/components/meetings/meeting-list-skeleton";
import { NetworkError } from "@/shared/components/empty-states/error";
import { MeetingsList } from "@/shared/components/meetings";
import { useCurrentUserSpaces } from "@/shared/hooks/use-user";
import { spaceController } from "@/shared/network/api/spaceController";
import { GroupAvatar } from "@/shared/components/group-avatar";
import AddMemberModal from "../../components/addMemberModal";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui";
import Image from "next/image";
import { ROUTES } from "@/shared/routes";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";

export default function SpaceMeetingsView() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
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

  const { data: membersData } = useQuery({
    queryKey: ["space-members", spaceId],
    queryFn: spaceController.members(spaceId),
  });

  const currentUserIsAdmin =
    membersData?.users?.find((m) => m.isYou)?.isAdmin ?? false;

  const handleAddMembers = async (
    users: { userId: string; isAdmin: boolean }[],
  ) => {
    try {
      await spaceController.addMembers(spaceId, users);
      toast.success("Members added successfully");
      queryClient.invalidateQueries({ queryKey: ["space-members", spaceId] });
      setIsAddMemberModalOpen(false);
    } catch (error) {}
  };

  if (loading) {
    return <MeetingListSkeleton />;
  }

  if (error) {
    return <NetworkError />;
  }

  if (meetings.length === 0) {
    return (
      <div className="w-full  border-0 h-full flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="rounded-2xl flex items-center justify-center mb-6">
          <Image
            src="/assets/images/no-meeting-space.png"
            alt={GLOBAL_CAPTIONS.pages.spaceMeetings.empty.imageAlt}
            width={400}
            height={400}
            className="border-0"
          />
        </div>

        <div className="max-w-sm mx-auto space-y-3">
          <h3 className={`text-xl font-semibold tracking-tight`}>
            {GLOBAL_CAPTIONS.pages.spaceMeetings.empty.title}
          </h3>
          <p className={`text-sm leading-relaxed`}>
            {GLOBAL_CAPTIONS.pages.spaceMeetings.empty.description}
          </p>
        </div>

        <div className="mt-8">
          <Button
            variant="outline"
            onClick={() => {
              router.push(ROUTES.MEETINGS.My);
            }}>
            {GLOBAL_CAPTIONS.pages.spaceMeetings.empty.action}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold mb-1">{title} Meetings</h1>
          {membersData?.users && (
            <GroupAvatar
              members={membersData.users}
              showAddButton={currentUserIsAdmin}
              onAddClick={() => {
                setIsAddMemberModalOpen(true);
              }}
            />
          )}
        </div>
      </div>

      <MeetingsList allowArchive={false} meetings={meetings} />

      <AddMemberModal
        open={isAddMemberModalOpen}
        onOpenChange={setIsAddMemberModalOpen}
        onMembersAdded={handleAddMembers}
        currentMembers={membersData?.users || []}
      />
    </div>
  );
}
