import React, { useState, useMemo } from "react";
import {
  Stethoscope,
  ClipboardList,
  UserCheck,
  Clock,
  Calendar,
  AlertCircle,
  FileCheck,
  Search,
  Filter,
  Plus,
  Play,
  CheckCircle2,
  X,
  Edit2,
  Trash2,
  AlertTriangle,
  Flame,
  Bed,
  History,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useApp, DOCTORS, FEVER_THRESHOLD } from "../context/AppContext";

export function DoctorRounds() {
  const {
    activePatients,
    doctorVisits,
    addDoctorVisit,
    updateDoctorVisit,
    deleteDoctorVisit,
    temperatureLogs,
    currentUser,
    metrics,
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | PENDING | IN_PROGRESS | COMPLETED | OVERDUE
  const [doctorFilter, setDoctorFilter] = useState("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [activeConsultationVisit, setActiveConsultationVisit] = useState(null);
  const [rescheduleVisit, setRescheduleVisit] = useState(null);
  const [deleteCandidateVisit, setDeleteCandidateVisit] = useState(null);

  // Form states
  const [formPatientId, setFormPatientId] = useState("");
  const [formDoctorName, setFormDoctorName] = useState(currentUser?.name || DOCTORS[0]);
  const [formScheduledDate, setFormScheduledDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    return d.toISOString().slice(0, 16);
  });
  const [formNotes, setFormNotes] = useState("");
  const [formError, setFormError] = useState("");

  // Consultation active notes
  const [consultationNotes, setConsultationNotes] = useState("");
  const [feedback, setFeedback] = useState(null);

  // Filtered Visits
  const filteredVisits = useMemo(() => {
    return doctorVisits.filter((v) => {
      const matchesSearch =
        v.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.clinicalNotes && v.clinicalNotes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "ALL" ? true : v.status === statusFilter;
      const matchesDoctor = doctorFilter === "ALL" ? true : v.doctorName === doctorFilter;

      return matchesSearch && matchesStatus && matchesDoctor;
    });
  }, [doctorVisits, searchQuery, statusFilter, doctorFilter]);

  const totalPages = Math.ceil(filteredVisits.length / pageSize) || 1;
  const paginatedVisits = filteredVisits.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const selectedPatientForSchedule = useMemo(() => {
    return activePatients.find((p) => p.patientId === formPatientId) || null;
  }, [activePatients, formPatientId]);

  // Open Schedule Modal
  const handleOpenSchedule = (patient = null) => {
    setFormError("");
    setFormPatientId(patient ? patient.patientId : activePatients[0]?.patientId || "");
    setFormDoctorName(currentUser?.title === "Doctor" ? currentUser.name : DOCTORS[0]);
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    setFormScheduledDate(d.toISOString().slice(0, 16));
    setFormNotes("");
    setScheduleModalOpen(true);
  };

  const handleSaveNewVisit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!formPatientId) {
      setFormError("Please select a patient.");
      return;
    }

    const res = addDoctorVisit({
      patientId: formPatientId,
      doctorName: formDoctorName,
      scheduledAt: new Date(formScheduledDate).toISOString(),
      clinicalNotes: formNotes,
    });

    if (res.success) {
      setScheduleModalOpen(false);
      setFeedback({
        type: "success",
        message: `Clinical round consultation scheduled for ${res.visit.patientName} (${res.visit.patientId}).`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFormError(res.error);
    }
  };

  // Open Consultation Dialog
  const handleOpenConsultation = (visit) => {
    setActiveConsultationVisit(visit);
    setConsultationNotes(visit.clinicalNotes || "");
  };

  const handleStartConsultation = () => {
    if (!activeConsultationVisit) return;
    updateDoctorVisit(activeConsultationVisit.id, {
      status: "IN_PROGRESS",
    });
    setActiveConsultationVisit({
      ...activeConsultationVisit,
      status: "IN_PROGRESS",
    });
  };

  const handleCompleteConsultation = (e) => {
    e.preventDefault();
    if (!activeConsultationVisit) return;

    updateDoctorVisit(activeConsultationVisit.id, {
      status: "COMPLETED",
      clinicalNotes: consultationNotes,
    });

    setFeedback({
      type: "success",
      message: `Doctor round ${activeConsultationVisit.id} signed off for ${activeConsultationVisit.patientName}. Status marked COMPLETED.`,
    });
    setActiveConsultationVisit(null);
    setTimeout(() => setFeedback(null), 4000);
  };

  // Reschedule visit
  const handleOpenReschedule = (visit) => {
    setRescheduleVisit(visit);
    setFormScheduledDate(new Date(visit.scheduledAt).toISOString().slice(0, 16));
  };

  const handleSaveReschedule = (e) => {
    e.preventDefault();
    if (!rescheduleVisit) return;

    updateDoctorVisit(rescheduleVisit.id, {
      scheduledAt: new Date(formScheduledDate).toISOString(),
      status: "PENDING",
    });

    setFeedback({
      type: "success",
      message: `Visit ${rescheduleVisit.id} rescheduled to ${new Date(formScheduledDate).toLocaleString()}.`,
    });
    setRescheduleVisit(null);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDeleteConfirm = () => {
    if (!deleteCandidateVisit) return;
    deleteDoctorVisit(deleteCandidateVisit.id);
    setFeedback({
      type: "success",
      message: `Doctor round consultation ${deleteCandidateVisit.id} cancelled.`,
    });
    setDeleteCandidateVisit(null);
    setTimeout(() => setFeedback(null), 4000);
  };

  // Helper for active consultation patient temp info
  const consultationPatient = useMemo(() => {
    if (!activeConsultationVisit) return null;
    return activePatients.find((p) => p.patientId === activeConsultationVisit.patientId);
  }, [activePatients, activeConsultationVisit]);

  const consultationPatientLogs = useMemo(() => {
    if (!activeConsultationVisit) return [];
    return temperatureLogs
      .filter((l) => l.patientId === activeConsultationVisit.patientId)
      .slice(0, 5);
  }, [temperatureLogs, activeConsultationVisit]);

  const isDailyTempPending = useMemo(() => {
    if (!consultationPatient) return false;
    return (
      consultationPatient.temperatureStatus === "PENDING" ||
      consultationPatient.temperatureStatus === "Pending" ||
      consultationPatient.temperatureStatus === "OVERDUE"
    );
  }, [consultationPatient]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Attending Doctor Rounds & Consultations"
        description="Daily clinical evaluations, progression sign-offs, and treatment reviews for isolated patients."
        breadcrumbs={[
          { label: "QuarantineOS", href: "/dashboard" },
          { label: "Clinical Operations" },
          { label: "Doctor Rounds" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => handleOpenSchedule(null)}
            >
              Schedule Clinical Round
            </Button>
          </div>
        }
      />

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-2 animate-in fade-in duration-150 ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : "bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl border border-rose-200 dark:border-rose-900/60 p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-rose-700 dark:text-rose-400">
              Overdue Rounds
            </span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 dark:text-rose-300 mt-1">
            {metrics.overdueDoctorVisits} Overdue
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Passed scheduled examination hour
          </span>
        </div>

        <div className="bg-card rounded-2xl border border-amber-200 dark:border-amber-900/60 p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-amber-700 dark:text-amber-400">
              Pending Consultations
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">
            {metrics.pendingDoctorVisits} Pending
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Queued for today's shift
          </span>
        </div>

        <div className="bg-card rounded-2xl border border-emerald-200 dark:border-emerald-900/60 p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-emerald-700 dark:text-emerald-400">
              Completed Visits
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
            {metrics.completedDoctorVisits} Signed Off
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Clinical charting verified
          </span>
        </div>

        <div className="bg-card rounded-2xl border border-border/80 p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-muted-foreground">
              Total Scheduled Cohort
            </span>
            <Stethoscope className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold text-navy dark:text-slate-100 mt-1">
            {doctorVisits.length} Visits
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Active ward caseload
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
              placeholder="Search by visit ID, patient name, doctor, or notes..."
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
              <option value="ALL">All Visit Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="OVERDUE">Overdue</option>
            </select>

            <select
              value={doctorFilter}
              onChange={(e) => {
                setDoctorFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-secondary/40 border border-border/70 rounded-lg px-2.5 py-1.5"
            >
              <option value="ALL">All Physicians</option>
              {DOCTORS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs text-muted-foreground">
          <span>Showing <strong>{filteredVisits.length}</strong> doctor consultations</span>
          <span>Lead Attending: <strong>{currentUser?.title === "Doctor" ? currentUser.name : DOCTORS[0]}</strong></span>
        </div>
      </div>

      {/* Visits Table */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/70">
              <tr>
                <th scope="col" className="py-3 px-4">Visit ID</th>
                <th scope="col" className="py-3 px-3">Patient Profile</th>
                <th scope="col" className="py-3 px-3">Bed</th>
                <th scope="col" className="py-3 px-3">Scheduled Time</th>
                <th scope="col" className="py-3 px-3">Attending Doctor</th>
                <th scope="col" className="py-3 px-3">Visit Status</th>
                <th scope="col" className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedVisits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
                    No doctor round consultations match your search or filters.
                  </td>
                </tr>
              ) : (
                paginatedVisits.map((visit) => {
                  const isCompleted = visit.status === "COMPLETED";
                  const isInProgress = visit.status === "IN_PROGRESS";
                  const isOverdue = visit.status === "OVERDUE";
                  const schedDate = new Date(visit.scheduledAt);
                  const schedStr = schedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  const timeStr = schedDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

                  return (
                    <tr key={visit.id} className="hover:bg-secondary/40 transition-colors group">
                      <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                        {visit.id}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-navy dark:text-slate-100 block">
                          {visit.patientName}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {visit.patientId}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold bg-secondary px-2 py-0.5 rounded border border-border/60">
                          <Bed className="w-3 h-3 text-cyan-600" />
                          {visit.bedNumber}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-xs whitespace-nowrap">
                        <span className="font-medium text-navy dark:text-slate-200">{schedStr}</span>{" "}
                        <span className="font-mono text-muted-foreground">({timeStr})</span>
                      </td>

                      <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap">
                        {visit.doctorName}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            COMPLETED
                          </span>
                        ) : isInProgress ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 animate-pulse">
                            <Play className="w-3.5 h-3.5 text-cyan-600" />
                            IN PROGRESS
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            OVERDUE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            PENDING
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant={isCompleted ? "outline" : "primary"}
                            size="sm"
                            className="text-xs"
                            onClick={() => handleOpenConsultation(visit)}
                          >
                            {isCompleted ? "View Findings" : "Open Consultation"}
                          </Button>

                          {!isCompleted && (
                            <button
                              onClick={() => handleOpenReschedule(visit)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-600 hover:bg-secondary transition-colors"
                              title="Reschedule Visit"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => setDeleteCandidateVisit(visit)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Cancel / Delete Visit"
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
            Page {currentPage} of {totalPages} ({filteredVisits.length} visits total)
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

      {/* SCHEDULE DOCTOR VISIT MODAL */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-elevated overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-border/70 flex items-center justify-between bg-secondary/40">
              <div>
                <h3 className="text-base font-bold text-navy dark:text-slate-100">
                  Schedule Doctor Consultation
                </h3>
                <p className="text-xs text-muted-foreground">
                  Assign an attending physician for patient bedside examination.
                </p>
              </div>
              <button onClick={() => setScheduleModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewVisit} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                  Select Quarantined Patient *
                </label>
                <select
                  value={formPatientId}
                  onChange={(e) => setFormPatientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                >
                  {activePatients.map((p) => (
                    <option key={p.patientId} value={p.patientId}>
                      {p.name} ({p.patientId}) — Bed {p.bedNumber} ({p.latestTemperature}°C)
                    </option>
                  ))}
                </select>
              </div>

              {selectedPatientForSchedule && (
                <div className="p-3 rounded-xl bg-secondary/50 border border-border/70 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-navy dark:text-slate-100 block">
                      {selectedPatientForSchedule.name} ({selectedPatientForSchedule.patientId})
                    </span>
                    <span className="text-muted-foreground font-mono text-[11px]">
                      Bed {selectedPatientForSchedule.bedNumber} • Temp Status: [{selectedPatientForSchedule.temperatureStatus}]
                    </span>
                  </div>
                  <span className="font-mono font-bold text-navy dark:text-cyan-400">
                    {selectedPatientForSchedule.latestTemperature}°C
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                  Attending Physician *
                </label>
                <select
                  value={formDoctorName}
                  onChange={(e) => setFormDoctorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                >
                  {DOCTORS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                  Scheduled Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formScheduledDate}
                  onChange={(e) => setFormScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                  Clinical Examination Objectives / Reason
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Afebrile progression assessment, respiratory auscultation."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>

              <div className="pt-2 border-t border-border/70 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setScheduleModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Schedule Consultation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTIVE CONSULTATION DIALOG (SHOWS MISSING TEMP WARNING) */}
      {activeConsultationVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-elevated overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-border/70 flex items-center justify-between bg-secondary/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-sm">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy dark:text-slate-100">
                    Clinical Round: {activeConsultationVisit.patientName}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    {activeConsultationVisit.id} • Bed {activeConsultationVisit.bedNumber} • {activeConsultationVisit.patientId}
                  </p>
                </div>
              </div>
              <button onClick={() => setActiveConsultationVisit(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* CRITICAL WARNING: If today's temperature check is pending */}
              {isDailyTempPending && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-subtle animate-in fade-in">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <strong className="font-bold block">
                      Today's temperature has not been recorded yet.
                    </strong>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-normal">
                      The morning vitals batch is currently awaiting nurse screening. You may proceed with the examination and document clinical findings below.
                    </p>
                  </div>
                </div>
              )}

              {/* Patient Vitals Summary */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-secondary/40 border border-border/60">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Latest Recorded Temp</span>
                  <span className="font-mono text-base font-bold text-navy dark:text-slate-100">
                    {consultationPatient?.latestTemperature || "N/A"}°C
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Today's Vitals Status</span>
                  <div className="pt-0.5">
                    <StatusBadge status={consultationPatient?.temperatureStatus || "PENDING"} size="sm" />
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Attending Physician</span>
                  <span className="font-semibold text-navy dark:text-slate-200">
                    {activeConsultationVisit.doctorName}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Round Status</span>
                  <div className="pt-0.5">
                    <StatusBadge status={activeConsultationVisit.status} size="sm" />
                  </div>
                </div>
              </div>

              {/* Recent Temperature Logs */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-navy dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-cyan-600" />
                  Recent Temperature History ({consultationPatientLogs.length} readings)
                </span>

                <div className="rounded-xl border border-border/70 overflow-hidden divide-y divide-border/60 max-h-32 overflow-y-auto">
                  {consultationPatientLogs.length === 0 ? (
                    <div className="p-3 text-center text-muted-foreground text-xs">
                      No previous readings logged.
                    </div>
                  ) : (
                    consultationPatientLogs.map((l) => (
                      <div key={l.id} className="p-2 px-3 flex items-center justify-between text-xs bg-secondary/20">
                        <span className="font-mono font-bold text-navy dark:text-slate-100">
                          {l.temperature}°C {l.temperature >= FEVER_THRESHOLD && "⚠️"}
                        </span>
                        <span className="text-muted-foreground text-[11px]">
                          {new Date(l.recordedAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-muted-foreground text-[11px]">
                          by {l.recordedBy}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Doctor Consultation Notes Form */}
              <form onSubmit={handleCompleteConsultation} className="space-y-3 pt-2 border-t border-border/60">
                <div>
                  <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                    Physician Examination Findings & Clinical Orders *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={consultationNotes}
                    onChange={(e) => setConsultationNotes(e.target.value)}
                    placeholder="Document chest sounds, symptomatic clearance, or lab orders..."
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {activeConsultationVisit.status !== "IN_PROGRESS" && activeConsultationVisit.status !== "COMPLETED" && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      icon={Play}
                      onClick={handleStartConsultation}
                    >
                      Mark In Progress
                    </Button>
                  )}

                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveConsultationVisit(null)}
                    >
                      Close
                    </Button>
                    <Button type="submit" variant="primary" size="sm" icon={CheckCircle2}>
                      Sign Off & Complete Round
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {rescheduleVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-card w-full max-w-sm rounded-2xl border border-border shadow-elevated p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-navy dark:text-slate-100">
                Reschedule Visit: {rescheduleVisit.patientName}
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                {rescheduleVisit.id} • Bed {rescheduleVisit.bedNumber}
              </p>
            </div>

            <form onSubmit={handleSaveReschedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                  New Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formScheduledDate}
                  onChange={(e) => setFormScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                <Button variant="outline" size="sm" onClick={() => setRescheduleVisit(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Reschedule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE / CANCEL VISIT MODAL */}
      {deleteCandidateVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-card w-full max-w-sm rounded-2xl border border-rose-300 dark:border-rose-900/60 shadow-elevated p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-navy dark:text-slate-100">
                Cancel Doctor Consultation?
              </h3>
              <p className="text-xs text-muted-foreground">
                Are you sure you want to cancel consultation <strong>{deleteCandidateVisit.id}</strong> for {deleteCandidateVisit.patientName}?
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <Button variant="outline" size="sm" onClick={() => setDeleteCandidateVisit(null)}>
                Dismiss
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteConfirm}>
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
