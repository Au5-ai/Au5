"use client";

import React, { useState, useEffect } from "react";
import { userApi } from "@/lib/api/user";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import StatsCards from "@/components/users/statsCards";
import UserGrid from "@/components/users/userGrids";
import InviteModal from "@/components/users/inviteModal";
import EditModal from "@/components/users/editModal";
import BreadcrumbLayout from "@/components/breadcrumb-layout";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { UserList } from "@/type";

export default function UsersManagemnetPage() {
  const [users, setUsers] = useState<UserList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    setSelectedUser(null);
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await userApi.fetchUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error loading users:", error);
    }
    setIsLoading(false);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleSaveUser = async (userData: UserList) => {
    try {
      await userApi.editUser(userData.id, userData);
      setShowEditModal(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleToggleUserStatus = async (user: UserList) => {
    try {
      await userApi.toggleUserStatus(user.id, !user.isValid);
      await loadUsers();
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
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
            <h1 className="text-2xl font-bold mb-1">User Management</h1>
            <p className="text-muted-foreground">
              Manage your team members and their access levels
            </p>
          </div>
          <div>
            <Button
              onClick={() => setShowInviteModal(true)}
              className="bg-black hover:bg-gray-800 text-white"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Invite Users
            </Button>
          </div>
        </div>
        <div className="min-h-screen w-full">
          <div className="max-w-7xl mx-auto">
            <StatsCards users={users} isLoading={isLoading} />
            <UserGrid
              users={users}
              isLoading={isLoading}
              onEditUser={handleEditUser}
              onToggleUserStatus={handleToggleUserStatus}
            />

            {/* Modals */}
            <InviteModal
              open={showInviteModal}
              onOpenChange={setShowInviteModal}
              onReloadData={loadUsers}
            />

            <EditModal
              user={selectedUser}
              open={showEditModal}
              onOpenChange={setShowEditModal}
              onSave={handleSaveUser}
            />
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
