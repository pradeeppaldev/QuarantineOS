import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Thermometer,
  Stethoscope,
  Activity,
  BedDouble,
  FileBarChart2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Hospital,
  X,
  ListTodo,
  Settings,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { cn } from "../../lib/utils";

export function Sidebar({ isMobile = false }) {
  const navigate = useNavigate();
  const {
    currentUser,
    logout,
    metrics,
    sidebarCollapsed,
    setSidebarCollapsed,
    setMobileDrawerOpen,
  } = useApp();

  const handleLinkClick = () => {
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isCollapsed = !isMobile && sidebarCollapsed;
  const role = currentUser?.role || "nurse";

  // Navigation defined strictly per role workspace
  const navGroups = [];

  if (role === "nurse") {
    navGroups.push({
      label: "NURSE WORKSPACE",
      items: [
        { name: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
        { name: "Patients", to: "/patients", icon: Users, badge: `${metrics.activePatientsCount}` },
        { name: "Temperature Logs", to: "/temperature-logs", icon: Thermometer, badge: `${metrics.totalNeedTempChecks} Due` },
        { name: "My Tasks", to: "/my-tasks", icon: ListTodo, badge: "Ward B" },
      ],
    });
  } else if (role === "doctor") {
    navGroups.push({
      label: "DOCTOR WORKSPACE",
      items: [
        { name: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
        { name: "Patients", to: "/patients", icon: Users, badge: `${metrics.activePatientsCount}` },
        { name: "Doctor Rounds", to: "/doctor-rounds", icon: Stethoscope, badge: `${metrics.pendingDoctorVisits} Pending` },
        { name: "Recovery Reviews", to: "/recovery", icon: Activity, badge: `${metrics.dischargeReadyCount} Ready` },
        { name: "Discharges", to: "/discharges", icon: BedDouble },
      ],
    });
  } else {
    // Admin workspace
    navGroups.push({
      label: "ADMIN OPERATIONS",
      items: [
        { name: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
        { name: "Patients", to: "/patients", icon: Users, badge: `${metrics.activePatientsCount}` },
        { name: "Temperature Logs", to: "/temperature-logs", icon: Thermometer, badge: `${metrics.pendingTempChecks}` },
        { name: "Doctor Rounds", to: "/doctor-rounds", icon: Stethoscope, badge: `${metrics.pendingDoctorVisits}` },
        { name: "Recovery & Discharges", to: "/discharges", icon: BedDouble, badge: `${metrics.occupiedBeds}/${metrics.totalBeds}` },
        { name: "Reports", to: "/reports", icon: FileBarChart2 },
        { name: "Settings", to: "/settings", icon: Settings },
      ],
    });
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-[#1F2C49] dark:bg-[#0E1624] text-slate-200 border-r border-[#2A3B60] dark:border-[#1E293B] select-none transition-all duration-200 z-30",
        isMobile ? "w-72 shadow-2xl" : isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-[#2A3B60]/80 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center shrink-0 text-cyan-400 shadow-sm">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L4 5v6.5c0 5.2 3.6 9.8 8 11.5 4.4-1.7 8-6.3 8-11.5V5l-8-3z" />
              <path d="M12 8v8M8 12h8" />
            </svg>
          </div>

          {(!isCollapsed || isMobile) && (
            <div className="flex flex-col min-w-0">
              <span className="font-sans font-bold text-[15px] tracking-tight text-white truncate">
                QuarantineOS
              </span>
              <span className="text-[11px] font-medium text-cyan-400 uppercase tracking-wider">
                Care Operations
              </span>
            </div>
          )}
        </div>

        {isMobile && (
          <button
            onClick={() => setMobileDrawerOpen(false)}
            aria-label="Close navigation"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {!isMobile && (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-colors hidden lg:block"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {(!isCollapsed || isMobile) && (
              <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {group.label}
              </p>
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 relative",
                      isActive
                        ? "bg-cyan-500/15 text-cyan-300 font-semibold shadow-inner border border-cyan-500/30"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    )
                  }
                  title={isCollapsed ? item.name : undefined}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-cyan-400 rounded-r-full"
                          aria-hidden="true"
                        />
                      )}

                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0 transition-colors",
                          isActive
                            ? "text-cyan-400 stroke-[2.2]"
                            : "text-slate-400 group-hover:text-slate-200 stroke-[1.8]"
                        )}
                      />

                      {(!isCollapsed || isMobile) && (
                        <span className="truncate flex-1">{item.name}</span>
                      )}

                      {(!isCollapsed || isMobile) && item.badge && (
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-md font-semibold tracking-wide",
                            isActive
                              ? "bg-cyan-400/20 text-cyan-200 border border-cyan-400/30"
                              : "bg-white/10 text-slate-300"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Facility Status Indicator */}
      <div className="p-3 border-t border-[#2A3B60]/80 shrink-0">
        {(!isCollapsed || isMobile) ? (
          <div className="bg-[#172138] dark:bg-[#090E17] rounded-xl p-2.5 border border-[#2A3B60]/60 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <div className="truncate">
                <p className="text-[11px] font-semibold text-slate-200 truncate">
                  MQF Alpha • Ward A/B
                </p>
                <p className="text-[10px] text-emerald-400 font-medium">
                  {metrics.occupiedBeds}/{metrics.totalBeds} Beds ({Math.round((metrics.occupiedBeds/metrics.totalBeds)*100)}%)
                </p>
              </div>
            </div>
            <Hospital className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
        ) : (
          <div
            className="w-10 h-10 mx-auto rounded-xl bg-[#172138] dark:bg-[#090E17] border border-[#2A3B60]/60 flex items-center justify-center text-emerald-400"
            title={`Occupancy: ${metrics.occupiedBeds}/${metrics.totalBeds}`}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>
        )}
      </div>

      {/* User Profile & Logout Action */}
      <div className="px-3 py-3 border-t border-[#2A3B60]/80 bg-[#162035] dark:bg-[#080D15] shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser?.avatar || "OP"}
            </div>

            {(!isCollapsed || isMobile) && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">
                  {currentUser?.name || "Demo User"}
                </p>
                <p className="text-[10px] text-cyan-400 font-medium uppercase tracking-wide truncate">
                  {currentUser?.title || "Staff"} Workspace
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            title="Log out and return to login"
            aria-label="Log out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
