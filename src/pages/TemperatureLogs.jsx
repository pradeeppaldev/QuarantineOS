import React, { useState, useMemo } from "react";
import {
  Thermometer,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  Flame,
  X,
  Check,
  Calendar,
  User,
  Edit2,
  Trash2,
  Eye,
  ArrowUpDown,
  RotateCcw,
  AlertCircle,
  Bed,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useApp, FEVER_THRESHOLD, NURSES } from "../context/AppContext";

export function TemperatureLogs() {
  const {
    activePatients,
    temperatureLogs,
    addTemperatureLog,
    updateTemperatureLog,
    deleteTemperatureLog,
    toggleDailyCheckStatus,
    currentUser,
    metrics,
  } = useApp();

  // Search, Filters & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [patientFilter, setPatientFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | ELEVATED | NORMAL
  const [dateFilter, setDateFilter] = useState("ALL"); // ALL | TODAY | YESTERDAY
  const [activeTab, setActiveTab] = useState("history"); // history | daily_checks

  // Pagination for history table
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Modals state
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [preselectedPatient, setPreselectedPatient] = useState(null);
  const [editingLog, setEditingLog] = useState(null);
  const [viewingLog, setViewingLog] = useState(null);
  const [deletingLog, setDeletingLog] = useState(null);

  // Form state
  const [formPatientId, setFormPatientId] = useState("");
  const [formTemp, setFormTemp] = useState("37.0");
  const [formNurse, setFormNurse] = useState(currentUser?.name || NURSES[0]);
  const [formNotes, setFormNotes] = useState("");
  const [formError, setFormError] = useState("");

  // Feedback banner
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  // Patients who still need temperature checks (PENDING or OVERDUE)
  const pendingAndOverduePatients = useMemo(() => {
    return activePatients.filter(
      (p) => p.temperatureStatus === "PENDING" || p.temperatureStatus === "Pending" || p.temperatureStatus === "OVERDUE"
    );
  }, [activePatients]);

  const selectedPatientData = useMemo(() => {
    return activePatients.find((p) => p.patientId === formPatientId) || null;
  }, [activePatients, formPatientId]);

  // Filtered Temperature Logs
  const filteredLogs = useMemo(() => {
    return temperatureLogs.filter((log) => {
      const matchesSearch =
        log.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.notes && log.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        log.recordedBy.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPatient = patientFilter === "ALL" ? true : log.patientId === patientFilter;
      const matchesStatus = statusFilter === "ALL" ? true : log.status === statusFilter;

      let matchesDate = true;
      if (dateFilter === "TODAY") {
        const logDay = new Date(log.recordedAt).toDateString();
        matchesDate = logDay === new Date().toDateString();
      } else if (dateFilter === "YESTERDAY") {
        const yest = new Date(Date.now() - 24 * 3600 * 1000).toDateString();
        matchesDate = new Date(log.recordedAt).toDateString() === yest;
      }

      return matchesSearch && matchesPatient && matchesStatus && matchesDate;
    });
  }, [temperatureLogs, searchQuery, patientFilter, statusFilter, dateFilter]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenRecord = (patient = null) => {
    setFormError("");
    if (patient) {
      setFormPatientId(patient.patientId);
      setPreselectedPatient(patient);
    } else {
      const defaultPt = pendingAndOverduePatients[0] || activePatients[0];
      setFormPatientId(defaultPt ? defaultPt.patientId : "");
      setPreselectedPatient(null);
    }
    setFormTemp("37.0");
    setFormNurse(currentUser?.name || NURSES[0]);
    setFormNotes("");
    setRecordModalOpen(true);
  };

  const handleSaveReading = (e) => {
    e.preventDefault();
    setFormError("");

    const val = Number(formTemp);
    if (isNaN(val) || val < 30.0 || val > 45.0) {
      setFormError("Temperature must be a valid reading between 30.0°C and 45.0°C.");
      return;
    }

    if (!formPatientId) {
      setFormError("Please select a patient.");
      return;
    }

    const res = addTemperatureLog({
      patientId: formPatientId,
      temperature: val,
      recordedBy: formNurse,
      notes: formNotes,
    });

    if (res.success) {
      setRecordModalOpen(false);
      const isElevated = val >= FEVER_THRESHOLD;
      setFeedback({
        type: "success",
        message: `${val}°C logged for ${res.log.patientName} (${res.log.patientId}). Daily check marked completed.${
          isElevated ? " ⚠️ FEVER ALERT: Reading flagged as elevated (≥38.0°C)." : ""
        }`,
      });
      setTimeout(() => setFeedback(null), 5000);
    } else {
      setFormError(res.error);
    }
  };

  const handleOpenEdit = (log) => {
    setFormError("");
    setEditingLog(log);
    setFormTemp(String(log.temperature));
    setFormNurse(log.recordedBy);
    setFormNotes(log.notes || "");
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setFormError("");

    const val = Number(formTemp);
    if (isNaN(val) || val < 30.0 || val > 45.0) {
      setFormError("Temperature must be a valid reading between 30.0°C and 45.0°C.");
      return;
    }

    const res = updateTemperatureLog(editingLog.id, {
      temperature: val,
      recordedBy: formNurse,
      notes: formNotes,
    });

    if (res.success) {
      setEditingLog(null);
      setFeedback({
        type: "success",
        message: `Temperature record ${editingLog.id} updated to ${val}°C. Patient latest reading recalculated.`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFormError(res.error);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingLog) return;
    deleteTemperatureLog(deletingLog.id);
    setFeedback({
      type: "success",
      message: `Record ${deletingLog.id} removed. Patient latest temperature recalculated from remaining logs.`,
    });
    setDeletingLog(null);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Temperature Screening & Daily Vitals"
        description="Comprehensive infrared fever screening logs, daily shift surveillance checklists, and clinical alert flags."
        breadcrumbs={[
          { label: "QuarantineOS", href: "/dashboard" },
          { label: "Clinical Operations" },
          { label: "Temperature Logs" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => handleOpenRecord(null)}
            >
              Record New Reading
            </Button>
          </div>
        }
      />

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-2 animate-in fade-in duration-150 ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : "bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Overdue */}
        <div className="bg-card rounded-2xl border border-rose-200 dark:border-rose-900/60 p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-rose-700 dark:text-rose-400">
              Overdue Checks
            </span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 dark:text-rose-300 mt-1">
            {metrics.overdueTempChecks} Overdue
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Passed scheduled shift window
          </span>
        </div>

        {/* Pending */}
        <div className="bg-card rounded-2xl border border-amber-200 dark:border-amber-900/60 p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-amber-700 dark:text-amber-400">
              Pending Checks
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">
            {metrics.pendingTempChecks} Due
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Awaiting today's screening
          </span>
        </div>

        {/* Completed */}
        <div className="bg-card rounded-2xl border border-emerald-200 dark:border-emerald-900/60 p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-emerald-700 dark:text-emerald-400">
              Completed Checks
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
            {metrics.completedTempChecks} Signed Off
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Vitals verified today
          </span>
        </div>

        {/* Elevated Spikes */}
        <div className="bg-card rounded-2xl border border-border/80 p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-muted-foreground">
              Fever Spikes (≥38.0°C)
            </span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-700 dark:text-rose-400 mt-1">
            {metrics.elevatedTempCount} Patients
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Flagged for physician rounds
          </span>
        </div>
      </div>

      {/* Main Tab Controls: Daily Check Tracker vs All History */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-1">
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-t-xl text-xs font-bold transition-colors border-b-2 -mb-1 ${
            activeTab === "history"
              ? "border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-secondary/30"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          All Recorded Logs ({temperatureLogs.length})
        </button>
        <button
          onClick={() => setActiveTab("daily_checks")}
          className={`px-4 py-2 rounded-t-xl text-xs font-bold transition-colors border-b-2 -mb-1 flex items-center gap-2 ${
            activeTab === "daily_checks"
              ? "border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-secondary/30"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>Daily Check Tracking Queue</span>
          {pendingAndOverduePatients.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-black">
              {pendingAndOverduePatients.length} Due
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: ALL RECORDED LOGS */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-card rounded-2xl border border-border/80 shadow-card p-4 space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by log ID (TMP-1001), patient, nurse, or notes..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-secondary/40 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs bg-secondary/40 border border-border/70 rounded-lg px-2.5 py-1.5"
                >
                  <option value="ALL">All Readings</option>
                  <option value="ELEVATED">Elevated (≥38.0°C)</option>
                  <option value="NORMAL">Normal (&lt;38.0°C)</option>
                </select>

                <select
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs bg-secondary/40 border border-border/70 rounded-lg px-2.5 py-1.5"
                >
                  <option value="ALL">All Dates</option>
                  <option value="TODAY">Today's Readings</option>
                  <option value="YESTERDAY">Yesterday's Readings</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs text-muted-foreground">
              <span>Showing <strong>{filteredLogs.length}</strong> recorded temperature logs</span>
              <span>Fever Alert Threshold: <strong>{FEVER_THRESHOLD}°C</strong></span>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-card rounded-2xl border border-border/80 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/70">
                  <tr>
                    <th scope="col" className="py-3 px-4">Log ID</th>
                    <th scope="col" className="py-3 px-3">Patient</th>
                    <th scope="col" className="py-3 px-3">Bed</th>
                    <th scope="col" className="py-3 px-3">Reading (°C)</th>
                    <th scope="col" className="py-3 px-3">Status</th>
                    <th scope="col" className="py-3 px-3">Date & Time</th>
                    <th scope="col" className="py-3 px-3">Recorded By</th>
                    <th scope="col" className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground text-sm">
                        No temperature records match your query.
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map((log) => {
                      const isElevated = log.temperature >= FEVER_THRESHOLD;
                      const dateObj = new Date(log.recordedAt);
                      const timeStr = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                      const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

                      return (
                        <tr key={log.id} className="hover:bg-secondary/40 transition-colors group">
                          <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                            {log.id}
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-semibold text-navy dark:text-slate-100 block">
                              {log.patientName}
                            </span>
                            <span className="font-mono text-xs text-muted-foreground">
                              {log.patientId}
                            </span>
                          </td>

                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold bg-secondary px-2 py-0.5 rounded border border-border/60">
                              <Bed className="w-3 h-3 text-cyan-600" />
                              {log.bedNumber}
                            </span>
                          </td>

                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`font-mono text-sm font-bold px-2 py-0.5 rounded-md ${
                                isElevated
                                  ? "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300"
                                  : "bg-secondary text-foreground"
                              }`}
                            >
                              {log.temperature}°C
                            </span>
                          </td>

                          <td className="py-3 px-3 whitespace-nowrap">
                            {isElevated ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                                <Flame className="w-3 h-3 text-rose-600" />
                                ELEVATED
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary text-slate-700 dark:text-slate-300 border border-border/70">
                                NORMAL
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap">
                            <span>{dateStr}</span> <span className="font-mono text-[11px]">({timeStr})</span>
                          </td>

                          <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap">
                            {log.recordedBy}
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setViewingLog(log)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-600 hover:bg-secondary transition-colors"
                                title="View Record"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(log)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-600 hover:bg-secondary transition-colors"
                                title="Edit Record"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeletingLog(log)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                title="Delete Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-3.5 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-3 bg-secondary/30">
              <span className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages} ({filteredLogs.length} logs)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  icon={ChevronLeft}
                >
                  Prev
                </Button>
                <span className="text-xs font-mono px-2 font-medium">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  iconRight={ChevronRight}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DAILY CHECK TRACKING QUEUE */}
      {activeTab === "daily_checks" && (
        <div className="bg-card rounded-2xl border border-border/80 shadow-card p-5 space-y-4">
          <SectionHeader
            title="Daily Shift Temperature Status Roster"
            description="Tracks whether each active patient has completed today's temperature check. Authorized staff can correct statuses or quickly record readings."
            badge={`${pendingAndOverduePatients.length} Awaiting Check`}
          />

          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/70">
                <tr>
                  <th scope="col" className="py-3 px-4">Patient Profile</th>
                  <th scope="col" className="py-3 px-3">Bed</th>
                  <th scope="col" className="py-3 px-3">Today's Check Status</th>
                  <th scope="col" className="py-3 px-3">Latest Recorded Reading</th>
                  <th scope="col" className="py-3 px-3">Assigned Nurse</th>
                  <th scope="col" className="py-3 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {activePatients.slice(0, 20).map((patient) => {
                  const isCompleted = patient.temperatureStatus === "COMPLETED" || patient.temperatureStatus === "Completed";
                  const isOverdue = patient.temperatureStatus === "OVERDUE";
                  const isElevated = Number(patient.latestTemperature) >= FEVER_THRESHOLD;

                  return (
                    <tr key={patient.patientId} className="hover:bg-secondary/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-navy dark:text-slate-100 block">
                          {patient.name}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {patient.patientId} • Age {patient.age}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold bg-secondary px-2 py-0.5 rounded border border-border/60">
                          {patient.bedNumber}
                        </span>
                      </td>

                      {/* Explicit non-color dependent status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            [COMPLETED]
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            [OVERDUE]
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            [PENDING]
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                            isElevated
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300"
                              : "bg-secondary text-foreground"
                          }`}
                        >
                          {patient.latestTemperature}°C
                        </span>
                      </td>

                      <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap">
                        {patient.assignedNurse}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant={isCompleted ? "outline" : "primary"}
                            size="sm"
                            className="text-xs"
                            onClick={() => handleOpenRecord(patient)}
                          >
                            {isCompleted ? "Log Second Reading" : "Record & Complete"}
                          </Button>

                          {/* Allow demo staff to toggle/correct status */}
                          <button
                            onClick={() => toggleDailyCheckStatus(patient.patientId)}
                            className="p-1.5 rounded-lg border border-border/80 text-muted-foreground hover:text-foreground text-[11px]"
                            title="Toggle Completed / Pending status"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECORD NEW TEMPERATURE MODAL */}
      {recordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-elevated overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-border/70 flex items-center justify-between bg-secondary/40">
              <div>
                <h3 className="text-base font-bold text-navy dark:text-slate-100">
                  Record Infrared Temperature Reading
                </h3>
                <p className="text-xs text-muted-foreground">
                  Completes daily check and updates patient's latest vitals.
                </p>
              </div>
              <button
                onClick={() => setRecordModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReading} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Select Patient */}
              <div>
                <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                  Select Patient *
                </label>
                <select
                  value={formPatientId}
                  onChange={(e) => setFormPatientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                >
                  {activePatients.map((p) => (
                    <option key={p.patientId} value={p.patientId}>
                      {p.name} ({p.patientId}) — Bed {p.bedNumber} [{p.temperatureStatus}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Patient Banner Display */}
              {selectedPatientData && (
                <div className="p-3 rounded-xl bg-secondary/50 border border-border/70 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-navy dark:text-slate-100 block">
                      {selectedPatientData.name} ({selectedPatientData.patientId})
                    </span>
                    <span className="text-muted-foreground font-mono text-[11px]">
                      Bed {selectedPatientData.bedNumber} • Age {selectedPatientData.age}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block uppercase">Last Known</span>
                    <span className="font-mono font-bold text-navy dark:text-cyan-400 text-xs">
                      {selectedPatientData.latestTemperature}°C
                    </span>
                  </div>
                </div>
              )}

              {/* Temperature Reading */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-navy dark:text-slate-200">
                    Temperature Reading (°C) *
                  </label>
                  <span className="text-[11px] text-muted-foreground">Range: 30.0 - 45.0°C</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="30.0"
                  max="45.0"
                  required
                  value={formTemp}
                  onChange={(e) => setFormTemp(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-lg font-bold font-mono text-center bg-secondary/40 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
                {Number(formTemp) >= FEVER_THRESHOLD && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    Warning: Reading exceeds {FEVER_THRESHOLD}°C fever alert threshold.
                  </p>
                )}
              </div>

              {/* Staff Name */}
              <div>
                <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                  Recording Staff Nurse
                </label>
                <select
                  value={formNurse}
                  onChange={(e) => setFormNurse(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                >
                  {NURSES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                  Clinical Observation Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Patient asymptomatic; cool to touch."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>

              <div className="pt-2 border-t border-border/70 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRecordModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Reading & Complete Check
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LOG MODAL */}
      {editingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-elevated p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div>
                <h3 className="text-sm font-bold text-navy dark:text-slate-100">
                  Edit Temperature Record {editingLog.id}
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  {editingLog.patientName} ({editingLog.patientId})
                </p>
              </div>
              <button onClick={() => setEditingLog(null)} className="p-1 text-slate-400 hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                  Temperature Reading (°C) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="30.0"
                  max="45.0"
                  required
                  value={formTemp}
                  onChange={(e) => setFormTemp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-base font-bold font-mono text-center bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                  Recorded By
                </label>
                <input
                  type="text"
                  required
                  value={formNurse}
                  onChange={(e) => setFormNurse(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                <Button variant="outline" size="sm" onClick={() => setEditingLog(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Update Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW LOG MODAL */}
      {viewingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-card w-full max-w-sm rounded-2xl border border-border shadow-elevated p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div>
                <h3 className="text-sm font-bold text-navy dark:text-slate-100">
                  Temperature Reading Details
                </h3>
                <span className="font-mono text-xs text-muted-foreground">{viewingLog.id}</span>
              </div>
              <button onClick={() => setViewingLog(null)} className="p-1 text-slate-400 hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-secondary/40 space-y-1">
                <span className="text-muted-foreground block text-[11px]">Patient & Location</span>
                <span className="font-bold text-navy dark:text-slate-100 block">
                  {viewingLog.patientName} ({viewingLog.patientId})
                </span>
                <span className="text-muted-foreground font-mono">Bed {viewingLog.bedNumber}</span>
              </div>

              <div className="p-3 rounded-xl bg-secondary/40 flex items-center justify-between">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Reading</span>
                  <span className="font-mono text-xl font-black text-navy dark:text-slate-100">
                    {viewingLog.temperature}°C
                  </span>
                </div>
                {viewingLog.temperature >= FEVER_THRESHOLD ? (
                  <span className="px-2 py-1 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-bold text-xs">
                    ELEVATED FEVER
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs">
                    NORMAL
                  </span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-secondary/30 space-y-1">
                <span className="text-muted-foreground block text-[11px]">Audit Timestamp & Staff</span>
                <p className="font-mono text-slate-600 dark:text-slate-300">
                  {new Date(viewingLog.recordedAt).toLocaleString()}
                </p>
                <p className="font-medium text-slate-600 dark:text-slate-300">
                  Nurse: {viewingLog.recordedBy}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-secondary/30 space-y-1">
                <span className="text-muted-foreground block text-[11px]">Clinical Notes</span>
                <p className="text-slate-700 dark:text-slate-200">
                  {viewingLog.notes || "No clinical observation notes provided."}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end border-t border-border/60">
              <Button variant="secondary" size="sm" onClick={() => setViewingLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE LOG CONFIRMATION */}
      {deletingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-card w-full max-w-sm rounded-2xl border border-rose-300 dark:border-rose-900/60 shadow-elevated p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-navy dark:text-slate-100">
                Delete Temperature Record?
              </h3>
              <p className="text-xs text-muted-foreground">
                Delete log <strong>{deletingLog.id}</strong> ({deletingLog.temperature}°C) for {deletingLog.patientName}? The patient's latest temperature will be automatically recalculated from their remaining history.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <Button variant="outline" size="sm" onClick={() => setDeletingLog(null)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteConfirm}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
