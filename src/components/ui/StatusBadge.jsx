import React from "react";
import { cn } from "../../lib/utils";

const statusConfig = {
  // Clinical statuses
  Pending: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-800 dark:text-amber-300",
    border: "border-amber-200/80 dark:border-amber-800/40",
    dot: "bg-amber-500",
  },
  "In Progress": {
    bg: "bg-cyan-50 dark:bg-cyan-950/40",
    text: "text-cyan-800 dark:text-cyan-300",
    border: "border-cyan-200/80 dark:border-cyan-800/40",
    dot: "bg-cyan-500 animate-pulse",
  },
  Scheduled: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-800 dark:text-blue-300",
    border: "border-blue-200/80 dark:border-blue-800/40",
    dot: "bg-blue-500",
  },
  Completed: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-800 dark:text-emerald-300",
    border: "border-emerald-200/80 dark:border-emerald-800/40",
    dot: "bg-emerald-500",
  },
  Overdue: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-800 dark:text-rose-300",
    border: "border-rose-200/80 dark:border-rose-800/40",
    dot: "bg-rose-500",
  },

  // Priority
  High: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800/50",
    dot: "bg-rose-500",
  },
  Medium: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800/50",
    dot: "bg-amber-500",
  },
  Low: {
    bg: "bg-slate-100 dark:bg-slate-800/60",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700/60",
    dot: "bg-slate-400",
  },
  Critical: {
    bg: "bg-red-100 dark:bg-red-950/60",
    text: "text-red-800 dark:text-red-200 font-semibold",
    border: "border-red-300 dark:border-red-800",
    dot: "bg-red-600 animate-ping",
  },

  // Operational
  Operational: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/25",
    dot: "bg-emerald-500",
  },
  "At Capacity": {
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/25",
    dot: "bg-amber-500",
  },
};

export function StatusBadge({ status, size = "md", showDot = true, className }) {
  const config = statusConfig[status] || {
    bg: "bg-secondary",
    text: "text-foreground",
    border: "border-border",
    dot: "bg-slate-400",
  };

  const sizes = {
    sm: "text-[11px] px-2 py-0.5 rounded-md",
    md: "text-xs px-2.5 py-1 rounded-lg",
    lg: "text-sm px-3 py-1.5 rounded-lg",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border transition-colors",
        sizes[size],
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {showDot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dot)}
          aria-hidden="true"
        />
      )}
      <span>{status}</span>
    </span>
  );
}
