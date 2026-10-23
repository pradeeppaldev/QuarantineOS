import React from "react";
import { cn } from "../../lib/utils";

export const Button = React.forwardRef(
  (
    {
      className,
      variant = "primary",
      size = "md",
      disabled = false,
      children,
      type = "button",
      icon: Icon,
      iconRight: IconRight,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 select-none disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500";

    const variants = {
      primary:
        "bg-cyan-500 hover:bg-cyan-600 text-navy-950 font-semibold shadow-sm active:translate-y-[0.5px]",
      secondary:
        "bg-secondary hover:bg-slate-200 dark:hover:bg-slate-800 text-foreground border border-border/80 shadow-subtle",
      outline:
        "border border-border bg-transparent hover:bg-secondary/60 text-foreground",
      ghost:
        "bg-transparent hover:bg-secondary/80 text-foreground",
      destructive:
        "bg-rose-600 hover:bg-rose-700 text-white shadow-sm",
      navy:
        "bg-navy text-white hover:bg-navy-700 shadow-sm",
    };

    const sizes = {
      sm: "text-xs px-2.5 py-1.5 rounded-lg gap-1.5",
      md: "text-sm px-3.5 py-2 rounded-xl gap-2",
      lg: "text-base px-5 py-2.5 rounded-xl gap-2.5",
      icon: "h-9 w-9 rounded-xl p-0",
      iconSm: "h-8 w-8 rounded-lg p-0",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {Icon && <Icon className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />}
        {children}
        {IconRight && <IconRight className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />}
      </button>
    );
  }
);

Button.displayName = "Button";
