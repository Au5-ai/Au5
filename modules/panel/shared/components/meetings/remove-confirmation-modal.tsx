import { ConfirmationModal } from "@/shared/components/confirmation-modal";
import { Trash2Icon } from "lucide-react";

interface RemoveConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function RemoveConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: RemoveConfirmationModalProps) {
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <ConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      title="Remove Meeting"
      description="Are you sure you want to remove this meeting? This action cannot be undone."
      confirmText="Remove Meeting"
      cancelText="Cancel"
      onConfirm={onConfirm}
      onCancel={handleCancel}
      isLoading={isLoading}
      variant="warning"
      icon={<Trash2Icon className="w-5 h-5 text-orange-600" />}
    />
  );
}
