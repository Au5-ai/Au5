import React from "react";
import { Button } from "@/components/ui/button";
import { FileX, Plus, Search, Database } from "lucide-react";
import {
  EmptyDatabaseProps,
  NoRecordsStateProps,
  NoRecordVariantType,
  NoSearchResultsProps,
} from "@/type/empty-state";

export default function NoRecordsState({
  title = "No records found",
  description = "Get started by creating your first record",
  icon: Icon = FileX,
  actionLabel = "Create Record",
  onAction,
  showAction = true,
  variant = "default",
}: NoRecordsStateProps) {
  const variants: Record<
    NoRecordVariantType,
    {
      iconBg: string;
      iconColor: string;
      titleColor: string;
      descriptionColor: string;
    }
  > = {
    default: {
      iconBg: "bg-gray-100",
      iconColor: "text-gray-400",
      titleColor: "text-gray-900",
      descriptionColor: "text-gray-500",
    },
    search: {
      iconBg: "bg-blue-50",
      iconColor: "text-blue-400",
      titleColor: "text-gray-900",
      descriptionColor: "text-gray-500",
    },
    database: {
      iconBg: "bg-purple-50",
      iconColor: "text-purple-400",
      titleColor: "text-gray-900",
      descriptionColor: "text-gray-500",
    },
  };

  const currentVariant = variants[variant];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className={`
              w-20 h-20 rounded-2xl ${currentVariant.iconBg} 
              flex items-center justify-center mb-6
              ring-1 ring-gray-100/50
            `}
      >
        <Icon className={`w-10 h-10 ${currentVariant.iconColor}`} />
      </div>

      <div className="max-w-sm mx-auto space-y-3">
        <h3
          className={`text-xl font-semibold tracking-tight ${currentVariant.titleColor}`}
        >
          {title}
        </h3>
        <p
          className={`text-sm leading-relaxed ${currentVariant.descriptionColor}`}
        >
          {description}
        </p>
      </div>

      {showAction && onAction && (
        <div className="mt-8">
          <Button
            onClick={onAction}
            className="
                  bg-gray-900 hover:bg-gray-800 text-white
                  px-6 py-2.5 rounded-lg font-medium
                  transform transition-all duration-200
                  hover:scale-105 hover:shadow-lg
                  focus:ring-2 focus:ring-gray-900/20
                "
          >
            <Plus className="w-4 h-4 mr-2" />
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

// Pre-configured variants for common use cases
export function NoSearchResults({ onClear }: NoSearchResultsProps) {
  return (
    <NoRecordsState
      icon={Search}
      title="No results found"
      description={`We couldn't find anything matching. Try adjusting your search terms.`}
      actionLabel="Clear Search"
      onAction={onClear}
      variant="search"
    />
  );
}

export function EmptyDatabase({
  onAction,
  actionLabel = "Add First Record",
}: EmptyDatabaseProps) {
  return (
    <NoRecordsState
      icon={Database}
      title="Your database is empty"
      description="Start building your collection by adding your first record."
      actionLabel={actionLabel}
      onAction={onAction}
      variant="database"
    />
  );
}
