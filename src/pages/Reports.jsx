import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  FileBarChart2,
  Calendar,
  Filter,
  Download,
  Users,
  Bed,
  Thermometer,
  Stethoscope,
  Activity,
  Flame,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Building,
  Sparkles,
  Info,
} from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useApp, FEVER_THRESHOLD, TOTAL_FACILITY_BEDS } from "../context/AppContext";

export function Reports() {
  const {
    patients,
    activePatients,
    occupiedBedsCount,
    availableBedsCount,
    temperatureLogs,
    doctorVisits,
    getPatientRecovery,
    theme,
  } = useApp();

  // Date Range Filter: "today" | "7d" | "30d" | "all"
  const [dateRange, setDateRange] = useState("7d");
  const [selectedPatientId, setSelectedPatientId] = useState("ALL");
  const [tableSearch, setTableSearch] = useState("");

  const isDark = theme === "dark";

  // Calculate cutoff date based on date range
  const cutoffDate = useMemo(() => {
    const now = new Date();
    if (dateRange === "today") {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return startOfDay;
    }
    if (dateRange === "7d") {
      return new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    }
    if (dateRange === "30d") {
      return new Date(now.getTime() - 30 * 24 * 3600 * 1000);
    }
    return new Date(0); // All
  }, [dateRange]);

  // Filtered historical logs and visits based on date range
  const filteredLogs = useMemo(() => {
    return temperatureLogs.filter((l) => new Date(l.recordedAt) >= cutoffDate);
  }, [temperatureLogs, cutoffDate]);

  const filteredVisits = useMemo(() => {
    return doctorVisits.filter((v) => new Date(v.scheduledAt) >= cutoffDate);
  }, [doctorVisits, cutoffDate]);

  const dischargedInPeriod = useMemo(() => {
    return patients.filter((p) => {
      if (p.status !== "DISCHARGED") return false;
      if (!p.dischargedAt) return true;
      return new Date(p.dischargedAt) >= cutoffDate;
    });
  }, [patients, cutoffDate]);

  // Compute patient recoveries
  const patientsWithRecovery = useMemo(() => {
    return patients.map((p) => ({
      ...p,
      recovery: getPatientRecovery(p.patientId),
    }));
  }, [patients, temperatureLogs]);

  // Current State Metrics
  const totalRegisteredPatients = patients.length;
  const currentActivePatients = activePatients.length;
  const bedOccupancyPercent = Math.min(100, Math.round((occupiedBedsCount / TOTAL_FACILITY_BEDS) * 100));

  const completedChecksToday = activePatients.filter(
    (p) => p.temperatureStatus === "COMPLETED" || p.temperatureStatus === "Completed"
  ).length;

  const pendingChecksToday = activePatients.filter(
    (p) => p.temperatureStatus === "PENDING" || p.temperatureStatus === "Pending" || p.temperatureStatus === "OVERDUE"
  ).length;

  const completedVisitsCount = filteredVisits.filter((v) => v.status === "COMPLETED").length;
  const pendingVisitsCount = filteredVisits.filter((v) => v.status === "PENDING" || v.status === "OVERDUE" || v.status === "IN_PROGRESS").length;

  const feverFreeMeetingCount = patientsWithRecovery.filter(
    (p) => p.status !== "DISCHARGED" && p.recovery.isRuleSatisfied
  ).length;

  // -------------------------------------------------------------
  // RECHARTS DATA DERIVATIONS FROM ACTUAL DATA
  // -------------------------------------------------------------

  // A. Temperature Trend LineChart Data
  const temperatureChartData = useMemo(() => {
    let sourceLogs = filteredLogs;
    if (selectedPatientId !== "ALL") {
      sourceLogs = sourceLogs.filter((l) => l.patientId === selectedPatientId);
    } else {
      // If all patients, take the latest 30 readings chronologically to avoid overlapping lines
      sourceLogs = sourceLogs.slice(0, 30);
    }

    // Sort ascending by timestamp for accurate trend lines
    const sorted = [...sourceLogs].sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));

    return sorted.map((log) => {
      const d = new Date(log.recordedAt);
      const timeLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " " +
        d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

      return {
        timestamp: timeLabel,
        temperature: Number(log.temperature),
        patientName: log.patientName,
        patientId: log.patientId,
        bedNumber: log.bedNumber,
        recordedBy: log.recordedBy,
        threshold: FEVER_THRESHOLD,
      };
    });
  }, [filteredLogs, selectedPatientId]);

  // B. Daily Temperature Monitoring BarChart Data (Grouped by Date)
  const dailyTempMonitoringData = useMemo(() => {
    const dateMap = {};

    filteredLogs.forEach((log) => {
      const d = new Date(log.recordedAt);
      const dateKey = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { date: dateKey, completed: 0, elevated: 0 };
      }
      dateMap[dateKey].completed += 1;
      if (Number(log.temperature) >= FEVER_THRESHOLD) {
        dateMap[dateKey].elevated += 1;
      }
    });

    const list = Object.values(dateMap);
    // If today is in range, add pending checks info for today
    const todayKey = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (!dateMap[todayKey]) {
      list.push({ date: todayKey, completed: completedChecksToday, elevated: 0, pending: pendingChecksToday });
    } else {
      dateMap[todayKey].pending = pendingChecksToday;
    }

    return list.slice(-7); // Last up to 7 distinct days
  }, [filteredLogs, completedChecksToday, pendingChecksToday]);

  // C. Doctor Rounds BarChart Data (Grouped by Date)
  const doctorRoundsChartData = useMemo(() => {
    const dateMap = {};

    filteredVisits.forEach((visit) => {
      const d = new Date(visit.scheduledAt);
      const dateKey = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { date: dateKey, completed: 0, pending: 0, inProgress: 0 };
      }

      if (visit.status === "COMPLETED") {
        dateMap[dateKey].completed += 1;
      } else if (visit.status === "IN_PROGRESS") {
        dateMap[dateKey].inProgress += 1;
      } else {
        dateMap[dateKey].pending += 1;
      }
    });

    return Object.values(dateMap).slice(-7);
  }, [filteredVisits]);

  // D. Bed Occupancy PieChart Data
  const bedOccupancyPieData = useMemo(() => {
    return [
      { name: "Occupied Beds", value: occupiedBedsCount, color: "#1F2C49" },
      { name: "Available Beds", value: availableBedsCount, color: "#15C2D9" },
    ];
  }, [occupiedBedsCount, availableBedsCount]);

  // E. Patient Status Distribution PieChart Data (Mutually Exclusive)
  const patientStatusPieData = useMemo(() => {
    const readyCount = patients.filter((p) => p.status === "DISCHARGE_READY").length;
    const activeOnly = patients.filter((p) => p.status === "ACTIVE").length;
    const dischargedCount = patients.filter((p) => p.status === "DISCHARGED").length;

    return [
      { name: "Active Inpatients", value: activeOnly, color: "#15C2D9" },
      { name: "Discharge-Ready", value: readyCount, color: "#10B981" },
      { name: "Discharged Archive", value: dischargedCount, color: "#64748B" },
    ];
  }, [patients]);

  // F. Recovery Progress BarChart Data
  const recoveryStagesData = useMemo(() => {
    let monitoring = 0;
    let inProgress = 0;
    let eligible = 0;
    let approved = 0;
    let discharged = 0;

    patientsWithRecovery.forEach((p) => {
      if (p.status === "DISCHARGED") {
        discharged += 1;
      } else if (p.doctorReviewStatus === "APPROVED" || p.doctorReviewStatus === "OVERRIDE_APPROVED" || p.status === "DISCHARGE_READY") {
        approved += 1;
      } else if (p.recovery.isEligibleForReview) {
        eligible += 1;
      } else if (p.recovery.consecutiveFeverFreeDays > 0) {
        inProgress += 1;
      } else {
        monitoring += 1;
      }
    });

    return [
      { stage: "Monitoring", count: monitoring, fill: "#64748B" },
      { stage: "Recovery in Progress", count: inProgress, fill: "#38BDF8" },
      { stage: "Eligible for Review", count: eligible, fill: "#F59E0B" },
      { stage: "Approved for Discharge", count: approved, fill: "#10B981" },
      { stage: "Discharged", count: discharged, fill: "#1F2C49" },
    ];
  }, [patientsWithRecovery]);

  // Filtered Patient Table
  const tablePatients = useMemo(() => {
    return patientsWithRecovery.filter((p) => {
      const q = tableSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q) ||
        (p.bedNumber && p.bedNumber.toLowerCase().includes(q)) ||
        p.status.toLowerCase().includes(q)
      );
    });
  }, [patientsWithRecovery, tableSearch]);

  const chartThemeStyles = {
    cartesianStroke: isDark ? "#1E293B" : "#E2E8F0",
    tickColor: isDark ? "#94A3B8" : "#64748B",
    tooltipBg: isDark ? "#121A2A" : "#FFFFFF",
    tooltipBorder: isDark ? "#1E293B" : "#CBD5E1",
    tooltipText: isDark ? "#F8FAFC" : "#0F172A",
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Reports & Operations Analytics"
        description="Comprehensive facility analytics derived directly from real-time patient charts, temperature screenings, doctor rounds, and discharge records."
        breadcrumbs={[
          { label: "QuarantineOS", href: "/dashboard" },
          { label: "Insights" },
          { label: "Outcomes & Reports" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {/* Date Range Filter */}
            <div className="flex items-center gap-1 bg-secondary rounded-xl p-1 border border-border/70 text-xs">
              <button
                onClick={() => setDateRange("today")}
                className={`px-3 py-1 rounded-lg transition-colors font-semibold ${
                  dateRange === "today" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateRange("7d")}
                className={`px-3 py-1 rounded-lg transition-colors font-semibold ${
                  dateRange === "7d" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setDateRange("30d")}
                className={`px-3 py-1 rounded-lg transition-colors font-semibold ${
                  dateRange === "30d" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setDateRange("all")}
                className={`px-3 py-1 rounded-lg transition-colors font-semibold ${
                  dateRange === "all" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Records
              </button>
            </div>
          </div>
        }
      />

      {/* 10 Summary Cards (Current-State vs Historical Period Metrics clearly distinguished) */}
      <section aria-label="Facility Summary Metrics">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-analytical">
          {/* 1. Total Registered */}
          <div className="bg-card rounded-2xl border border-border/80 p-3.5 shadow-card">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
              Total Registered
            </span>
            <span className="text-2xl font-bold text-navy dark:text-slate-100 mt-1 block">
              {totalRegisteredPatients}
            </span>
            <span className="text-[10px] text-muted-foreground">Cumulative cohort</span>
          </div>

          {/* 2. Currently Active */}
          <div className="bg-card rounded-2xl border border-cyan-200 dark:border-cyan-900/60 p-3.5 shadow-card">
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-800 dark:text-cyan-400 block">
              Active Inpatients
            </span>
            <span className="text-2xl font-bold text-cyan-700 dark:text-cyan-300 mt-1 block">
              {currentActivePatients}
            </span>
            <span className="text-[10px] text-muted-foreground">Current census state</span>
          </div>

          {/* 3. Bed Occupancy */}
          <div className="bg-card rounded-2xl border border-border/80 p-3.5 shadow-card">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
              Bed Occupancy
            </span>
            <span className="text-2xl font-bold text-navy dark:text-slate-100 mt-1 block">
              {occupiedBedsCount}/{TOTAL_FACILITY_BEDS}
            </span>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
              {bedOccupancyPercent}% occupied ({availableBedsCount} vacant)
            </span>
          </div>

          {/* 4. Temp Checks Completed Today */}
          <div className="bg-card rounded-2xl border border-emerald-200 dark:border-emerald-900/60 p-3.5 shadow-card">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-400 block">
              Vitals Signed Today
            </span>
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1 block">
              {completedChecksToday}
            </span>
            <span className="text-[10px] text-muted-foreground">Morning/afternoon checks</span>
          </div>

          {/* 5. Pending Temp Checks */}
          <div className="bg-card rounded-2xl border border-amber-200 dark:border-amber-900/60 p-3.5 shadow-card">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 dark:text-amber-400 block">
              Temp Checks Due
            </span>
            <span className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1 block">
              {pendingChecksToday}
            </span>
            <span className="text-[10px] text-muted-foreground">Pending shift vitals</span>
          </div>

          {/* 6. Doctor Visits Completed */}
          <div className="bg-card rounded-2xl border border-border/80 p-3.5 shadow-card">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
              Doctor Visits Done
            </span>
            <span className="text-2xl font-bold text-navy dark:text-slate-100 mt-1 block">
              {completedVisitsCount}
            </span>
            <span className="text-[10px] text-muted-foreground">In selected period</span>
          </div>

          {/* 7. Doctor Visits Pending */}
          <div className="bg-card rounded-2xl border border-border/80 p-3.5 shadow-card">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
              Doctor Visits Pending
            </span>
            <span className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1 block">
              {pendingVisitsCount}
            </span>
            <span className="text-[10px] text-muted-foreground">Scheduled consultations</span>
          </div>

          {/* 8. Fever-Free 3-Day Rule Met */}
          <div className="bg-card rounded-2xl border border-cyan-200 dark:border-cyan-900/60 p-3.5 shadow-card">
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-800 dark:text-cyan-400 block">
              3 Fever-Free Days Met
            </span>
            <span className="text-2xl font-bold text-cyan-700 dark:text-cyan-300 mt-1 block">
              {feverFreeMeetingCount}
            </span>
            <span className="text-[10px] text-muted-foreground">Eligible for doctor review</span>
          </div>

          {/* 9. Discharged in Period */}
          <div className="bg-card rounded-2xl border border-emerald-200 dark:border-emerald-900/60 p-3.5 shadow-card">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-400 block">
              Discharged (Period)
            </span>
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1 block">
              {dischargedInPeriod.length}
            </span>
            <span className="text-[10px] text-muted-foreground">Freed bed capacity</span>
          </div>

          {/* 10. Available Capacity */}
          <div className="bg-card rounded-2xl border border-border/80 p-3.5 shadow-card">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
              Available Beds
            </span>
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1 block">
              {availableBedsCount}
            </span>
            <span className="text-[10px] text-muted-foreground">Immediate intake beds</span>
          </div>
        </div>
      </section>

      {/* Operational Insights & Fast Navigation Shortcuts */}
      <div className="p-4 rounded-2xl bg-secondary/40 border border-border/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy dark:text-slate-100">
              Live Clinical & Capacity Insights
            </h3>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            PERIOD: {dateRange.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <Link
            to="/temperature-logs"
            className="p-3 rounded-xl bg-card border border-border/70 hover:border-cyan-500/40 transition-colors flex items-center justify-between group"
          >
            <div>
              <span className="text-muted-foreground block text-[11px]">Pending Temp Vitals</span>
              <strong className="text-navy dark:text-slate-100 group-hover:text-cyan-600">
                {pendingChecksToday} checks due today
              </strong>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600" />
          </Link>

          <Link
            to="/doctor-rounds"
            className="p-3 rounded-xl bg-card border border-border/70 hover:border-cyan-500/40 transition-colors flex items-center justify-between group"
          >
            <div>
              <span className="text-muted-foreground block text-[11px]">Doctor Consultations</span>
              <strong className="text-navy dark:text-slate-100 group-hover:text-cyan-600">
                {pendingVisitsCount} visits queued
              </strong>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600" />
          </Link>

          <Link
            to="/recovery"
            className="p-3 rounded-xl bg-card border border-border/70 hover:border-cyan-500/40 transition-colors flex items-center justify-between group"
          >
            <div>
              <span className="text-muted-foreground block text-[11px]">Recovery Reviews</span>
              <strong className="text-navy dark:text-slate-100 group-hover:text-cyan-600">
                {feverFreeMeetingCount} meeting 3-day rule
              </strong>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600" />
          </Link>

          <Link
            to="/discharges"
            className="p-3 rounded-xl bg-card border border-border/70 hover:border-cyan-500/40 transition-colors flex items-center justify-between group"
          >
            <div>
              <span className="text-muted-foreground block text-[11px]">Bed Availability</span>
              <strong className="text-navy dark:text-slate-100 group-hover:text-cyan-600">
                {availableBedsCount} vacant / {TOTAL_FACILITY_BEDS} total
              </strong>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600" />
          </Link>
        </div>
      </div>

      {/* RECHARTS SECTION A: Patient Temperature Trends (LineChart) */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <SectionHeader
            title="Patient Temperature Trends"
            description="Chronological temperature readings plotted against the 38.0°C fever threshold line."
            badge={`${temperatureChartData.length} Readings Plotted`}
          />

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Filter Patient:</span>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="text-xs bg-secondary/50 border border-border/80 rounded-xl px-3 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Patients (Recent 30)</option>
              {activePatients.map((p) => (
                <option key={p.patientId} value={p.patientId}>
                  {p.name} ({p.patientId}) - Bed {p.bedNumber}
                </option>
              ))}
            </select>
          </div>
        </div>

        {temperatureChartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-xs text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border/70">
            No temperature logs match the selected filter or date range.
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={temperatureChartData} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartThemeStyles.cartesianStroke} />
                <XAxis
                  dataKey="timestamp"
                  stroke={chartThemeStyles.tickColor}
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  domain={[35.0, 41.0]}
                  stroke={chartThemeStyles.tickColor}
                  tick={{ fontSize: 11 }}
                  unit="°C"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartThemeStyles.tooltipBg,
                    borderColor: chartThemeStyles.tooltipBorder,
                    borderRadius: "0.75rem",
                    color: chartThemeStyles.tooltipText,
                    fontSize: "12px",
                  }}
                  formatter={(val) => [`${val}°C`, "Temperature"]}
                  labelFormatter={(lbl, items) => {
                    if (items && items[0]) {
                      const payload = items[0].payload;
                      return `${payload.patientName} (${payload.patientId}) • ${lbl}`;
                    }
                    return lbl;
                  }}
                />
                <ReferenceLine
                  y={FEVER_THRESHOLD}
                  stroke="#EF4444"
                  strokeDasharray="4 4"
                  label={{
                    value: `Fever Alert: ${FEVER_THRESHOLD}°C`,
                    fill: "#EF4444",
                    position: "top",
                    fontSize: 11,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature"
                  stroke="#15C2D9"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#15C2D9" }}
                  activeDot={{ r: 6, fill: "#089BB2" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* RECHARTS SECTION B & C: Daily Monitoring & Doctor Rounds (BarCharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Temperature Monitoring */}
        <div className="bg-card rounded-2xl border border-border/80 shadow-card p-5 space-y-4">
          <SectionHeader
            title="Daily Vitals Screening Breakdown"
            description="Completed temperature logs and febrile spikes detected per day."
          />

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTempMonitoringData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartThemeStyles.cartesianStroke} />
                <XAxis dataKey="date" stroke={chartThemeStyles.tickColor} tick={{ fontSize: 11 }} />
                <YAxis stroke={chartThemeStyles.tickColor} tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartThemeStyles.tooltipBg,
                    borderColor: chartThemeStyles.tooltipBorder,
                    borderRadius: "0.75rem",
                    color: chartThemeStyles.tooltipText,
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="completed" name="Completed Readings" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="elevated" name="Febrile Spikes (≥38.0°C)" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doctor Rounds Daily Distribution */}
        <div className="bg-card rounded-2xl border border-border/80 shadow-card p-5 space-y-4">
          <SectionHeader
            title="Doctor Rounds Activity"
            description="Completed vs pending consultations scheduled across dates."
          />

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={doctorRoundsChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartThemeStyles.cartesianStroke} />
                <XAxis dataKey="date" stroke={chartThemeStyles.tickColor} tick={{ fontSize: 11 }} />
                <YAxis stroke={chartThemeStyles.tickColor} tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartThemeStyles.tooltipBg,
                    borderColor: chartThemeStyles.tooltipBorder,
                    borderRadius: "0.75rem",
                    color: chartThemeStyles.tooltipText,
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="completed" name="Completed Visits" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending Visits" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inProgress" name="In Progress" fill="#15C2D9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RECHARTS SECTION D & E: Bed Occupancy & Patient Status (PieCharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bed Capacity Occupancy PieChart */}
        <div className="bg-card rounded-2xl border border-border/80 shadow-card p-5 space-y-4">
          <SectionHeader
            title="Bed Capacity & Utilization (74 Beds)"
            description="Real-time occupancy ratio. Discharged patients do not occupy beds."
          />

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bedOccupancyPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {bedOccupancyPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartThemeStyles.tooltipBg,
                    borderColor: chartThemeStyles.tooltipBorder,
                    borderRadius: "0.75rem",
                    color: chartThemeStyles.tooltipText,
                    fontSize: "12px",
                  }}
                  formatter={(val, name) => [`${val} beds (${Math.round((val / TOTAL_FACILITY_BEDS) * 100)}%)`, name]}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patient Status Distribution PieChart */}
        <div className="bg-card rounded-2xl border border-border/80 shadow-card p-5 space-y-4">
          <SectionHeader
            title="Cohort Status Distribution"
            description="Mutually exclusive breakdown of active, discharge-ready, and discharged cohorts."
          />

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={patientStatusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {patientStatusPieData.map((entry, index) => (
                    <Cell key={`cell-status-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartThemeStyles.tooltipBg,
                    borderColor: chartThemeStyles.tooltipBorder,
                    borderRadius: "0.75rem",
                    color: chartThemeStyles.tooltipText,
                    fontSize: "12px",
                  }}
                  formatter={(val, name) => [`${val} patients`, name]}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RECHARTS SECTION F: Recovery Progress BarChart */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-card p-5 space-y-4">
        <SectionHeader
          title="Patient Recovery Stages (3-Day Fever-Free Rule)"
          description="Distribution of all registered patients across recovery milestones, calculated from chronological temperature histories."
        />

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={recoveryStagesData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartThemeStyles.cartesianStroke} />
              <XAxis dataKey="stage" stroke={chartThemeStyles.tickColor} tick={{ fontSize: 11 }} />
              <YAxis stroke={chartThemeStyles.tickColor} tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartThemeStyles.tooltipBg,
                  borderColor: chartThemeStyles.tooltipBorder,
                  borderRadius: "0.75rem",
                  color: chartThemeStyles.tooltipText,
                  fontSize: "12px",
                }}
                formatter={(val) => [`${val} patients`, "Patients in Stage"]}
              />
              <Bar dataKey="count" name="Patients" radius={[6, 6, 0, 0]}>
                {recoveryStagesData.map((entry, index) => (
                  <Cell key={`cell-rec-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Underlying Patient Data Table */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <SectionHeader
            title="Analytics Source Records"
            description="Underlying patient records feeding the operational metrics above."
            badge={`${tablePatients.length} Records`}
          />

          <input
            type="text"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            placeholder="Search records table..."
            className="px-3 py-1.5 rounded-xl text-xs bg-secondary/40 border border-border/80 focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/70">
              <tr>
                <th scope="col" className="py-3 px-4">Patient</th>
                <th scope="col" className="py-3 px-3">Bed</th>
                <th scope="col" className="py-3 px-3">Latest Temp</th>
                <th scope="col" className="py-3 px-3">Fever-Free Days</th>
                <th scope="col" className="py-3 px-3">Recovery Status</th>
                <th scope="col" className="py-3 px-3">Doctor Review</th>
                <th scope="col" className="py-3 px-4 text-right">Discharge Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {tablePatients.slice(0, 10).map((pt) => (
                <tr key={pt.patientId} className="hover:bg-secondary/40 transition-colors">
                  <td className="py-2.5 px-4">
                    <span className="font-semibold text-navy dark:text-slate-100 block">
                      {pt.name}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">{pt.patientId}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-xs">
                    {pt.status === "DISCHARGED" ? <span className="text-muted-foreground italic">Freed</span> : pt.bedNumber}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-xs font-bold">
                    {pt.latestTemperature}°C
                  </td>
                  <td className="py-2.5 px-3 font-mono text-xs">
                    {pt.recovery.consecutiveFeverFreeDays}/3 Days
                  </td>
                  <td className="py-2.5 px-3 text-xs">
                    {pt.recovery.isEligibleForReview ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">3-Day Rule Met</span>
                    ) : (
                      <span className="text-muted-foreground">{pt.recovery.eligibilityStatusText}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-xs font-medium">
                    {pt.doctorReviewStatus}
                  </td>
                  <td className="py-2.5 px-4 text-right text-xs">
                    {pt.status === "DISCHARGED" ? (
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                        DISCHARGED
                      </span>
                    ) : pt.status === "DISCHARGE_READY" ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px]">
                        READY
                      </span>
                    ) : (
                      <span className="text-muted-foreground">ACTIVE</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
