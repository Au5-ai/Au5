"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Frame } from "lucide-react";
import { Button } from "@/shared/components/ui";
import SpaceGrid from "./components/spaceGrid";
import AddSpaceModal from "./components/addModal";
import { spaceController } from "@/shared/network/api/spaceController";
import { CreateSpaceCommand } from "@/shared/types/space";
import { toast } from "sonner";

export default function SpaceManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: spaces, isLoading } = useQuery({
    queryKey: ["spaces"],
    queryFn: () => spaceController.getSpaces(),
    initialData: [],
  });

  const createSpaceMutation = useMutation({
    mutationFn: (spaceData: CreateSpaceCommand) =>
      spaceController.createSpace(spaceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      setIsModalOpen(false);
      toast.success("Space created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create space: ${error.message}`);
    },
  });

  const handleSpaceAdded = async (command: CreateSpaceCommand) => {
    await createSpaceMutation.mutateAsync(command);
  };

  const addMembersMutation = useMutation({
    mutationFn: ({
      spaceId,
      users,
    }: {
      spaceId: string;
      users: { userId: string; isAdmin: boolean }[];
    }) => spaceController.addMembers(spaceId, users),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      toast.success("Members added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add members: ${error.message}`);
    },
  });

  const handleMembersAdded = async (
    spaceId: string,
    users: { userId: string; isAdmin: boolean }[],
  ) => {
    await addMembersMutation.mutateAsync({ spaceId, users });
  };

  return (
    <div className="flex flex-1 flex-col px-6 py-4">
      <div className="container mx-auto mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Spaces</h1>
          <p className="text-muted-foreground">
            Create and manage your organization&apos;s spaces
          </p>
        </div>
        <div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-black hover:bg-gray-800 text-white">
            <Frame className="w-5 h-5 mr-2" />
            Add New Space
          </Button>
        </div>
      </div>
      <div className="w-full">
        <div className="max-w-7xl mx-auto">
          <SpaceGrid
            spaces={spaces}
            isLoading={isLoading}
            onMembersAdded={handleMembersAdded}
          />
          <AddSpaceModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            onSpaceAdded={handleSpaceAdded}
          />
        </div>
      </div>
    </div>
  );
}
