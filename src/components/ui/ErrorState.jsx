import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../../lib/utils";

export function ErrorState({
  title = "Unable to load data",
  message = "An unexpected error occurred while communicating with the facility telemetry stream.",
  onRetry,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-10 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20",
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 stroke-[1.8]" />
      </div>
      <h3 className="text-base font-semibold text-rose-900 dark:text-rose-200 mb-1">
        {title}
      </h3>
      <p className="text-sm text-rose-700/80 dark:text-rose-300/80 max-w-md mb-5">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          icon={RefreshCw}
          className="border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 hover:bg-rose-100/60"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
