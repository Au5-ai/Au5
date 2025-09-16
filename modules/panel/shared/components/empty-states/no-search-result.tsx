import { NoSearchResultsProps } from "@/shared/types/empty-state";
import NoRecordsState from "./no-record";
import { Search } from "lucide-react";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";

export function NoSearchResults({ onClear }: NoSearchResultsProps) {
  return (
    <NoRecordsState
      icon={Search}
      title={GLOBAL_CAPTIONS.emptyState.search.noResults.title}
      description={GLOBAL_CAPTIONS.emptyState.search.noResults.description}
      actionLabel={GLOBAL_CAPTIONS.emptyState.search.noResults.action}
      onAction={onClear}
      variant="search"
    />
  );
}
