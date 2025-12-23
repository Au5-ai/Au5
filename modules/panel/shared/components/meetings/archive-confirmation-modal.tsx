import { ConfirmationModal } from "@/shared/components/confirmation-modal";
import { Archive, ArchiveRestore } from "lucide-react";

interface ArchiveConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isArchived: boolean;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ArchiveConfirmationModal({
  open,
  onOpenChange,
  isArchived,
  onConfirm,
  isLoading = false,
}: ArchiveConfirmationModalProps) {
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <ConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      title={isArchived ? "Remove from Archive" : "Move to Archive"}
      description={
        isArchived
          ? "This will move the meeting back to your active meetings list. You can archive it again at any time."
          : "This will move the meeting to your archived meetings. You can restore it at any time from the archived section."
      }
      confirmText={isArchived ? "Remove from Archive" : "Move to Archive"}
      cancelText="Cancel"
      onConfirm={onConfirm}
      onCancel={handleCancel}
      isLoading={isLoading}
      variant="warning"
      icon={
        isArchived ? (
          <ArchiveRestore className="w-5 h-5 text-orange-600" />
        ) : (
          <Archive className="w-5 h-5 text-orange-600" />
        )
      }
    />
  );
}
