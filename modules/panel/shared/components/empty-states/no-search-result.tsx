import { NoSearchResultsProps } from "@/shared/types/empty-state";
import NoRecordsState from "./no-record";
import { Search } from "lucide-react";
import { globalCaptions } from "@/shared/i18n/captions";

export function NoSearchResults({ onClear }: NoSearchResultsProps) {
  return (
    <NoRecordsState
      icon={Search}
      title={globalCaptions.emptyState.search.noResults.title}
      description={globalCaptions.emptyState.search.noResults.description}
      actionLabel={globalCaptions.emptyState.search.noResults.action}
      onAction={onClear}
      variant="search"
    />
  );
}
