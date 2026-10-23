import React from "react";
import { cn } from "../../lib/utils";

export function SectionHeader({
  title,
  description,
  badge,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/70",
        className
      )}
    >
      <div className="space-y-0.5">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-semibold tracking-tight text-navy dark:text-slate-100 font-sans">
            {title}
          </h2>
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 font-medium border border-cyan-200 dark:border-cyan-800/40">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
