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
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { Frame, Loader2, Plus, X } from "lucide-react";
import UserSearchInput from "./searchInput";
import { CreateSpaceCommand } from "@/shared/types/space";
import { User } from "@/shared/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui";

interface AddSpaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSpaceAdded: (command: CreateSpaceCommand) => Promise<void>;
}

interface AssignedUser extends User {
  isAdmin: boolean;
}

interface SpaceFormState {
  name: string;
  description: string;
  assignedUsers: AssignedUser[];
}

const INITIAL_FORM_STATE: SpaceFormState = {
  name: "",
  description: "",
  assignedUsers: [],
};

export default function AddSpaceModal({
  open,
  onOpenChange,
  onSpaceAdded,
}: AddSpaceModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SpaceFormState>(INITIAL_FORM_STATE);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);
    const command: CreateSpaceCommand = {
      name: formData.name,
      description: formData.description,
      users: formData.assignedUsers.map((user) => ({
        userId: user.id,
        isAdmin: user.isAdmin,
      })),
    };
    await onSpaceAdded(command);
    setIsSubmitting(false);

    setFormData(INITIAL_FORM_STATE);
  };

  const handleCancel = () => {
    setFormData(INITIAL_FORM_STATE);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Frame className="w-5 h-5 text-gray-600" />
            </div>
            Create New Space
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Add a new space and assign users to it
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Space Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Marketing Team Space"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className=" border-gray-200 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Assign Users
            </Label>
            <UserSearchInput
              selectedUsers={formData.assignedUsers}
              onUsersChange={(users) => {
                const updatedUsers = users.map((user) => {
                  const existing = formData.assignedUsers.find(
                    (u) => u.id === user.id,
                  );
                  return existing ? existing : { ...user, isAdmin: false };
                });
                setFormData({ ...formData, assignedUsers: updatedUsers });
              }}
            />

            {formData.assignedUsers.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.assignedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={user.pictureUrl}
                          alt={user.fullName}
                        />
                        <AvatarFallback className="rounded-lg">
                          {user.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
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
                            setFormData({
                              ...formData,
                              assignedUsers: formData.assignedUsers.map((u) =>
                                u.id === user.id
                                  ? { ...u, isAdmin: checked }
                                  : u,
                              ),
                            });
                          }}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            assignedUsers: formData.assignedUsers.filter(
                              (u) => u.id !== user.id,
                            ),
                          });
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
              disabled={isSubmitting || !formData.name.trim()}
              className="bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-950 shadow-sm">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Space
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
