"use client";

import React, { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { Separator } from "@radix-ui/react-separator";
import { UserList } from "@/shared/types";
import { userApi } from "@/shared/network/api/user";
import { Button, SidebarInset, SidebarTrigger } from "@/shared/components/ui";
import BreadcrumbLayout from "@/shared/components/breadcrumb-layout";
import UserGrid from "@/views/(authenticated)/users/userGrids";
import StatsCards from "@/views/(authenticated)/users/statsCards";
import InviteModal from "@/views/(authenticated)/users/inviteModal";
import { USER_MANAGEMENT_CAPTIONS } from "./i18n";

export default function UsersManagemnetPage() {
  const [users, setUsers] = useState<UserList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await userApi.fetchUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error(USER_MANAGEMENT_CAPTIONS.errorLoadingUsers, error);
    }
    setIsLoading(false);
  };

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <BreadcrumbLayout />
        </div>
        <div className="ml-auto px-4">
          {/* Render a component passed from children via a prop */}
        </div>
      </header>
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
    </SidebarInset>
  );
}
