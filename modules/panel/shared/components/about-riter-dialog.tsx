"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface AboutRiterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutRiterDialog({
  open,
  onOpenChange,
}: AboutRiterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>About Riter</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4 pt-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Version</p>
                <p className="text-sm text-muted-foreground">1.9.8</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Source Code
                </p>
                <a
                  href="https://github.com/Au5-ai/Au5"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary hover:underline">
                  github.com/Au5-ai/Au5
                </a>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">License</p>
                <p className="text-sm text-muted-foreground">MIT License</p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
