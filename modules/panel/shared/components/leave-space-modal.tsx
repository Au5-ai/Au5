import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { Button } from "./ui";

interface LeaveSpaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  spaceName: string;
  isLoading?: boolean;
}

export default function LeaveSpaceModal({
  open,
  onOpenChange,
  onConfirm,
  spaceName,
  isLoading = false,
}: LeaveSpaceModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <DialogTitle>Leave Space</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Are you sure you want to leave{" "}
            <span className="font-semibold text-gray-900">{spaceName}</span>?
            You will no longer have access to this space and its meetings.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700">
            {isLoading ? "Leaving..." : "Leave Space"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
