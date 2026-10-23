import React from "react";
import { cn } from "../../lib/utils";

export function PageHeader({
  title,
  description,
  badge,
  actions,
  breadcrumbs,
  className,
}) {
  return (
    <header className={cn("space-y-3 pb-6 border-b border-border/60", className)}>
      {breadcrumbs && (
        <nav
          aria-label="Breadcrumb"
          className="flex items-center text-xs font-medium text-muted-foreground gap-1.5"
        >
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-400">/</span>}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-foreground font-semibold">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {/* Itim font used selectively for the main page hero heading */}
            <h1 className="text-2xl sm:text-3xl font-hero tracking-normal text-navy dark:text-slate-100 font-bold">
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground font-normal max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
