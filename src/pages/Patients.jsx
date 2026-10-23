import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Bed,
  Clock,
  ArrowUpDown,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Eye,
  X,
  Thermometer,
  Stethoscope,
  Building2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useApp, TOTAL_FACILITY_BEDS } from "../context/AppContext";

const NURSE_OPTIONS = [
  "Nurse Clara Zhang",
  "Nurse James Wilson",
  "Nurse Emily Clark",
  "Nurse Tenzin Dorjee",
  "Nurse Rachel Adams",
];

const DOCTOR_OPTIONS = [
  "Dr. Marcus Chen",
  "Dr. Elena Rostova",
  "Dr. Sarah Jenkins",
];

export function Patients() {
  const {
    patients,
    activePatients,
    occupiedBedsCount,
    availableBedsCount,
    occupiedBedNumbers,
    addPatient,
    updatePatient,
    deletePatient,
    dischargePatient,
    currentUser,
    temperatureLogs,
    doctorVisits,
  } = useApp();

  // Search, Filters & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [tempFilter, setTempFilter] = useState("ALL");
  const [docFilter, setDocFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("admissionDate");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewPatient, setViewPatient] = useState(null);
  const [editPatient, setEditPatient] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // Form notifications / alerts
  const [alertFeedback, setAlertFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  // Form State
  const initialForm = {
    patientId: "",
    name: "",
    age: "",
    gender: "Male",
    bedNumber: "",
    admissionDate: new Date().toISOString().split("T")[0],
    assignedNurse: NURSE_OPTIONS[0],
    assignedDoctor: DOCTOR_OPTIONS[0],
    status: "ACTIVE",
    latestTemperature: "36.8",
    priority: "Low",
    notes: "Admitted for standard observation.",
  };

  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState("");

  const isAtFullCapacity = occupiedBedsCount >= TOTAL_FACILITY_BEDS;

  // Available beds for selection dropdown (B-01 to B-74 that are not active)
  const availableBedsList = useMemo(() => {
    const list = [];
    for (let i = 1; i <= TOTAL_FACILITY_BEDS; i++) {
      const b = `B-${String(i).padStart(2, "0")}`;
      if (!occupiedBedNumbers.has(b)) {
        list.push(b);
      }
    }
    return list;
  }, [occupiedBedNumbers]);

  // Filtered & Sorted Patients
  const filteredPatients = useMemo(() => {
    return patients
      .filter((pt) => {
        const matchesSearch =
          pt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pt.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pt.bedNumber.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === "ALL" ? true : pt.status === statusFilter;

        const matchesTemp =
          tempFilter === "ALL" ? true : pt.temperatureStatus === tempFilter;

        const matchesDoc =
          docFilter === "ALL" ? true : pt.doctorVisitStatus === docFilter;

        return matchesSearch && matchesStatus && matchesTemp && matchesDoc;
      })
      .sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (sortBy === "latestTemperature" || sortBy === "age") {
          valA = Number(valA);
          valB = Number(valB);
        } else {
          valA = String(valA).toLowerCase();
          valB = String(valB).toLowerCase();
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [patients, searchQuery, statusFilter, tempFilter, docFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredPatients.length / pageSize) || 1;
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenAddModal = () => {
    setFormError("");
    const nextIdNum = 1000 + patients.length + 1;
    setFormData({
      ...initialForm,
      patientId: `PT-${nextIdNum}`,
      bedNumber: availableBedsList[0] || "",
    });
    setAddModalOpen(true);
  };

  const handleCreatePatient = (e) => {
    e.preventDefault();
    setFormError("");

    // Validate age
    const ageNum = Number(formData.age);
    if (!ageNum || ageNum < 1 || ageNum > 120) {
      setFormError("Age must be a valid number between 1 and 120.");
      return;
    }

    // Validate temperature
    const tempNum = Number(formData.latestTemperature);
    if (!tempNum || tempNum < 34.0 || tempNum > 43.0) {
      setFormError("Temperature must be a valid reading between 34.0°C and 43.0°C.");
      return;
    }

    if (!formData.bedNumber) {
      setFormError("A bed number must be assigned.");
      return;
    }

    const priority = tempNum >= 38.0 ? "High" : tempNum >= 37.3 ? "Medium" : "Low";

    const res = addPatient({
      ...formData,
      priority,
      temperatureStatus: "Pending",
      doctorVisitStatus: "Pending",
    });

    if (res.success) {
      setAddModalOpen(false);
      setAlertFeedback({
        type: "success",
        message: `Patient ${formData.name} (${formData.patientId.toUpperCase()}) successfully admitted to bed ${formData.bedNumber}.`,
      });
      setTimeout(() => setAlertFeedback(null), 4000);
    } else {
      setFormError(res.error);
    }
  };

  const handleOpenEditModal = (patient) => {
    setFormError("");
    setEditPatient(patient);
    setFormData({
      ...patient,
    });
  };

  const handleUpdatePatient = (e) => {
    e.preventDefault();
    setFormError("");

    const ageNum = Number(formData.age);
    if (!ageNum || ageNum < 1 || ageNum > 120) {
      setFormError("Age must be a valid number between 1 and 120.");
      return;
    }

    const tempNum = Number(formData.latestTemperature);
    if (!tempNum || tempNum < 34.0 || tempNum > 43.0) {
      setFormError("Temperature must be a valid reading between 34.0°C and 43.0°C.");
      return;
    }

    const priority = tempNum >= 38.0 ? "High" : tempNum >= 37.3 ? "Medium" : "Low";

    const res = updatePatient(editPatient.patientId, {
      ...formData,
      priority,
    });

    if (res.success) {
      setEditPatient(null);
      setAlertFeedback({
        type: "success",
        message: `Patient record for ${formData.name} (${editPatient.patientId}) updated successfully.`,
      });
      setTimeout(() => setAlertFeedback(null), 4000);
    } else {
      setFormError(res.error);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteCandidate) return;
    deletePatient(deleteCandidate.patientId);
    setAlertFeedback({
      type: "success",
      message: `Patient ${deleteCandidate.name} (${deleteCandidate.patientId}) was removed from the registry.`,
    });
    setDeleteCandidate(null);
    setTimeout(() => setAlertFeedback(null), 4000);
  };

  const handleDischargeFromTable = (patient) => {
    dischargePatient(patient.patientId);
    setAlertFeedback({
      type: "success",
      message: `Patient ${patient.name} (${patient.patientId}) marked as DISCHARGED. Bed ${patient.bedNumber} is now freed.`,
    });
    setTimeout(() => setAlertFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Patient Management & Registry"
        description="Comprehensive quarantine registry with centralized bed assignments, clinical status, and attending team records."
        breadcrumbs={[
          { label: "QuarantineOS", href: "/dashboard" },
          { label: "Clinical Operations" },
          { label: "Patients" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={UserPlus}
              onClick={handleOpenAddModal}
              disabled={isAtFullCapacity}
              title={isAtFullCapacity ? "Facility is at maximum capacity (74/74 beds occupied)" : "Admit new patient"}
            >
              Admit Patient
            </Button>
          </div>
        }
      />

      {/* Capacity & Feedback Alerts */}
      {isAtFullCapacity && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <strong className="font-bold">Facility Capacity Limit Reached:</strong> All {TOTAL_FACILITY_BEDS} isolation beds are currently occupied. New patient admission is locked until an active patient is discharged.
            </div>
          </div>
          <span className="font-mono text-[11px] font-bold text-amber-800 dark:text-amber-300 shrink-0 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
            BEDS: 74/74 (0 FREE)
          </span>
        </div>
      )}

      {alertFeedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-2 animate-in fade-in duration-150 ${
            alertFeedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : "bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {alertFeedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{alertFeedback.message}</span>
          </div>
          <button
            onClick={() => setAlertFeedback(null)}
            className="p-1 hover:opacity-75"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search, Filters, and Sorting Controls */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-card p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, ID (e.g. PT-1001), or bed (B-01)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-secondary/40 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            />
          </div>

          {/* Sorter */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-secondary/50 border border-border/80 rounded-xl px-2.5 py-1.5 text-foreground focus:outline-none"
            >
              <option value="admissionDate">Admission Date</option>
              <option value="name">Patient Name</option>
              <option value="latestTemperature">Temperature</option>
              <option value="bedNumber">Bed Number</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-1.5 rounded-lg border border-border/80 bg-secondary/40 hover:bg-secondary text-xs font-mono"
              title={`Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
            >
              {sortOrder === "asc" ? "▲ ASC" : "▼ DESC"}
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/60 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-secondary/40 border border-border/70 rounded-lg px-2 py-1 text-xs"
            >
              <option value="ALL">All ({patients.length})</option>
              <option value="ACTIVE">Active ({activePatients.length})</option>
              <option value="DISCHARGE_READY">Discharge Ready</option>
              <option value="DISCHARGED">Discharged</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-medium">Temp Check:</span>
            <select
              value={tempFilter}
              onChange={(e) => {
                setTempFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-secondary/40 border border-border/70 rounded-lg px-2 py-1 text-xs"
            >
              <option value="ALL">All Checks</option>
              <option value="Pending">Pending Checks</option>
              <option value="Completed">Completed Checks</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-medium">Doctor Visit:</span>
            <select
              value={docFilter}
              onChange={(e) => {
                setDocFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-secondary/40 border border-border/70 rounded-lg px-2 py-1 text-xs"
            >
              <option value="ALL">All Visits</option>
              <option value="Pending">Pending Round</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="ml-auto text-xs text-muted-foreground">
            Showing <strong>{filteredPatients.length}</strong> matching patients
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/70">
              <tr>
                <th scope="col" className="py-3.5 px-4">Patient Profile</th>
                <th scope="col" className="py-3.5 px-3">Bed</th>
                <th scope="col" className="py-3.5 px-3">Admission</th>
                <th scope="col" className="py-3.5 px-3">Latest Temp</th>
                <th scope="col" className="py-3.5 px-3">Temp Status</th>
                <th scope="col" className="py-3.5 px-3">Doctor Visit</th>
                <th scope="col" className="py-3.5 px-3">Patient Status</th>
                <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground text-sm">
                    No patient records match the selected query and filters.
                  </td>
                </tr>
              ) : (
                paginatedPatients.map((patient) => {
                  const isFebrile = Number(patient.latestTemperature) >= 38.0;
                  return (
                    <tr
                      key={patient.patientId}
                      className="hover:bg-secondary/40 transition-colors group"
                    >
                      {/* Name & ID */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-bold flex items-center justify-center text-xs shrink-0 border border-cyan-500/20">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-navy dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                              {patient.name}
                            </div>
                            <div className="font-mono text-xs text-muted-foreground">
                              {patient.patientId} • {patient.age} yrs • {patient.gender}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Bed Number */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-navy dark:text-slate-200 bg-secondary px-2 py-0.5 rounded-md border border-border/60">
                          <Bed className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                          {patient.bedNumber}
                        </span>
                      </td>

                      {/* Admission Date */}
                      <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap">
                        {patient.admissionDate}
                      </td>

                      {/* Latest Temp */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                            isFebrile
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300"
                              : "bg-secondary text-foreground"
                          }`}
                        >
                          {patient.latestTemperature}°C
                        </span>
                      </td>

                      {/* Temp Check Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={patient.temperatureStatus} size="sm" />
                      </td>

                      {/* Doctor Visit Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={patient.doctorVisitStatus} size="sm" />
                      </td>

                      {/* Patient Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {patient.status === "ACTIVE" ? (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                            ACTIVE
                          </span>
                        ) : patient.status === "DISCHARGE_READY" ? (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 animate-pulse">
                            DISCHARGE READY
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            DISCHARGED
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewPatient(patient)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-600 hover:bg-secondary transition-colors"
                            title="View Chart"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(patient)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-600 hover:bg-secondary transition-colors"
                            title="Edit Patient"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {patient.status !== "DISCHARGED" && (
                            <button
                              onClick={() => handleDischargeFromTable(patient)}
                              className="px-2 py-1 rounded-lg text-[11px] font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 transition-colors"
                              title="Mark Discharged"
                            >
                              Discharge
                            </button>
                          )}

                          <button
                            onClick={() => setDeleteCandidate(patient)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Patient Record"
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

        {/* Pagination Bar */}
        <div className="p-3.5 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-3 bg-secondary/30">
          <span className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages} ({filteredPatients.length} records total)
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

      {/* ADD PATIENT MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-card w-full max-w-xl rounded-2xl border border-border shadow-elevated overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-border/70 flex items-center justify-between bg-secondary/40">
              <div>
                <h3 className="text-base font-bold text-navy dark:text-slate-100">
                  Admit New Patient
                </h3>
                <p className="text-xs text-muted-foreground">
                  Record initial intake vitals and assign an isolation bed.
                </p>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                    Patient ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rachel Adams"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g. 38"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                    Gender *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                    Isolation Bed * ({availableBedsList.length} Available)
                  </label>
                  <select
                    value={formData.bedNumber}
                    onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  >
                    {availableBedsList.map((b) => (
                      <option key={b} value={b}>
                        {b} (Vacant)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                    Intake Temperature (°C) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={34.0}
                    max={43.0}
                    required
                    value={formData.latestTemperature}
                    onChange={(e) => setFormData({ ...formData, latestTemperature: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                    Assigned Nurse
                  </label>
                  <select
                    value={formData.assignedNurse}
                    onChange={(e) => setFormData({ ...formData, assignedNurse: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  >
                    {NURSE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                    Attending Physician
                  </label>
                  <select
                    value={formData.assignedDoctor}
                    onChange={(e) => setFormData({ ...formData, assignedDoctor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  >
                    {DOCTOR_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                  Intake Clinical Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>

              <div className="pt-3 border-t border-border/70 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Complete Admission
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PATIENT MODAL */}
      {editPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-card w-full max-w-xl rounded-2xl border border-border shadow-elevated overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-border/70 flex items-center justify-between bg-secondary/40">
              <div>
                <h3 className="text-base font-bold text-navy dark:text-slate-100">
                  Edit Patient Record: {editPatient.name}
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  {editPatient.patientId} • Bed {editPatient.bedNumber}
                </p>
              </div>
              <button
                onClick={() => setEditPatient(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePatient} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                    Bed Assignment
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bedNumber}
                    onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DISCHARGE_READY">DISCHARGE_READY</option>
                    <option value="DISCHARGED">DISCHARGED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                    Latest Temperature (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={34.0}
                    max={43.0}
                    required
                    value={formData.latestTemperature}
                    onChange={(e) => setFormData({ ...formData, latestTemperature: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                    Temperature Status
                  </label>
                  <select
                    value={formData.temperatureStatus}
                    onChange={(e) => setFormData({ ...formData, temperatureStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                    Doctor Visit Status
                  </label>
                  <select
                    value={formData.doctorVisitStatus}
                    onChange={(e) => setFormData({ ...formData, doctorVisitStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                    Attending Doctor
                  </label>
                  <select
                    value={formData.assignedDoctor}
                    onChange={(e) => setFormData({ ...formData, assignedDoctor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  >
                    {DOCTOR_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1">
                  Clinical Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary/30 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>

              <div className="pt-3 border-t border-border/70 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditPatient(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PATIENT DETAILS MODAL */}
      {viewPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-elevated overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-border/70 flex items-center justify-between bg-secondary/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 font-bold flex items-center justify-center text-sm border border-cyan-400/30">
                  {viewPatient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy dark:text-slate-100">
                    {viewPatient.name}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    {viewPatient.patientId} • Bed {viewPatient.bedNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewPatient(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-secondary/40 border border-border/60">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Age & Gender</span>
                  <span className="font-semibold text-navy dark:text-slate-200">
                    {viewPatient.age} years ({viewPatient.gender})
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Admission Date</span>
                  <span className="font-semibold text-navy dark:text-slate-200">
                    {viewPatient.admissionDate}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Assigned Nurse</span>
                  <span className="font-semibold text-navy dark:text-slate-200">
                    {viewPatient.assignedNurse}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Attending Doctor</span>
                  <span className="font-semibold text-navy dark:text-slate-200">
                    {viewPatient.assignedDoctor}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-secondary/30 border border-border/60">
                  <span className="text-[11px] text-muted-foreground block">Latest Temp</span>
                  <span className="text-base font-bold font-mono text-navy dark:text-slate-100">
                    {viewPatient.latestTemperature}°C
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-secondary/30 border border-border/60">
                  <span className="text-[11px] text-muted-foreground block">Temp Check</span>
                  <div className="pt-1">
                    <StatusBadge status={viewPatient.temperatureStatus} size="sm" />
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-secondary/30 border border-border/60">
                  <span className="text-[11px] text-muted-foreground block">Doctor Round</span>
                  <div className="pt-1">
                    <StatusBadge status={viewPatient.doctorVisitStatus} size="sm" />
                  </div>
                </div>
              </div>

              {/* Temperature History */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-navy dark:text-slate-200 uppercase tracking-wide block">
                  Temperature History & Surveillance Vitals
                </span>
                <div className="rounded-xl border border-border/70 overflow-hidden divide-y divide-border/60 max-h-36 overflow-y-auto">
                  {temperatureLogs.filter((l) => l.patientId === viewPatient.patientId).length === 0 ? (
                    <div className="p-2.5 text-center text-muted-foreground text-[11px]">
                      No previous temperature readings logged.
                    </div>
                  ) : (
                    temperatureLogs
                      .filter((l) => l.patientId === viewPatient.patientId)
                      .slice(0, 6)
                      .map((log) => (
                        <div key={log.id} className="p-2 px-3 flex items-center justify-between text-xs bg-secondary/20">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-navy dark:text-slate-100">
                              {log.temperature}°C
                            </span>
                            {log.temperature >= 38.0 && (
                              <span className="text-[10px] px-1 rounded bg-rose-100 text-rose-800 font-bold">
                                Fever
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
                      ))
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
                <span className="text-[11px] font-semibold text-navy dark:text-slate-200 uppercase tracking-wide block">
                  Clinical Surveillance Notes
                </span>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {viewPatient.notes || "Standard clinical protocol in effect. No complications noted."}
                </p>
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-border/60">
                <span className="text-[11px] text-muted-foreground font-mono">
                  QuarantineOS Facility Roster Record
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setViewPatient(null)}
                >
                  Close Chart
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-card w-full max-w-md rounded-2xl border border-rose-300 dark:border-rose-900/60 shadow-elevated p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-navy dark:text-slate-100">
                  Delete Patient Record?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to delete the record for <strong>{deleteCandidate.name}</strong> ({deleteCandidate.patientId})? This action will immediately release bed <strong>{deleteCandidate.bedNumber}</strong>.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteCandidate(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteConfirm}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
