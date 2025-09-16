import { EmptyDatabaseProps } from "@/shared/types/empty-state";
import NoRecordsState from "./no-record";
import { globalCaptions } from "@/shared/i18n/captions";
import { Database } from "lucide-react";

export function EmptyDatabase({
  onAction,
  actionLabel = globalCaptions.database.empty.action,
}: EmptyDatabaseProps) {
  return (
    <NoRecordsState
      icon={Database}
      title={globalCaptions.database.empty.title}
      description={globalCaptions.database.empty.description}
      actionLabel={actionLabel}
      onAction={onAction}
      variant="database"
    />
  );
}
