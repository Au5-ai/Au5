"use client";

import { useParams } from "next/navigation";
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

export default function SpaceMeetingsView() {
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
    } catch (error) {
      toast.error("Failed to add members");
    }
  };

  if (loading) {
    return <MeetingListSkeleton />;
  }

  if (error) {
    return <NetworkError />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="container px-6 py-4">
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
      <MeetingsList meetings={meetings} />

      <AddMemberModal
        open={isAddMemberModalOpen}
        onOpenChange={setIsAddMemberModalOpen}
        onMembersAdded={handleAddMembers}
      />
    </div>
  );
}
