import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  HeartPulse,
  TrendingDown,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  Flame,
  UserCheck,
  AlertTriangle,
  Calendar,
  X,
  FileCheck,
  History,
  ShieldAlert,
  ArrowRight,
  Eye,
  Check,
  Bed,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useApp, FEVER_THRESHOLD, DOCTORS } from "../context/AppContext";

export function Recovery() {
  const {
    activePatients,
    patients,
    temperatureLogs,
    getPatientRecovery,
    submitDoctorRecoveryReview,
    currentUser,
  } = useApp();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("ALL"); // ALL | ELIGIBLE | AWAITING | ELEVATED | APPROVED
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Modals state
  const [reviewModalPatient, setReviewModalPatient] = useState(null);
  const [detailsModalPatient, setDetailsModalPatient] = useState(null);

  // Doctor review form state
  const [decision, setDecision] = useState("APPROVE_DISCHARGE"); // APPROVE_DISCHARGE | CONTINUE_OBSERVATION
  const [reviewNotes, setReviewNotes] = useState("");
  const [isOverride, setIsOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [feedback, setFeedback] = useState(null);

  // Compute recovery details for all active patients
  const patientsWithRecovery = useMemo(() => {
    return activePatients.map((patient) => {
      const recovery = getPatientRecovery(patient.patientId);
      return {
        ...patient,
        recovery,
      };
    });
  }, [activePatients, temperatureLogs]);

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patientsWithRecovery.filter((pt) => {
      const matchesSearch =
        pt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pt.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pt.bedNumber.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterMode === "ELIGIBLE") {
        return pt.recovery.isEligibleForReview;
      }
      if (filterMode === "AWAITING") {
        return pt.recovery.isEligibleForReview && pt.doctorReviewStatus !== "APPROVED" && pt.doctorReviewStatus !== "OVERRIDE_APPROVED";
      }
      if (filterMode === "ELEVATED") {
        return pt.recovery.todayHasFever || Number(pt.latestTemperature) >= FEVER_THRESHOLD;
      }
      if (filterMode === "APPROVED") {
        return pt.doctorReviewStatus === "APPROVED" || pt.doctorReviewStatus === "OVERRIDE_APPROVED" || pt.status === "DISCHARGE_READY";
      }
      return true;
    });
  }, [patientsWithRecovery, searchQuery, filterMode]);

  const totalPages = Math.ceil(filteredPatients.length / pageSize) || 1;
  const paginatedPatients = filteredPatients.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Summary counts
  const eligibleCount = patientsWithRecovery.filter((p) => p.recovery.isEligibleForReview).length;
  const awaitingReviewCount = patientsWithRecovery.filter(
    (p) => p.recovery.isEligibleForReview && p.doctorReviewStatus !== "APPROVED" && p.doctorReviewStatus !== "OVERRIDE_APPROVED"
  ).length;
  const approvedReadyCount = patientsWithRecovery.filter(
    (p) => p.status === "DISCHARGE_READY" || p.doctorReviewStatus === "APPROVED" || p.doctorReviewStatus === "OVERRIDE_APPROVED"
  ).length;
  const febrileCount = patientsWithRecovery.filter(
    (p) => p.recovery.todayHasFever || Number(p.latestTemperature) >= FEVER_THRESHOLD
  ).length;

  const handleOpenReviewModal = (patient) => {
    setReviewModalPatient(patient);
    setReviewError("");
    setDecision("APPROVE_DISCHARGE");
    setReviewNotes(patient.reviewNotes || "");
    setIsOverride(false);
    setOverrideReason("");
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    setReviewError("");

    if (!reviewModalPatient) return;

    const res = submitDoctorRecoveryReview(reviewModalPatient.patientId, {
      decision,
      reviewNotes,
      isOverride,
      overrideReason,
    });

    if (res.success) {
      setReviewModalPatient(null);
      setFeedback({
        type: "success",
        message: decision === "APPROVE_DISCHARGE"
          ? `Discharge readiness approved for ${reviewModalPatient.name} (${reviewModalPatient.patientId}). Patient marked READY for discharge.`
          : `Clinical observation continued for ${reviewModalPatient.name}. Decision recorded.`,
      });
      setTimeout(() => setFeedback(null), 5000);
    } else {
      setReviewError(res.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Patient Recovery Tracking"
        description="Clinical surveillance monitoring the three complete fever-free days rule, doctor recovery assessments, and discharge readiness clearance."
        breadcrumbs={[
          { label: "QuarantineOS", href: "/dashboard" },
          { label: "Clinical Operations" },
          { label: "Recovery Tracking" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/discharges">
              <Button variant="secondary" size="sm" iconRight={ArrowRight}>
                View Discharges ({approvedReadyCount})
              </Button>
            </Link>
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
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Recovery Rule Criteria Guide Banner */}
      <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-navy dark:text-slate-100 space-y-2 shadow-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <strong className="font-bold text-sm font-sans">
              Clinical Assessment Rule: Three Complete Fever-Free Calendar Days
            </strong>
          </div>
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-800 dark:text-cyan-300">
            THRESHOLD: &lt; 38.0°C
          </span>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Patients qualify for doctor recovery review only after <strong>three complete consecutive calendar days</strong> with valid recorded vitals strictly below <strong>38.0°C</strong>. Partial current days, missing checks, or conflicting elevated readings break the streak. Final discharge requires attending physician sign-off.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-analytical">
        <div className="bg-card rounded-2xl border border-cyan-200 dark:border-cyan-900/60 p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-muted-foreground">
              Eligible for Review
            </span>
            <CheckCircle2 className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold text-navy dark:text-slate-100 mt-1">
            {eligibleCount} Patients
          </div>
          <span className="text-[11px] text-cyan-700 dark:text-cyan-400 mt-0.5 block font-medium">
            3 fever-free days verified
          </span>
        </div>

        <div className="bg-card rounded-2xl border border-amber-200 dark:border-amber-900/60 p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-amber-700 dark:text-amber-400">
              Awaiting Doctor Review
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">
            {awaitingReviewCount} Queued
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Needs physician assessment
          </span>
        </div>

        <div className="bg-card rounded-2xl border border-emerald-200 dark:border-emerald-900/60 p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-emerald-700 dark:text-emerald-400">
              Discharge Approved
            </span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
            {approvedReadyCount} Ready
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Cleared for home departure
          </span>
        </div>

        <div className="bg-card rounded-2xl border border-rose-200 dark:border-rose-900/60 p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-rose-700 dark:text-rose-400">
              Active Fever Spikes
            </span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-700 dark:text-rose-400 mt-1">
            {febrileCount} Febrile
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Streak reset to 0 days
          </span>
        </div>
      </div>

      {/* Filter and Search Controls */}
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
              placeholder="Search by Indian name (Aarav, Priya), ID, or bed..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-secondary/40 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-secondary/40 p-1 rounded-xl border border-border/70 text-xs">
            <button
              onClick={() => { setFilterMode("ALL"); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterMode === "ALL" ? "bg-card text-foreground font-bold shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Active ({patientsWithRecovery.length})
            </button>
            <button
              onClick={() => { setFilterMode("ELIGIBLE"); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterMode === "ELIGIBLE" ? "bg-cyan-500 text-navy-950 font-bold shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Eligible (3 Days) ({eligibleCount})
            </button>
            <button
              onClick={() => { setFilterMode("AWAITING"); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterMode === "AWAITING" ? "bg-amber-500 text-white font-bold shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Awaiting Review ({awaitingReviewCount})
            </button>
            <button
              onClick={() => { setFilterMode("APPROVED"); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterMode === "APPROVED" ? "bg-emerald-500 text-white font-bold shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Approved Ready ({approvedReadyCount})
            </button>
            <button
              onClick={() => { setFilterMode("ELEVATED"); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterMode === "ELEVATED" ? "bg-rose-500 text-white font-bold shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Febrile ({febrileCount})
            </button>
          </div>
        </div>
      </div>

      {/* Patient Recovery Roster Table */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/70">
              <tr>
                <th scope="col" className="py-3 px-4">Patient Profile</th>
                <th scope="col" className="py-3 px-3">Bed</th>
                <th scope="col" className="py-3 px-3">Latest Temp</th>
                <th scope="col" className="py-3 px-3">Fever-Free Days</th>
                <th scope="col" className="py-3 px-3">Recovery Eligibility</th>
                <th scope="col" className="py-3 px-3">Doctor Review</th>
                <th scope="col" className="py-3 px-3">Discharge Status</th>
                <th scope="col" className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground text-sm">
                    No patient records match the selected recovery filter.
                  </td>
                </tr>
              ) : (
                paginatedPatients.map((patient) => {
                  const rec = patient.recovery;
                  const isElevated = Number(patient.latestTemperature) >= FEVER_THRESHOLD || rec.todayHasFever;
                  const isApproved = patient.doctorReviewStatus === "APPROVED" || patient.doctorReviewStatus === "OVERRIDE_APPROVED";
                  const isReady = patient.status === "DISCHARGE_READY";

                  return (
                    <tr key={patient.patientId} className="hover:bg-secondary/40 transition-colors group">
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

                      {/* Fever-Free Days with Visual Streak Indicator */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs">
                            {rec.consecutiveFeverFreeDays}/3 Days
                          </span>
                          <div className="flex gap-1">
                            {[1, 2, 3].map((step) => (
                              <div
                                key={step}
                                className={`w-2.5 h-2.5 rounded-full ${
                                  step <= rec.consecutiveFeverFreeDays
                                    ? "bg-cyan-500"
                                    : "bg-slate-200 dark:bg-slate-700"
                                }`}
                                title={`Day ${step} complete`}
                              />
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Recovery Eligibility Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {rec.isEligibleForReview ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                            <Sparkles className="w-3 h-3 text-cyan-600" />
                            Eligible for Review
                          </span>
                        ) : isElevated ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            <Flame className="w-3 h-3 text-rose-600" />
                            Active Fever (Reset)
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-muted-foreground">
                            {rec.eligibilityStatusText}
                          </span>
                        )}
                      </td>

                      {/* Doctor Review Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {patient.doctorReviewStatus === "APPROVED" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <Check className="w-3 h-3 text-emerald-600" />
                            APPROVED
                          </span>
                        ) : patient.doctorReviewStatus === "OVERRIDE_APPROVED" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                            OVERRIDE APPROVED
                          </span>
                        ) : patient.doctorReviewStatus === "CONTINUE_OBSERVATION" ? (
                          <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                            Observation Continued
                          </span>
                        ) : rec.isEligibleForReview ? (
                          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 animate-pulse">
                            Awaiting Doctor Review
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            Pending Eligibility
                          </span>
                        )}
                      </td>

                      {/* Discharge Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {isReady ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 animate-pulse">
                            DISCHARGE READY
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            Active Observation
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            icon={Eye}
                            onClick={() => setDetailsModalPatient(patient)}
                            title="View Recovery Timeline"
                          >
                            Timeline
                          </Button>

                          <Button
                            variant={rec.isEligibleForReview && !isApproved ? "primary" : "secondary"}
                            size="sm"
                            className="text-xs"
                            onClick={() => handleOpenReviewModal(patient)}
                          >
                            {isApproved ? "Review Record" : "Doctor Review"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3.5 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-3 bg-secondary/30">
          <span className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages} ({filteredPatients.length} patients)
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

      {/* DOCTOR RECOVERY REVIEW MODAL */}
      {reviewModalPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-elevated overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-border/70 flex items-center justify-between bg-secondary/40">
              <div>
                <h3 className="text-base font-bold text-navy dark:text-slate-100">
                  Doctor Recovery Assessment: {reviewModalPatient.name}
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  {reviewModalPatient.patientId} • Bed {reviewModalPatient.bedNumber}
                </p>
              </div>
              <button onClick={() => setReviewModalPatient(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="p-5 space-y-4 text-xs">
              {reviewError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{reviewError}</span>
                </div>
              )}

              {/* Recovery Rule Status Banner */}
              {reviewModalPatient.recovery.isEligibleForReview ? (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Three Complete Fever-Free Days Verified</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                    Qualifying Complete Days:{" "}
                    <strong>
                      {reviewModalPatient.recovery.qualifyingDays.map((d) => d.formattedDate).join(", ")}
                    </strong>
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Requirement Not Yet Met ({reviewModalPatient.recovery.consecutiveFeverFreeDays}/3 Days)</span>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300">
                    {reviewModalPatient.recovery.streakBrokenReason}
                  </p>
                </div>
              )}

              {/* Decision Radio */}
              <div className="space-y-2">
                <label className="block font-semibold text-navy dark:text-slate-200">
                  Clinical Assessment Decision *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision("APPROVE_DISCHARGE")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      decision === "APPROVE_DISCHARGE"
                        ? "bg-emerald-500/10 border-emerald-500 text-navy dark:text-slate-100 font-bold"
                        : "bg-secondary/40 border-border/80 text-muted-foreground"
                    }`}
                  >
                    <span className="block font-bold text-xs">Approve Discharge Readiness</span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      Clears patient for operational discharge
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision("CONTINUE_OBSERVATION")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      decision === "CONTINUE_OBSERVATION"
                        ? "bg-amber-500/10 border-amber-500 text-navy dark:text-slate-100 font-bold"
                        : "bg-secondary/40 border-border/80 text-muted-foreground"
                    }`}
                  >
                    <span className="block font-bold text-xs">Continue Observation</span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      Maintain daily vitals monitoring in bed
                    </span>
                  </button>
                </div>
              </div>

              {/* Authorized Override Option (If not eligible) */}
              {!reviewModalPatient.recovery.isEligibleForReview && decision === "APPROVE_DISCHARGE" && (
                <div className="p-3.5 rounded-xl border border-purple-300 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30 space-y-2">
                  <label className="flex items-center gap-2 font-bold text-purple-900 dark:text-purple-200">
                    <input
                      type="checkbox"
                      checked={isOverride}
                      onChange={(e) => setIsOverride(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Authorize Clinical Override for Early Clearance</span>
                  </label>
                  <p className="text-[11px] text-purple-800 dark:text-purple-300">
                    Bypasses the 3 fever-free days requirement based on clinical discretion. Requires mandatory documentation.
                  </p>

                  {isOverride && (
                    <div className="pt-1">
                      <label className="block text-[11px] font-semibold text-purple-900 dark:text-purple-200 mb-1">
                        Mandatory Override Justification *
                      </label>
                      <input
                        type="text"
                        required
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        placeholder="e.g. Non-infectious post-vaccination spike; clear antibody titer."
                        className="w-full px-3 py-2 rounded-xl text-xs bg-card border border-purple-300 dark:border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Review Notes */}
              <div>
                <label className="block font-semibold text-navy dark:text-slate-200 mb-1">
                  Physician Assessment Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Document clinical progression, symptom resolution, or medication adjustments..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>

              {/* Attending Physician Stamp */}
              <div className="p-2.5 rounded-xl bg-secondary/40 border border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Signing Physician: <strong>{currentUser?.title === "Doctor" ? currentUser.name : DOCTORS[0]}</strong></span>
                <span className="font-mono">Timestamp: {new Date().toLocaleTimeString()}</span>
              </div>

              <div className="pt-2 border-t border-border/70 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setReviewModalPatient(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Sign & Save Doctor Review
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECOVERY DETAILS & TIMELINE MODAL */}
      {detailsModalPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-elevated overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-border/70 flex items-center justify-between bg-secondary/40">
              <div>
                <h3 className="text-base font-bold text-navy dark:text-slate-100">
                  Recovery Progression Timeline: {detailsModalPatient.name}
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  {detailsModalPatient.patientId} • Bed {detailsModalPatient.bedNumber}
                </p>
              </div>
              <button onClick={() => setDetailsModalPatient(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Qualifying Streak Details */}
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-navy dark:text-slate-100">
                    Consecutive Fever-Free Days Streak
                  </span>
                  <span className="font-mono font-bold text-sm text-cyan-600 dark:text-cyan-400">
                    {detailsModalPatient.recovery.consecutiveFeverFreeDays} / 3 Days
                  </span>
                </div>

                <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden border border-border/60">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      detailsModalPatient.recovery.isEligibleForReview ? "bg-emerald-500" : "bg-cyan-500"
                    }`}
                    style={{ width: `${Math.min(100, (detailsModalPatient.recovery.consecutiveFeverFreeDays / 3) * 100)}%` }}
                  />
                </div>

                {detailsModalPatient.recovery.qualifyingDays.length > 0 ? (
                  <div className="pt-2">
                    <span className="text-[11px] text-muted-foreground block font-medium mb-1">
                      Verified Complete Fever-Free Calendar Days:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {detailsModalPatient.recovery.qualifyingDays.map((d) => (
                        <span key={d.dateKey} className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono text-[11px] font-bold border border-emerald-300 dark:border-emerald-800">
                          ✓ {d.formattedDate} (Max: {d.maxTemp}°C)
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 pt-1">
                    {detailsModalPatient.recovery.streakBrokenReason}
                  </p>
                )}
              </div>

              {/* Recent Temperature History */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-navy dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-cyan-600" />
                  Temperature Screening Log History
                </span>

                <div className="rounded-xl border border-border/70 overflow-hidden divide-y divide-border/60 max-h-48 overflow-y-auto">
                  {temperatureLogs.filter((l) => l.patientId === detailsModalPatient.patientId).length === 0 ? (
                    <div className="p-3 text-center text-muted-foreground text-xs">
                      No vitals records available.
                    </div>
                  ) : (
                    temperatureLogs
                      .filter((l) => l.patientId === detailsModalPatient.patientId)
                      .slice(0, 8)
                      .map((log) => {
                        const isFever = log.temperature >= FEVER_THRESHOLD;
                        return (
                          <div key={log.id} className="p-2 px-3 flex items-center justify-between text-xs bg-secondary/20">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-mono font-bold ${
                                  isFever ? "text-rose-600 dark:text-rose-400" : "text-navy dark:text-slate-100"
                                }`}
                              >
                                {log.temperature}°C
                              </span>
                              {isFever && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold">
                                  FEVER
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {new Date(log.recordedAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {log.recordedBy}
                            </span>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

              {/* Doctor Review Log if any */}
              {detailsModalPatient.reviewedAt && (
                <div className="p-3 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
                  <span className="text-[11px] font-bold text-navy dark:text-slate-200 uppercase tracking-wide block">
                    Doctor Review Record
                  </span>
                  <p className="text-muted-foreground text-xs">
                    {detailsModalPatient.reviewNotes}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono pt-1">
                    Reviewed by {detailsModalPatient.reviewedBy} on {new Date(detailsModalPatient.reviewedAt).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end border-t border-border/60">
                <Button variant="secondary" size="sm" onClick={() => setDetailsModalPatient(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
