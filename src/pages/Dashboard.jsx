import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  Building2,
  AlertCircle,
  Filter,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Bed,
  RefreshCw,
  Info,
  Thermometer,
  Stethoscope,
  Users,
  Activity,
  Flame,
  UserCheck,
} from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { MetricCard } from "../components/ui/MetricCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Button } from "../components/ui/Button";
import { useApp } from "../context/AppContext";

export function Dashboard() {
  const navigate = useNavigate();
  const {
    currentUser,
    patients,
    activePatients,
    metrics,
    occupiedBedsCount,
    availableBedsCount,
    TOTAL_FACILITY_BEDS,
  } = useApp();

  const [filterPriority, setFilterPriority] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSimulateRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const role = currentUser?.role || "nurse";

  // Role-appropriate 4 metrics calculated dynamically
  let roleMetrics = [];

  if (role === "nurse") {
    roleMetrics = [
      {
        id: "nurse_active",
        label: "Assigned Active Patients",
        value: activePatients.length,
        unit: "patients on floor",
        trend: "Ward A & Ward B",
        trendDirection: "neutral",
        iconName: "Users",
      },
      {
        id: "nurse_completed_checks",
        label: "Temp Checks Completed",
        value: metrics.completedTempChecks,
        unit: "vitals logged",
        trend: "Shift batch signed off",
        trendDirection: "success",
        iconName: "Thermometer",
      },
      {
        id: "nurse_pending_checks",
        label: "Pending Temp Checks",
        value: metrics.totalNeedTempChecks,
        unit: "vitals checks due",
        trend: metrics.overdueTempChecks > 0 ? `⚠️ ${metrics.overdueTempChecks} OVERDUE • ${metrics.pendingTempChecks} Pending` : `${metrics.pendingTempChecks} scheduled for shift`,
        trendDirection: metrics.overdueTempChecks > 0 ? "danger" : "warning",
        iconName: "Clock",
      },
      {
        id: "nurse_attention",
        label: "Patients Requiring Attention",
        value: metrics.elevatedTempCount,
        unit: "febrile (≥38.0°C)",
        trend: "Fever spikes flagged for physician",
        trendDirection: "danger",
        iconName: "Activity",
      },
    ];
  } else if (role === "doctor") {
    roleMetrics = [
      {
        id: "doc_active",
        label: "Active Patients Under Care",
        value: activePatients.length,
        unit: "clinical caseload",
        trend: "Isolation cohort Alpha",
        trendDirection: "neutral",
        iconName: "Users",
      },
      {
        id: "doc_pending_visits",
        label: "Pending Doctor Visits",
        value: metrics.pendingDoctorVisits,
        unit: "consultations queued",
        trend: `${metrics.completedDoctorVisits} rounds completed today`,
        trendDirection: "warning",
        iconName: "Stethoscope",
      },
      {
        id: "doc_elevated_temps",
        label: "Elevated Temperatures",
        value: metrics.elevatedTempCount,
        unit: "spikes (≥38.0°C)",
        trend: "Candidate for secondary labs",
        trendDirection: "danger",
        iconName: "Thermometer",
      },
      {
        id: "doc_recovery_reviews",
        label: "Recovery Reviews & Discharges",
        value: metrics.eligibleForReviewCount + metrics.dischargeReadyCount,
        unit: `${metrics.eligibleForReviewCount} need review • ${metrics.dischargeReadyCount} approved`,
        trend: metrics.dischargeReadyCount > 0 ? `${metrics.dischargeReadyCount} cleared for discharge authorization` : "3 fever-free days surveillance in progress",
        trendDirection: metrics.eligibleForReviewCount > 0 ? "warning" : "success",
        iconName: "UserCheck",
      },
    ];
  } else {
    // Admin metrics
    roleMetrics = [
      {
        id: "admin_active",
        label: "Total Active Patients",
        value: activePatients.length,
        unit: `census (${occupiedBedsCount}/${metrics.totalBeds})`,
        trend: `${availableBedsCount} available beds`,
        trendDirection: "neutral",
        iconName: "Users",
      },
      {
        id: "admin_occupied_beds",
        label: "Bed Capacity Utilization",
        value: `${occupiedBedsCount}/${metrics.totalBeds}`,
        unit: `${Math.round((occupiedBedsCount / metrics.totalBeds) * 100)}% occupied`,
        trend: availableBedsCount === 0 ? "Facility at maximum capacity" : `${availableBedsCount} open beds`,
        trendDirection: availableBedsCount === 0 ? "warning" : "success",
        iconName: "Activity",
      },
      {
        id: "admin_pending_work",
        label: "Pending Clinical Work",
        value: metrics.pendingTempChecks + metrics.pendingDoctorVisits,
        unit: "tasks queued",
        trend: `${metrics.pendingTempChecks} temps • ${metrics.pendingDoctorVisits} rounds`,
        trendDirection: "warning",
        iconName: "Clock",
      },
      {
        id: "admin_discharge_ready",
        label: "Discharge-Ready Patients",
        value: metrics.dischargeReadyCount,
        unit: "turnover candidates",
        trend: "Potential capacity release",
        trendDirection: "success",
        iconName: "UserCheck",
      },
    ];
  }

  // Filter clinical work list
  const clinicalWorkSample = activePatients
    .filter((patient) => {
      if (filterPriority === "all") return true;
      return patient.priority.toLowerCase() === filterPriority.toLowerCase();
    })
    .slice(0, 8);

  const occupancyRate = Math.min(100, Math.round((occupiedBedsCount / metrics.totalBeds) * 100));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`${currentUser?.title || "Facility"} Overview`}
        description={`Operational status and shift priorities for ${currentUser?.name || "Healthcare Staff"}.`}
        badge={
          <div className="flex items-center gap-2">
            <StatusBadge
              status={availableBedsCount === 0 ? "At Capacity" : "Operational"}
              size="md"
              className="hidden sm:inline-flex"
            />
            <span className="text-xs px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 font-bold border border-cyan-500/20 uppercase tracking-wide">
              {role.toUpperCase()} WORKSPACE
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/80 dark:bg-card px-3 py-1.5 rounded-xl border border-border/80">
              <Calendar className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>{currentDate}</span>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleSimulateRefresh}
              className={isRefreshing ? "opacity-75" : ""}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </Button>
          </div>
        }
      />

      {/* Demo Notification Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 px-4 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-xs text-navy dark:text-cyan-200 gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span>
            <strong>Simulated Healthcare Operations:</strong> Fictional demonstration cohort of {patients.length} patients in Metropolitan Quarantine Facility Alpha.
          </span>
        </div>
        <span className="font-mono text-[11px] text-cyan-700 dark:text-cyan-300 shrink-0">
          SESSION: {currentUser?.username}
        </span>
      </div>

      {/* 4 Summary Metrics (Role-specific and Dynamically Calculated) */}
      <section aria-label="Role Summary Metrics">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roleMetrics.map((metric) => (
            <MetricCard
              key={metric.id}
              label={metric.label}
              value={metric.value}
              unit={metric.unit}
              trend={metric.trend}
              trendDirection={metric.trendDirection}
              iconName={metric.iconName}
            />
          ))}
        </div>
      </section>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Patients Queue (2 columns) */}
        <section
          aria-label="Today's Active Patient Queue"
          className="lg:col-span-2 bg-card rounded-2xl border border-border/80 shadow-card p-5 space-y-4"
        >
          <SectionHeader
            title="Shift Care Roster"
            description="Active patient queue with real-time temperature and consultation statuses."
            badge={`${clinicalWorkSample.length} Shown`}
            action={
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5 border border-border/60 text-xs">
                  <button
                    onClick={() => setFilterPriority("all")}
                    className={`px-2 py-1 rounded-md transition-colors ${
                      filterPriority === "all"
                        ? "bg-card text-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterPriority("high")}
                    className={`px-2 py-1 rounded-md transition-colors ${
                      filterPriority === "high"
                        ? "bg-rose-500 text-white font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    High Priority
                  </button>
                </div>

                <Link to="/patients">
                  <Button variant="ghost" size="sm" iconRight={ArrowRight}>
                    Full Registry
                  </Button>
                </Link>
              </div>
            }
          />

          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/70">
                <tr>
                  <th scope="col" className="py-3 px-4">Patient</th>
                  <th scope="col" className="py-3 px-3">Bed</th>
                  <th scope="col" className="py-3 px-3">Temp Status</th>
                  <th scope="col" className="py-3 px-3">Doctor Visit</th>
                  <th scope="col" className="py-3 px-3">Priority</th>
                  <th scope="col" className="py-3 px-4 text-right">Attending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {clinicalWorkSample.map((patient) => {
                  const isFebrile = Number(patient.latestTemperature) >= 38.0;
                  return (
                    <tr
                      key={patient.patientId}
                      className="hover:bg-secondary/40 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-navy dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                            {patient.name}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {patient.patientId} • {patient.age} yrs
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-navy dark:text-slate-200 bg-secondary px-2 py-0.5 rounded-md border border-border/60">
                          <Bed className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                          {patient.bedNumber}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <StatusBadge status={patient.temperatureStatus} size="sm" />
                          <span
                            className={`font-mono text-[11px] ${
                              isFebrile ? "text-rose-600 dark:text-rose-400 font-bold" : "text-muted-foreground"
                            }`}
                          >
                            {patient.latestTemperature}°C
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={patient.doctorVisitStatus} size="sm" />
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={patient.priority} size="sm" />
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap text-xs text-muted-foreground font-medium">
                        {patient.assignedDoctor}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Facility Capacity Card (1 column) */}
        <section
          aria-label="Facility Capacity"
          className="bg-card rounded-2xl border border-border/80 shadow-card p-5 space-y-5 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <SectionHeader
              title="Facility Capacity"
              description="Real-time occupancy status & bed allocations."
            />

            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-secondary/50 border border-border/60 text-center">
              <div>
                <span className="text-[11px] font-medium text-muted-foreground block">
                  Total
                </span>
                <span className="text-lg font-bold text-navy dark:text-slate-100">
                  {metrics.totalBeds}
                </span>
                <span className="text-[10px] text-muted-foreground">beds</span>
              </div>
              <div className="border-x border-border/70">
                <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 block">
                  Occupied
                </span>
                <span className="text-lg font-bold text-amber-700 dark:text-amber-300">
                  {occupiedBedsCount}
                </span>
                <span className="text-[10px] text-muted-foreground">active</span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 block">
                  Available
                </span>
                <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                  {availableBedsCount}
                </span>
                <span className="text-[10px] text-muted-foreground">free</span>
              </div>
            </div>

            {/* Occupancy bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-navy dark:text-slate-200">
                  Occupancy Ratio
                </span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                  {occupancyRate}% ({availableBedsCount === 0 ? "Full" : `${availableBedsCount} Free`})
                </span>
              </div>

              <div
                role="progressbar"
                aria-valuenow={occupancyRate}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Bed Occupancy Ratio"
                className="w-full h-3 bg-secondary rounded-full overflow-hidden border border-border/60 p-0.5"
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    occupancyRate >= 100 ? "bg-amber-500" : "bg-cyan-500"
                  }`}
                  style={{ width: `${occupancyRate}%` }}
                />
              </div>

              <p className="text-[11px] text-muted-foreground leading-normal">
                {availableBedsCount === 0
                  ? "Isolation unit census has reached maximum rated capacity (74/74). New admissions are locked until a discharge is processed."
                  : `${availableBedsCount} isolation beds currently available for urgent quarantined patient intake.`}
              </p>
            </div>

            {/* Quick Actions based on Role */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <span className="text-xs font-semibold text-navy dark:text-slate-200 block">
                Quick Role Actions
              </span>

              {role === "nurse" && (
                <div className="flex flex-col gap-2">
                  <Link to="/temperature-logs" className="w-full">
                    <Button variant="outline" size="sm" className="w-full justify-between" iconRight={ArrowRight}>
                      Record Temperature Checks
                    </Button>
                  </Link>
                  <Link to="/patients" className="w-full">
                    <Button variant="secondary" size="sm" className="w-full justify-between" iconRight={ArrowRight}>
                      Patient Care Registry
                    </Button>
                  </Link>
                </div>
              )}

              {role === "doctor" && (
                <div className="flex flex-col gap-2">
                  <Link to="/doctor-rounds" className="w-full">
                    <Button variant="outline" size="sm" className="w-full justify-between" iconRight={ArrowRight}>
                      Conduct Attending Rounds
                    </Button>
                  </Link>
                  <Link to="/discharges" className="w-full">
                    <Button variant="secondary" size="sm" className="w-full justify-between" iconRight={ArrowRight}>
                      Review Discharge Candidates ({metrics.dischargeReadyCount})
                    </Button>
                  </Link>
                </div>
              )}

              {role === "admin" && (
                <div className="flex flex-col gap-2">
                  <Link to="/patients" className="w-full">
                    <Button variant="outline" size="sm" className="w-full justify-between" iconRight={ArrowRight}>
                      Manage 74-Bed Census
                    </Button>
                  </Link>
                  <Link to="/reports" className="w-full">
                    <Button variant="secondary" size="sm" className="w-full justify-between" iconRight={ArrowRight}>
                      Outcomes & Throughput Reports
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-border/60">
            <Link to="/discharges" className="w-full">
              <Button variant="secondary" size="sm" className="w-full justify-between" iconRight={ArrowRight}>
                <span>Manage Discharges & Beds</span>
              </Button>
            </Link>
          </div>
        </section>
      </div>

      {/* Admin Analytics Preview Section */}
      {role === "admin" && (
        <section aria-label="Operational Analytics Preview" className="bg-card rounded-2xl border border-border/80 shadow-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeader
              title="Operational Task & Capacity Analytics"
              description="Real-time telemetry preview derived from active shift logs."
            />
            <Link to="/reports">
              <Button variant="outline" size="sm" iconRight={ArrowRight}>
                Full Analytics Suite
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/70 space-y-2">
              <span className="text-xs font-bold text-navy dark:text-slate-100 block">
                Bed Capacity Distribution
              </span>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Occupied Beds", value: occupiedBedsCount, fill: "#1F2C49" },
                        { name: "Available Beds", value: availableBedsCount, fill: "#15C2D9" },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      <Cell fill="#1F2C49" />
                      <Cell fill="#15C2D9" />
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [`${val} beds`, name]}
                      contentStyle={{ fontSize: "11px", borderRadius: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-navy inline-block" />
                  Occupied: {occupiedBedsCount}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
                  Available: {availableBedsCount}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary/30 border border-border/70 space-y-2">
              <span className="text-xs font-bold text-navy dark:text-slate-100 block">
                Shift Task Completion Overview
              </span>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { task: "Temp Checks", completed: metrics.completedTempChecks, pending: metrics.totalNeedTempChecks },
                      { task: "Doctor Rounds", completed: metrics.completedDoctorVisits, pending: metrics.pendingDoctorVisits },
                      { task: "Discharges", completed: metrics.dischargeReadyCount, pending: metrics.eligibleForReviewCount },
                    ]}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <XAxis dataKey="task" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                    <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" name="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Signed Off
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  Pending
                </span>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
