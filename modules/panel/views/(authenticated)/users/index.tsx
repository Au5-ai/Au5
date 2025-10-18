"use client";

import React, { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { UserListItem } from "@/shared/types";
import { Button } from "@/shared/components/ui";
import UserGrid from "@/views/(authenticated)/users/components/userGrids";
import StatsCards from "@/views/(authenticated)/users/components/statsCards";
import InviteModal from "@/views/(authenticated)/users/components/inviteModal";
import { USER_MANAGEMENT_CAPTIONS } from "./i18n";
import { userController } from "./userController";

export default function UsersManagemnetPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await userController.fetchUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error(USER_MANAGEMENT_CAPTIONS.errorLoadingUsers, error);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-1 flex-col px-6 py-4">
      <div className="container mx-auto mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            {USER_MANAGEMENT_CAPTIONS.title}
          </h1>
          <p className="text-muted-foreground">
            {USER_MANAGEMENT_CAPTIONS.description}
          </p>
        </div>
        <div>
          <Button
            onClick={() => setShowInviteModal(true)}
            className="bg-black hover:bg-gray-800 text-white">
            <UserPlus className="w-5 h-5 mr-2" />
            {USER_MANAGEMENT_CAPTIONS.inviteUsers}
          </Button>
        </div>
      </div>
      <div className="min-h-screen w-full">
        <div className="max-w-7xl mx-auto">
          <StatsCards users={users} isLoading={isLoading} />
          <UserGrid users={users} isLoading={isLoading} />

          {/* Modals */}
          <InviteModal
            open={showInviteModal}
            onOpenChange={setShowInviteModal}
            onReloadData={loadUsers}
          />
        </div>
      </div>
    </div>
  );
}
