import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Loader2, Plus, UserPlus, X } from "lucide-react";
import UserSearchInput from "./searchInput";
import { User } from "@/shared/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui";
import { SpaceMember } from "@/shared/types/space";

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMembersAdded: (
    users: { userId: string; isAdmin: boolean }[],
  ) => Promise<void>;
  currentMembers?: SpaceMember[];
}

interface AssignedUser extends User {
  isAdmin: boolean;
}

export default function AddMemberModal({
  open,
  onOpenChange,
  onMembersAdded,
  currentMembers = [],
}: AddMemberModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>([]);

  const admins = currentMembers.filter((m) => m.isAdmin);
  const regularMembers = currentMembers.filter((m) => !m.isAdmin);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (assignedUsers.length === 0) {
      return;
    }

    setIsSubmitting(true);
    const users = assignedUsers.map((user) => ({
      userId: user.id,
      isAdmin: user.isAdmin,
    }));
    await onMembersAdded(users);
    setIsSubmitting(false);

    setAssignedUsers([]);
  };

  const handleCancel = () => {
    setAssignedUsers([]);
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
            Add Members to Space
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Select users to add to this space
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Select Users
            </Label>
            <UserSearchInput
              selectedUsers={assignedUsers}
              onUsersChange={(users) => {
                const updatedUsers = users.map((user) => {
                  const existing = assignedUsers.find((u) => u.id === user.id);
                  return existing ? existing : { ...user, isAdmin: false };
                });
                setAssignedUsers(updatedUsers);
              }}
            />

            {assignedUsers.length > 0 && (
              <div className="mt-3 max-h-[400px] overflow-y-auto space-y-4 pr-1">
                {assignedUsers.filter((u) => u.isAdmin).length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide px-1">
                      Space Admins (
                      {assignedUsers.filter((u) => u.isAdmin).length})
                    </h3>
                    {assignedUsers
                      .filter((user) => user.isAdmin)
                      .map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3 flex-1">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={user.pictureUrl}
                                alt={user.fullName}
                              />
                              <AvatarFallback>
                                {user.fullName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {user.fullName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Label
                                htmlFor={`admin-${user.id}`}
                                className="text-sm text-gray-700 cursor-pointer">
                                Admin
                              </Label>
                              <Switch
                                id={`admin-${user.id}`}
                                checked={user.isAdmin}
                                onCheckedChange={(checked) => {
                                  setAssignedUsers(
                                    assignedUsers.map((u) =>
                                      u.id === user.id
                                        ? { ...u, isAdmin: checked }
                                        : u,
                                    ),
                                  );
                                }}
                              />
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setAssignedUsers(
                                  assignedUsers.filter((u) => u.id !== user.id),
                                );
                              }}
                              className="h-8 w-8 p-0 hover:bg-gray-200">
                              <X className="w-4 h-4 text-gray-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {assignedUsers.filter((u) => !u.isAdmin).length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide px-1">
                      Space Members (
                      {assignedUsers.filter((u) => !u.isAdmin).length})
                    </h3>
                    {assignedUsers
                      .filter((user) => !user.isAdmin)
                      .map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3 flex-1">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={user.pictureUrl}
                                alt={user.fullName}
                              />
                              <AvatarFallback>
                                {user.fullName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {user.fullName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Label
                                htmlFor={`admin-${user.id}`}
                                className="text-sm text-gray-700 cursor-pointer">
                                Admin
                              </Label>
                              <Switch
                                id={`admin-${user.id}`}
                                checked={user.isAdmin}
                                onCheckedChange={(checked) => {
                                  setAssignedUsers(
                                    assignedUsers.map((u) =>
                                      u.id === user.id
                                        ? { ...u, isAdmin: checked }
                                        : u,
                                    ),
                                  );
                                }}
                              />
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setAssignedUsers(
                                  assignedUsers.filter((u) => u.id !== user.id),
                                );
                              }}
                              className="h-8 w-8 p-0 hover:bg-gray-200">
                              <X className="w-4 h-4 text-gray-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {currentMembers.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Current Members ({currentMembers.length})
              </Label>
              <div className="max-h-[300px] overflow-y-auto space-y-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                {admins.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-600 tracking-wide px-1">
                      Space Admins ({admins.length})
                    </h3>
                    {admins.map((member) => (
                      <div
                        key={member.userId}
                        className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={member.pictureUrl}
                            alt={member.fullName}
                          />
                          <AvatarFallback>
                            {member.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {member.fullName}
                            {member.isYou && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {regularMembers.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-600 tracking-wide px-1">
                      Space Members ({regularMembers.length})
                    </h3>
                    {regularMembers.map((member) => (
                      <div
                        key={member.userId}
                        className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={member.pictureUrl}
                            alt={member.fullName}
                          />
                          <AvatarFallback>
                            {member.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {member.fullName}
                            {member.isYou && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || assignedUsers.length === 0}
              className="bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-950 shadow-sm">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Members
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
