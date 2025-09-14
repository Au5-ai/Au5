import { LucideIcon } from "lucide-react";

export type ErrorVariantType = "default" | "network" | "server" | "bug";

export type NoRecordVariantType = "default" | "search" | "database";

export interface NoRecordsStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  showAction?: boolean;
  variant?: NoRecordVariantType;
}

export interface ErrorStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  showActions?: boolean;
  variant?: ErrorVariantType;
}
export interface NetworkErrorProps {
  onRetry?: () => void;
  onGoHome?: () => void;
}

export interface ServerErrorProps {
  onRetry?: () => void;
  onGoHome?: () => void;
}
export interface UnexpectedErrorProps {
  onRetry?: () => void;
  onGoHome?: () => void;
  errorId?: string;
}

export interface NoSearchResultsProps {
  query?: string;
  onClear?: () => void;
}

export interface EmptyDatabaseProps {
  onAction?: () => void;
  actionLabel?: string;
}
