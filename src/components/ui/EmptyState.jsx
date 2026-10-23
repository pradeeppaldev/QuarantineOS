import React from "react";
import { Inbox, FolderOpen } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../../lib/utils";

export function EmptyState({
  title = "No records found",
  description = "There are no entries currently recorded in this view.",
  actionLabel,
  onAction,
  icon: Icon = Inbox,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-border/80 bg-secondary/30 dark:bg-card/40",
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-secondary dark:bg-slate-800 flex items-center justify-center text-muted-foreground mb-4">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h3 className="text-base font-semibold text-navy dark:text-slate-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-5">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
