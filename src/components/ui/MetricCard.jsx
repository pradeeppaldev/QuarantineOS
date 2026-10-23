import React from "react";
import { Users, Thermometer, Stethoscope, UserCheck, Activity, ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/utils";

const iconMap = {
  Users,
  Thermometer,
  Stethoscope,
  UserCheck,
  Activity,
};

export function MetricCard({
  label,
  value,
  unit,
  trend,
  trendDirection = "neutral",
  iconName = "Activity",
  badgeText,
  onClick,
  className,
}) {
  const IconComponent = iconMap[iconName] || Activity;

  const trendStyles = {
    neutral: "text-muted-foreground",
    warning: "text-amber-700 dark:text-amber-400 font-medium",
    success: "text-emerald-700 dark:text-emerald-400 font-medium",
    danger: "text-rose-700 dark:text-rose-400 font-medium",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative bg-card dark:bg-card border border-border/80 dark:border-border/60 rounded-2xl p-5 shadow-card hover:shadow-elevated hover:border-cyan-500/40 transition-all duration-200",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-bold font-sans tracking-tight text-navy dark:text-white">
              {value}
            </span>
            {unit && (
              <span className="text-xs text-muted-foreground font-normal">
                {unit}
              </span>
            )}
          </div>
        </div>

        <div className="w-10 h-10 rounded-xl bg-secondary dark:bg-slate-800/80 flex items-center justify-center text-navy dark:text-cyan-400 group-hover:bg-cyan-500/10 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors shrink-0">
          <IconComponent className="w-5 h-5 stroke-[1.8]" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
          <span className={cn("truncate", trendStyles[trendDirection])}>
            {trend}
          </span>
          {badgeText && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
