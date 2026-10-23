import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { AppLayout } from "./components/layout/AppLayout";
import { LandingPage } from "./pages/LandingPage";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Patients } from "./pages/Patients";
import { TemperatureLogs } from "./pages/TemperatureLogs";
import { DoctorRounds } from "./pages/DoctorRounds";
import { Recovery } from "./pages/Recovery";
import { Discharges } from "./pages/Discharges";
import { Reports } from "./pages/Reports";
import { MyTasks } from "./pages/MyTasks";
import { Settings } from "./pages/Settings";

// Protect internal routes: redirect unauthenticated users to /login
function ProtectedRoute({ children }) {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Demo Login Entry Point */}
      <Route path="/login" element={<Login />} />

      {/* Protected Workspace Layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/temperature-logs" element={<TemperatureLogs />} />
        <Route path="/doctor-rounds" element={<DoctorRounds />} />
        <Route path="/recovery" element={<Recovery />} />
        <Route path="/discharges" element={<Discharges />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/my-tasks" element={<MyTasks />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
