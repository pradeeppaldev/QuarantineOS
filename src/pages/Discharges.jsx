import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BedDouble,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Building,
  CheckCircle2,
  X,
  Check,
  Search,
  Filter,
  FileCheck,
  Clock,
  History,
  AlertCircle,
  Eye,
  Bed,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useApp, TOTAL_FACILITY_BEDS, FEVER_THRESHOLD } from "../context/AppContext";

export function Discharges() {
  const {
    patients,
    activePatients,
    occupiedBedsCount,
    availableBedsCount,
    getPatientRecovery,
    processPatientDischarge,
    currentUser,
    temperatureLogs,
  } = useApp();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [viewTab, setViewTab] = useState("active_queue"); // active_queue | historical_discharged
  const [filterReadiness, setFilterReadiness] = useState("ALL"); // ALL | READY | AWAITING_APPROVAL | INELIGIBLE

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Discharge modal state
  const [dischargeModalPatient, setDischargeModalPatient] = useState(null);
  const [dischargeNotes, setDischargeNotes] = useState("");
  const [dischargeError, setDischargeError] = useState("");
  const [viewEligibilityPatient, setViewEligibilityPatient] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Compute recovery & discharge status for patients
  const processedPatients = useMemo(() => {
    return patients.map((patient) => {
      const recovery = getPatientRecovery(patient.patientId);
      const isApproved = patient.doctorReviewStatus === "APPROVED" || patient.doctorReviewStatus === "OVERRIDE_APPROVED";
      const isDischarged = patient.status === "DISCHARGED";
      const isReady = (patient.status === "DISCHARGE_READY" || isApproved) && !isDischarged && !recovery.todayHasFever;

      return {
        ...patient,
        recovery,
        isApproved,
        isDischarged,
        isReady,
      };
    });
  }, [patients, temperatureLogs]);

  // Active queue patients vs Historical discharged
  const activeQueue = useMemo(() => {
    return processedPatients.filter((p) => !p.isDischarged);
  }, [processedPatients]);

  const historicalDischarged = useMemo(() => {
    return processedPatients.filter((p) => p.isDischarged);
  }, [processedPatients]);

  // Filtered list based on active tab
  const displayList = useMemo(() => {
    const sourceList = viewTab === "active_queue" ? activeQueue : historicalDischarged;

    return sourceList.filter((pt) => {
      const matchesSearch =
        pt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pt.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pt.bedNumber && pt.bedNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (viewTab === "active_queue" && filterReadiness !== "ALL") {
        if (filterReadiness === "READY") return pt.isReady;
        if (filterReadiness === "AWAITING_APPROVAL") return pt.recovery.isEligibleForReview && !pt.isApproved;
        if (filterReadiness === "INELIGIBLE") return !pt.recovery.isEligibleForReview;
      }

      return true;
    });
  }, [viewTab, activeQueue, historicalDischarged, searchQuery, filterReadiness]);

  const totalPages = Math.ceil(displayList.length / pageSize) || 1;
  const paginatedList = displayList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const readyForDischargeCount = activeQueue.filter((p) => p.isReady).length;

  const handleOpenDischarge = (patient) => {
    setDischargeModalPatient(patient);
    setDischargeError("");
    setDischargeNotes(`Patient completed mandatory 10-day quarantine and afebrile surveillance protocol. Discharged home in stable clinical condition.`);
  };

  const handleConfirmDischarge = (e) => {
    e.preventDefault();
    if (!dischargeModalPatient) return;

    const res = processPatientDischarge(dischargeModalPatient.patientId, {
      dischargeNotes,
    });

    if (res.success) {
      setDischargeModalPatient(null);
      setFeedback({
        type: "success",
        message: `Patient ${dischargeModalPatient.name} (${dischargeModalPatient.patientId}) successfully discharged. Bed ${dischargeModalPatient.bedNumber} is now freed and available for admissions.`,
      });
      setTimeout(() => setFeedback(null), 5000);
    } else {
      setDischargeError(res.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Discharge Management & Bed Turnover"
        description="Quarantine discharge orchestration, terminal bed sanitation, and departure audit authorizations."
        breadcrumbs={[
          { label: "QuarantineOS", href: "/dashboard" },
          { label: "Facility Management" },
          { label: "Discharges & Beds" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/recovery">
              <Button variant="secondary" size="sm" iconRight={ArrowRight}>
                Recovery Tracking
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

      {/* Bed Capacity & Turnover Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl border border-border/80 p-4 shadow-card">
          <span className="text-xs uppercase font-medium text-muted-foreground">
            Total Facility Beds
          </span>
          <div className="text-2xl font-bold text-navy dark:text-slate-100 mt-1">
            {TOTAL_FACILITY_BEDS} Beds
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Ward A (38) + Ward B (36)
          </span>
        </div>

        <div className="bg-card rounded-2xl border border-border/80 p-4 shadow-card">
          <span className="text-xs uppercase font-medium text-amber-700 dark:text-amber-400">
            Occupied Beds
          </span>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">
            {occupiedBedsCount} Active
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            {Math.round((occupiedBedsCount / TOTAL_FACILITY_BEDS) * 100)}% Current Census
          </span>
        </div>

        <div className="bg-card rounded-2xl border border-border/80 p-4 shadow-card">
          <span className="text-xs uppercase font-medium text-emerald-700 dark:text-emerald-400">
            Available Beds
          </span>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {availableBedsCount} Vacant
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Freed & ready for admission
          </span>
        </div>

        <div className="bg-card rounded-2xl border border-cyan-200 dark:border-cyan-900/60 p-4 shadow-card">
          <span className="text-xs uppercase font-medium text-cyan-800 dark:text-cyan-300">
            Ready for Discharge
          </span>
          <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-400 mt-1">
            {readyForDischargeCount} Patients
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Doctor approved & afebrile
          </span>
        </div>
      </div>

      {/* Tabs: Active Queue vs Historical Discharged */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-1">
        <button
          onClick={() => { setViewTab("active_queue"); setCurrentPage(1); }}
          className={`px-4 py-2 rounded-t-xl text-xs font-bold transition-colors border-b-2 -mb-1 flex items-center gap-2 ${
            viewTab === "active_queue"
              ? "border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-secondary/30"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>Active Patient Discharge Queue ({activeQueue.length})</span>
          {readyForDischargeCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-black">
              {readyForDischargeCount} Ready
            </span>
          )}
        </button>

        <button
          onClick={() => { setViewTab("historical_discharged"); setCurrentPage(1); }}
          className={`px-4 py-2 rounded-t-xl text-xs font-bold transition-colors border-b-2 -mb-1 flex items-center gap-2 ${
            viewTab === "historical_discharged"
              ? "border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-secondary/30"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Historical Discharges Archive ({historicalDischarged.length})</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
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
              placeholder="Search by patient name, ID, or bed..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-secondary/40 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            />
          </div>

          {viewTab === "active_queue" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Readiness:</span>
              <select
                value={filterReadiness}
                onChange={(e) => {
                  setFilterReadiness(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs bg-secondary/40 border border-border/70 rounded-lg px-2.5 py-1.5"
              >
                <option value="ALL">All Active Patients</option>
                <option value="READY">Discharge Ready ({readyForDischargeCount})</option>
                <option value="AWAITING_APPROVAL">Awaiting Doctor Approval</option>
                <option value="INELIGIBLE">Ineligible (&lt;3 Fever-Free Days)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/70">
              <tr>
                <th scope="col" className="py-3 px-4">Patient Profile</th>
                <th scope="col" className="py-3 px-3">Bed</th>
                <th scope="col" className="py-3 px-3">Admission</th>
                <th scope="col" className="py-3 px-3">3-Day Fever-Free</th>
                <th scope="col" className="py-3 px-3">Doctor Review Result</th>
                <th scope="col" className="py-3 px-3">Discharge Status</th>
                <th scope="col" className="py-3 px-4 text-right">Available Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
                    {viewTab === "active_queue"
                      ? "No patients match the selected discharge criteria."
                      : "No historical discharged patient records found."}
                  </td>
                </tr>
              ) : (
                paginatedList.map((patient) => {
                  const rec = patient.recovery;

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
                        {patient.isDischarged ? (
                          <span className="text-xs text-muted-foreground italic">Freed (Vacant)</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold bg-secondary px-2 py-0.5 rounded border border-border/60">
                            <Bed className="w-3 h-3 text-cyan-600" />
                            {patient.bedNumber}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap">
                        {patient.admissionDate}
                      </td>

                      {/* 3 Complete Fever-Free Days */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {rec.isRuleSatisfied ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            3/3 Days Met
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {rec.consecutiveFeverFreeDays}/3 Days ({rec.eligibilityStatusText})
                          </span>
                        )}
                      </td>

                      {/* Doctor Review Result */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {patient.doctorReviewStatus === "APPROVED" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <Check className="w-3 h-3" />
                            APPROVED FOR DISCHARGE
                          </span>
                        ) : patient.doctorReviewStatus === "OVERRIDE_APPROVED" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                            OVERRIDE APPROVED
                          </span>
                        ) : patient.doctorReviewStatus === "CONTINUE_OBSERVATION" ? (
                          <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                            Continue Observation
                          </span>
                        ) : rec.isRuleSatisfied ? (
                          <span className="text-xs text-amber-600 font-bold animate-pulse">
                            Awaiting Doctor Review
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Pending Eligibility
                          </span>
                        )}
                      </td>

                      {/* Discharge Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {patient.isDischarged ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                            <LogOut className="w-3.5 h-3.5 text-slate-500" />
                            DISCHARGED
                          </span>
                        ) : patient.isReady ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 animate-pulse">
                            READY FOR DISCHARGE
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Active Inpatient
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewEligibilityPatient(patient)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-600 hover:bg-secondary transition-colors"
                            title="View Discharge Eligibility Checklist"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {!patient.isDischarged && (
                            <Button
                              variant={patient.isReady ? "primary" : "secondary"}
                              size="sm"
                              className="text-xs"
                              disabled={!patient.isReady}
                              onClick={() => handleOpenDischarge(patient)}
                              title={
                                !patient.isReady
                                  ? "Requires 3 fever-free days and attending doctor approval before discharge"
                                  : "Authorize departure and free bed"
                              }
                            >
                              Authorize Discharge
                            </Button>
                          )}
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
            Page {currentPage} of {totalPages} ({displayList.length} patients)
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

      {/* DISCHARGE AUTHORIZATION CONFIRMATION MODAL */}
      {dischargeModalPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-card w-full max-w-md rounded-2xl border border-emerald-500/40 shadow-elevated p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-navy dark:text-slate-100">
                  Authorize Discharge: {dischargeModalPatient.name}
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  {dischargeModalPatient.patientId} • Bed {dischargeModalPatient.bedNumber}
                </p>
              </div>
            </div>

            {dischargeError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{dischargeError}</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doctor Clearance:</span>
                <span className="font-bold text-emerald-600">
                  {dischargeModalPatient.doctorReviewStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Consecutive Fever-Free Days:</span>
                <span className="font-mono font-bold text-navy dark:text-slate-100">
                  {dischargeModalPatient.recovery.consecutiveFeverFreeDays} Days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bed to be Vacated:</span>
                <span className="font-mono font-bold text-cyan-600">
                  Bed {dischargeModalPatient.bedNumber}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmDischarge} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-navy dark:text-slate-200 mb-1">
                  Discharge Summary & Release Instructions *
                </label>
                <textarea
                  rows={2}
                  required
                  value={dischargeNotes}
                  onChange={(e) => setDischargeNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-secondary/30 border border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Authorized Staff: <strong>{currentUser?.name || "Staff Member"}</strong></span>
                <span className="font-mono">{new Date().toLocaleTimeString()}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                <Button variant="outline" size="sm" onClick={() => setDischargeModalPatient(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" icon={UserCheck}>
                  Confirm Discharge & Free Bed
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ELIGIBILITY DETAILS MODAL */}
      {viewEligibilityPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-elevated p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div>
                <h3 className="text-base font-bold text-navy dark:text-slate-100">
                  Discharge Eligibility Audit: {viewEligibilityPatient.name}
                </h3>
                <span className="font-mono text-xs text-muted-foreground">
                  {viewEligibilityPatient.patientId} • Bed {viewEligibilityPatient.bedNumber}
                </span>
              </div>
              <button onClick={() => setViewEligibilityPatient(null)} className="p-1 text-slate-400 hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 space-y-2">
                <span className="font-bold text-navy dark:text-slate-100 block">
                  Mandatory Discharge Criteria Checklist
                </span>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-card">
                    <span>1. Three Complete Fever-Free Calendar Days (&lt;38.0°C)</span>
                    {viewEligibilityPatient.recovery.isRuleSatisfied ? (
                      <span className="font-bold text-emerald-600">PASSED (3/3)</span>
                    ) : (
                      <span className="font-bold text-rose-600">FAILED ({viewEligibilityPatient.recovery.consecutiveFeverFreeDays}/3)</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-card">
                    <span>2. Today's Reading Normal (No Active Fever Spike)</span>
                    {!viewEligibilityPatient.recovery.todayHasFever ? (
                      <span className="font-bold text-emerald-600">PASSED</span>
                    ) : (
                      <span className="font-bold text-rose-600">FAILED (Active Fever)</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-card">
                    <span>3. Attending Physician Review & Sign-off</span>
                    {viewEligibilityPatient.isApproved ? (
                      <span className="font-bold text-emerald-600">APPROVED</span>
                    ) : (
                      <span className="font-bold text-amber-600">PENDING DOCTOR</span>
                    )}
                  </div>
                </div>
              </div>

              {viewEligibilityPatient.reviewNotes && (
                <div className="p-3 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
                  <span className="font-bold text-navy dark:text-slate-100 block text-[11px]">
                    Doctor Assessment Log
                  </span>
                  <p className="text-muted-foreground">{viewEligibilityPatient.reviewNotes}</p>
                </div>
              )}

              {viewEligibilityPatient.dischargedAt && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1 text-emerald-900 dark:text-emerald-200">
                  <span className="font-bold block text-[11px]">Historical Discharge Record</span>
                  <p>Discharged on {new Date(viewEligibilityPatient.dischargedAt).toLocaleString()} by {viewEligibilityPatient.dischargedBy}</p>
                  <p className="text-[11px] italic">"{viewEligibilityPatient.dischargeNotes}"</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end border-t border-border/60">
              <Button variant="secondary" size="sm" onClick={() => setViewEligibilityPatient(null)}>
                Close Audit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
