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
import { Frame, Loader2, Plus } from "lucide-react";
import UserSearchInput from "./searchInput";
import { CreateSpaceCommand } from "@/shared/types/space";
import { User } from "@/shared/types";

interface AddSpaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSpaceAdded: (command: CreateSpaceCommand) => Promise<void>;
}

interface SpaceFormState {
  name: string;
  description: string;
  assignedUsers: User[];
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
        isAdmin: false,
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
            <Label
              htmlFor="description"
              className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose of this space..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className=" border-gray-200 focus:bg-white transition-colors resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Assign Users
            </Label>
            <UserSearchInput
              selectedUsers={formData.assignedUsers}
              onUsersChange={(users) =>
                setFormData({ ...formData, assignedUsers: users })
              }
            />
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
