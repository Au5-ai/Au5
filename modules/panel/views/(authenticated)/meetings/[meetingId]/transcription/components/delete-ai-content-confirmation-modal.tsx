"use client";

import * as React from "react";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface DeleteAIContentConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteAIContentConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: DeleteAIContentConfirmationModalProps) {
  const [confirmText, setConfirmText] = React.useState("");

  const handleCancel = () => {
    setConfirmText("");
    onOpenChange(false);
  };

  const handleConfirm = () => {
    if (confirmText.toLowerCase() === "delete") {
      onConfirm();
      setConfirmText("");
    }
  };

  const isConfirmDisabled = confirmText.toLowerCase() !== "delete";

  React.useEffect(() => {
    if (!open) {
      setConfirmText("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-left">
          <div className="flex items-center items-start gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100">
              <Trash2Icon className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Delete AI Content
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm text-gray-600">
                This action cannot be undone. This will permanently delete the
                AI content from your meeting.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="confirm-delete" className="text-sm font-medium">
            Type <span className="font-bold text-red-600">delete</span> to
            confirm
          </Label>
          <Input
            id="confirm-delete"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="delete"
            className="mt-2"
            autoComplete="off"
          />
        </div>

        <DialogFooter className="flex gap-3 pt-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isConfirmDisabled || isLoading}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white">
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
