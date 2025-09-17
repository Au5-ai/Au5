import { EmptyDatabaseProps } from "@/shared/types/empty-state";
import NoRecordsState from "./no-record";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import { Database } from "lucide-react";

export function EmptyDatabase({
  onAction,
  actionLabel = GLOBAL_CAPTIONS.emptyState.database.empty.action,
}: EmptyDatabaseProps) {
  return (
    <NoRecordsState
      icon={Database}
      title={GLOBAL_CAPTIONS.emptyState.database.empty.title}
      description={GLOBAL_CAPTIONS.emptyState.database.empty.description}
      actionLabel={actionLabel}
      onAction={onAction}
      variant="database"
    />
  );
}
