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
import { AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  variant?: "default" | "destructive" | "warning";
  icon?: React.ReactNode;
}

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isLoading = false,
  variant = "default",
  icon,
}: ConfirmationModalProps) {
  const variantStyles = {
    default: {
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    destructive: {
      iconColor: "text-red-600",
      iconBg: "bg-red-100",
      confirmButton: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100",
      confirmButton: "bg-orange-600 hover:bg-orange-700 text-white",
    },
  };

  const styles = variantStyles[variant];

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-left">
          <div className="flex items-center items-start gap-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${styles.iconBg}`}>
              {icon || (
                <AlertTriangle className={`w-5 h-5 ${styles.iconColor}`} />
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {title}
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm text-gray-600">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="flex gap-3 pt-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 sm:flex-none">
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 sm:flex-none ${styles.confirmButton}`}>
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
