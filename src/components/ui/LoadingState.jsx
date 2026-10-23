import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export function LoadingState({
  message = "Loading operational data...",
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 space-y-3 rounded-2xl bg-card border border-border/60",
        className
      )}
    >
      <Loader2 className="w-7 h-7 text-cyan-500 animate-spin" />
      <p className="text-sm text-muted-foreground font-medium">{message}</p>
    </div>
  );
}
