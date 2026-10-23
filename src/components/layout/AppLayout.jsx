import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useApp } from "../../context/AppContext";

export function AppLayout() {
  const { mobileDrawerOpen, setMobileDrawerOpen } = useApp();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:flex shrink-0 h-full">
        <Sidebar isMobile={false} />
      </div>

      {/* Mobile Drawer Backdrop and Sidebar */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            <Sidebar isMobile={true} />
          </div>
        </div>
      )}

      {/* Main Column */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Sticky Topbar */}
        <Topbar />

        {/* Scrollable Main Content Canvas */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#FDFEFE] dark:bg-[#0C121E] transition-colors"
        >
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
