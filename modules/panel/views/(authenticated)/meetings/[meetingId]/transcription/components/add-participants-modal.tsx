"use client";

import React, { useState } from "react";
import { Search, UserPlus, X, Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import { getColorFromName } from "@/shared/lib";
import { userController } from "@/shared/network/api/userController";
import { Participant, User } from "@/shared/types";
import { toast } from "sonner";
import { meetingsController } from "@/shared/network/api/meetingsController";

interface AddParticipantsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingId: string;
  existingParticipantIds: string[];
  onParticipantsAdded: (participants: Participant[]) => void;
}

export default function AddParticipantsModal({
  open,
  onOpenChange,
  meetingId,
  existingParticipantIds,
  onParticipantsAdded,
}: AddParticipantsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setUsers([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await userController.find(query);

      if (response) {
        const filteredUsers = response.filter(
          (user) =>
            !existingParticipantIds.includes(user.id) &&
            !selectedUsers.some((u) => u.id === user.id),
        );
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error("Failed to search users:", error);
      toast.error("Failed to search users");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUsers([...selectedUsers, user]);
    const remainingUsers = users.filter((u) => u.id !== user.id);
    setUsers(remainingUsers);

    if (remainingUsers.length === 0) {
      setSearchQuery("");
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedUsers.length === 0) return;

    setIsSubmitting(true);
    try {
      const result = await meetingsController.addParticipants(
        meetingId,
        selectedUsers.map((u) => u.id),
      );

      toast.success(GLOBAL_CAPTIONS.participants.participantsAdded);
      setSelectedUsers([]);
      setSearchQuery("");
      setUsers([]);
      onParticipantsAdded(result);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to add participants:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelectedUsers([]);
    setSearchQuery("");
    setUsers([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-gray-600" />
            </div>
            {GLOBAL_CAPTIONS.participants.addParticipants}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Search and select users to add to this meeting
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Search Users
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={GLOBAL_CAPTIONS.participants.searchUsers}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {isSearching && (
              <div className="text-center py-8 text-sm text-gray-500">
                {GLOBAL_CAPTIONS.loading}
              </div>
            )}

            {!isSearching && users.length > 0 && (
              <div className="max-h-[200px] overflow-y-auto space-y-2 mt-2">
                {users.map((user) => {
                  const fallbackColor = getColorFromName(user.fullName);

                  return (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.pictureUrl}
                          alt={user.fullName}
                        />
                        <AvatarFallback
                          className="text-white text-sm"
                          style={{ backgroundColor: fallbackColor }}>
                          {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!isSearching &&
              users.length === 0 &&
              searchQuery.trim().length >= 2 && (
                <div className="text-center py-8 text-sm text-gray-500">
                  {GLOBAL_CAPTIONS.participants.noUsersFound}
                </div>
              )}
          </div>

          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Selected Participants ({selectedUsers.length})
              </Label>
              <div className="max-h-[400px] overflow-y-auto space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200 pr-1">
                {selectedUsers.map((user) => {
                  const fallbackColor = getColorFromName(user.fullName);
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.pictureUrl}
                            alt={user.fullName}
                          />
                          <AvatarFallback
                            className="text-white text-sm"
                            style={{ backgroundColor: fallbackColor }}>
                            {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUser(user.id)}
                        className="h-8 w-8 p-0 hover:bg-gray-200">
                        <X className="w-4 h-4 text-gray-500" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="border-gray-200">
              {GLOBAL_CAPTIONS.actions.cancel}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || selectedUsers.length === 0}
              className="bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-950 shadow-sm">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {GLOBAL_CAPTIONS.participants.addingParticipants}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {GLOBAL_CAPTIONS.actions.addSelected}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
