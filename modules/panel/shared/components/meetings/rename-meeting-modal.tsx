"use client";

import * as React from "react";
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
import { Pen } from "lucide-react";

interface RenameMeetingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onConfirm: (newName: string) => void;
  isLoading?: boolean;
}

export function RenameMeetingModal({
  open,
  onOpenChange,
  currentName,
  onConfirm,
  isLoading = false,
}: RenameMeetingModalProps) {
  const [newName, setNewName] = React.useState(currentName);

  React.useEffect(() => {
    if (open) {
      setNewName(currentName);
    }
  }, [open, currentName]);

  const handleConfirm = () => {
    if (newName.trim() && newName !== currentName) {
      onConfirm(newName.trim());
    }
  };

  const handleCancel = () => {
    setNewName(currentName);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newName.trim() && newName !== currentName) {
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-left">
          <div className="flex items-center items-start gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
              <Pen className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Rename Meeting
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm text-gray-600">
                Enter a new name for this meeting. The name will be updated
                immediately.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-2 py-4">
          <Label htmlFor="meetingName" className="text-sm font-medium">
            Meeting Name
          </Label>
          <Input
            id="meetingName"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter meeting name"
            disabled={isLoading}
            autoFocus
            className="w-full"
          />
        </div>

        <DialogFooter className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !newName.trim() || newName === currentName}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white">
            {isLoading ? "Renaming..." : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
