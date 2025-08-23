import React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Wifi,
  Server,
  Bug,
} from "lucide-react";
import {
  ErrorStateProps,
  ErrorVariantType,
  NetworkErrorProps,
  ServerErrorProps,
  UnexpectedErrorProps,
} from "@/type/empty-state";

export default function ErrorState({
  title = "Something went wrong",
  description = "We encountered an unexpected error. Please try again.",
  icon: Icon = AlertTriangle,
  actionLabel = "Try Again",
  onAction,
  secondaryActionLabel = "Go Home",
  onSecondaryAction,
  showActions = true,
  variant = "default",
}: ErrorStateProps) {
  const variants: Record<
    ErrorVariantType,
    {
      iconBg: string;
      iconColor: string;
      titleColor: string;
      descriptionColor: string;
      primaryButton: string;
    }
  > = {
    default: {
      iconBg: "bg-red-50",
      iconColor: "text-red-400",
      titleColor: "text-gray-900",
      descriptionColor: "text-gray-600",
      primaryButton: "bg-red-600 hover:bg-red-700",
    },
    network: {
      iconBg: "bg-orange-50",
      iconColor: "text-orange-400",
      titleColor: "text-gray-900",
      descriptionColor: "text-gray-600",
      primaryButton: "bg-orange-600 hover:bg-orange-700",
    },
    server: {
      iconBg: "bg-purple-50",
      iconColor: "text-purple-400",
      titleColor: "text-gray-900",
      descriptionColor: "text-gray-600",
      primaryButton: "bg-purple-600 hover:bg-purple-700",
    },
    bug: {
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-500",
      titleColor: "text-gray-900",
      descriptionColor: "text-gray-600",
      primaryButton: "bg-yellow-600 hover:bg-yellow-700",
    },
  };

  const currentVariant = variants[variant];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className={`
              w-20 h-20 rounded-2xl ${currentVariant.iconBg} 
              flex items-center justify-center mb-6
              ring-1 ring-red-100/50
            `}
      >
        <Icon className={`w-10 h-10 ${currentVariant.iconColor}`} />
      </div>

      <div className="max-w-md mx-auto space-y-3">
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

      {showActions && (
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          {onAction && (
            <Button
              onClick={onAction}
              className={`
                    ${currentVariant.primaryButton} text-white
                    px-6 py-2.5 rounded-lg font-medium
                    transform transition-all duration-200
                    hover:scale-105 hover:shadow-lg
                    focus:ring-2 focus:ring-red-500/20
                  `}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {actionLabel}
            </Button>
          )}

          {onSecondaryAction && (
            <Button
              onClick={onSecondaryAction}
              variant="outline"
              className="
                    border-gray-200 hover:bg-gray-50
                    px-6 py-2.5 rounded-lg font-medium
                    transform transition-all duration-200
                    hover:scale-105
                  "
            >
              <Home className="w-4 h-4 mr-2" />
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function NetworkError({ onRetry, onGoHome }: NetworkErrorProps) {
  return (
    <ErrorState
      icon={Wifi}
      title="Connection Problem"
      description="Please check your internet connection and try again. If the problem persists, contact support."
      actionLabel="Retry"
      onAction={onRetry}
      onSecondaryAction={onGoHome}
      variant="network"
    />
  );
}

export function ServerError({ onRetry, onGoHome }: ServerErrorProps) {
  return (
    <ErrorState
      icon={Server}
      title="Server Error"
      description="Our servers are experiencing some issues. We're working to fix this as quickly as possible."
      actionLabel="Reload Page"
      onAction={onRetry}
      onSecondaryAction={onGoHome}
      variant="server"
    />
  );
}

export function UnexpectedError({
  onRetry,
  onGoHome,
  errorId,
}: UnexpectedErrorProps) {
  return (
    <ErrorState
      icon={Bug}
      title="Unexpected Error"
      description={`Something unexpected happened. ${
        errorId
          ? `Error ID: ${errorId}`
          : "Please try again or contact support if the problem persists."
      }`}
      actionLabel="Try Again"
      onAction={onRetry}
      onSecondaryAction={onGoHome}
      variant="bug"
    />
  );
}
