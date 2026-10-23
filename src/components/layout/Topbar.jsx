import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Sun,
  Moon,
  Menu,
  CheckCheck,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  Info,
  LogOut,
  User,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";

const routeTitleMap = {
  "/dashboard": { title: "Facility Overview", category: "Workspace" },
  "/patients": { title: "Patient Registry & Management", category: "Clinical Operations" },
  "/temperature-logs": { title: "Temperature Screening Logs", category: "Clinical Operations" },
  "/doctor-rounds": { title: "Attending Doctor Rounds", category: "Clinical Operations" },
  "/recovery": { title: "Recovery & Discharge Reviews", category: "Clinical Operations" },
  "/discharges": { title: "Discharges & Bed Allocations", category: "Facility Management" },
  "/reports": { title: "Outcomes & Audit Reports", category: "Insights" },
  "/my-tasks": { title: "Nurse Shift Tasks", category: "Nurse Workspace" },
  "/settings": { title: "Facility & Security Settings", category: "Administration" },
};

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentRouteMeta = routeTitleMap[location.pathname] || {
    title: "Care Operations",
    category: "Workspace",
  };

  const {
    theme,
    toggleTheme,
    currentUser,
    logout,
    notifications,
    unreadCount,
    markAllNotificationsAsRead,
    clearNotification,
    setMobileDrawerOpen,
  } = useApp();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const notifRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-border/80 bg-card/80 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile Menu Trigger + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="lg:hidden p-2 rounded-xl text-foreground hover:bg-secondary border border-border/60 transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
            <span>QuarantineOS</span>
            <span>/</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium truncate">
              {currentUser?.title} Workspace
            </span>
            <span>/</span>
            <span className="truncate">{currentRouteMeta.category}</span>
          </div>
          <span className="text-sm font-semibold text-navy dark:text-slate-100 font-sans truncate">
            {currentRouteMeta.title}
          </span>
        </div>
      </div>

      {/* Right Controls: Role Badge, Notifications, Theme Toggle, Logout */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Visible Active Role Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-secondary/80 dark:bg-card border border-border/80">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-xs font-semibold text-navy dark:text-slate-200">
            {currentUser?.title || "Staff"} Active
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            ({currentUser?.username})
          </span>
        </div>

        {/* Notification Control & Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            aria-label={`Notifications (${unreadCount} unread)`}
            className={cn(
              "relative p-2 rounded-xl border border-border/80 text-foreground hover:bg-secondary transition-all",
              notificationOpen && "bg-secondary ring-2 ring-cyan-500/30"
            )}
          >
            <Bell className="w-4 h-4 text-navy dark:text-slate-200" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-navy-950 shadow-sm animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-elevated z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="p-3.5 border-b border-border/70 flex items-center justify-between bg-secondary/40">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-navy dark:text-slate-100">
                    Operational Alerts
                  </h4>
                  {unreadCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 font-medium">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    No active notifications.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        "p-3.5 hover:bg-secondary/50 transition-colors flex items-start gap-3 text-left",
                        !notif.read && "bg-cyan-500/5 dark:bg-cyan-500/10"
                      )}
                    >
                      <div className="mt-0.5 shrink-0">
                        {notif.type === "warning" || notif.type === "critical" ? (
                          <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                        ) : notif.type === "success" ? (
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                            <Info className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-navy dark:text-slate-100 truncate">
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notif.description}
                        </p>
                      </div>

                      <button
                        onClick={() => clearNotification(notif.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors"
                        title="Dismiss notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          className="p-2 rounded-xl border border-border/80 text-foreground hover:bg-secondary transition-all"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-navy" />
          )}
        </button>

        {/* Logout Action Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleLogout}
          icon={LogOut}
          className="text-xs text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40"
        >
          <span className="hidden md:inline">Log out</span>
        </Button>
      </div>
    </header>
  );
}
