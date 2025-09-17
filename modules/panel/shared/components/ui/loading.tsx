import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/shared/lib/utils";

const loadingVariants = cva("", {
  variants: {
    variant: {
      spinner: "flex items-center justify-center",
      dots: "flex items-center justify-center gap-1",
      pulse: "animate-pulse",
      inline: "inline-flex items-center gap-2",
    },
    size: {
      sm: "",
      md: "",
      lg: "",
      xl: "",
    },
  },
  compoundVariants: [
    // Spinner sizes
    {
      variant: "spinner",
      size: "sm",
      class: "w-4 h-4",
    },
    {
      variant: "spinner",
      size: "md",
      class: "w-6 h-6",
    },
    {
      variant: "spinner",
      size: "lg",
      class: "w-8 h-8",
    },
    {
      variant: "spinner",
      size: "xl",
      class: "w-12 h-12",
    },
    // Dots sizes
    {
      variant: "dots",
      size: "sm",
      class: "[&>div]:w-1 [&>div]:h-1",
    },
    {
      variant: "dots",
      size: "md",
      class: "[&>div]:w-1.5 [&>div]:h-1.5",
    },
    {
      variant: "dots",
      size: "lg",
      class: "[&>div]:w-2 [&>div]:h-2",
    },
    {
      variant: "dots",
      size: "xl",
      class: "[&>div]:w-3 [&>div]:h-3",
    },
  ],
  defaultVariants: {
    variant: "spinner",
    size: "md",
  },
});

export interface LoadingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  text?: string;
  color?: "primary" | "secondary" | "muted" | "destructive";
  centered?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

function Loading({
  className,
  variant,
  size,
  text,
  color = "primary",
  centered = false,
  icon: Icon,
  ...props
}: LoadingProps) {
  const colorClasses = {
    primary: "text-primary",
    secondary: "text-secondary",
    muted: "text-muted-foreground",
    destructive: "text-destructive",
  };

  const renderSpinner = () => {
    const spinnerClass = cn(
      "animate-spin",
      colorClasses[color],
      loadingVariants({ variant: "spinner", size }),
    );

    if (Icon) {
      return <Icon className={spinnerClass} />;
    }

    return <Loader2 className={spinnerClass} />;
  };

  const renderDots = () => {
    return (
      <div className={cn(loadingVariants({ variant: "dots", size }))}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full animate-pulse",
              colorClasses[color],
              "bg-current",
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: "1.4s",
            }}
          />
        ))}
      </div>
    );
  };

  const renderPulse = () => {
    return (
      <div
        className={cn(
          "rounded-md bg-current opacity-20",
          colorClasses[color],
          loadingVariants({ variant: "pulse" }),
          size === "sm" && "h-4",
          size === "md" && "h-6",
          size === "lg" && "h-8",
          size === "xl" && "h-12",
        )}
      />
    );
  };

  const renderLoadingIndicator = () => {
    switch (variant) {
      case "dots":
        return renderDots();
      case "pulse":
        return renderPulse();
      case "spinner":
      case "inline":
      default:
        return renderSpinner();
    }
  };

  const content = (
    <div
      data-slot="loading"
      className={cn(
        loadingVariants({ variant, size }),
        variant === "inline" && "text-sm",
        className,
      )}
      {...props}>
      {renderLoadingIndicator()}
      {text && (
        <span
          className={cn(
            "font-medium",
            colorClasses[color],
            variant === "inline" ? "ml-2" : "mt-2",
          )}>
          {text}
        </span>
      )}
    </div>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center min-h-32 w-full">
        <div className="text-center">{content}</div>
      </div>
    );
  }

  return content;
}

export { Loading, loadingVariants };
