import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Shield,
  RotateCcw,
  CheckCircle2,
  Bell,
  Database,
  Building,
} from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Button } from "../components/ui/Button";
import { useApp } from "../context/AppContext";
import {
  generateInitialPatients,
  generateInitialTemperatureLogs,
  generateInitialDoctorVisits,
} from "../data/seedData";

export function Settings() {
  const { currentUser } = useApp();
  const [resetDone, setResetDone] = useState(false);

  const handleResetData = () => {
    const initialPatients = generateInitialPatients();
    const initialLogs = generateInitialTemperatureLogs(initialPatients);
    const initialVisits = generateInitialDoctorVisits(initialPatients);

    localStorage.setItem("quarantineos_patients_v1", JSON.stringify(initialPatients));
    localStorage.setItem("quarantineos_temperature_logs_v1", JSON.stringify(initialLogs));
    localStorage.setItem("quarantineos_doctor_visits_v1", JSON.stringify(initialVisits));

    setResetDone(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Facility & Operations Settings"
        description="Quarantine protocol thresholds, surveillance telemetry configuration, and demo cohort data management."
        breadcrumbs={[
          { label: "QuarantineOS", href: "/dashboard" },
          { label: "Administration" },
          { label: "Settings" },
        ]}
      />

      {resetDone && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Demo state reset to initial 74 patients. Reloading workspace...</span>
        </div>
      )}

      {/* Quarantine Protocol Thresholds */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-card p-5 space-y-4">
        <SectionHeader
          title="Clinical Quarantine Parameters"
          description="Standard operational thresholds used across active isolation wards."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
            <span className="font-semibold text-navy dark:text-slate-200 block">
              Fever Spike Alert Threshold
            </span>
            <p className="text-muted-foreground">
              Temperatures at or above <strong>38.0°C</strong> trigger an immediate high-priority alert and prompt an attending physician evaluation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
            <span className="font-semibold text-navy dark:text-slate-200 block">
              Discharge Observation Period
            </span>
            <p className="text-muted-foreground">
              Patients must maintain an afebrile state without antipyretics for a minimum of <strong>48 continuous hours</strong> before clearance.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
            <span className="font-semibold text-navy dark:text-slate-200 block">
              Maximum Bed Capacity
            </span>
            <p className="text-muted-foreground">
              Hard ceiling set to <strong>74 isolation beds</strong> across Ward A and Ward B. New intakes are locked when occupancy reaches 100%.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
            <span className="font-semibold text-navy dark:text-slate-200 block">
              Routine Vitals Screening Cadence
            </span>
            <p className="text-muted-foreground">
              Twice-daily mandatory batches at <strong>08:00</strong> (Morning Shift) and <strong>14:00</strong> (Afternoon Shift).
            </p>
          </div>
        </div>
      </div>

      {/* Reset Demo State */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-card p-5 space-y-4">
        <SectionHeader
          title="Demo State Management"
          description="Reset or restore the demonstration patient population."
        />

        <div className="p-4 rounded-xl border border-border/80 bg-secondary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-navy dark:text-slate-100 block">
              Restore Initial 74 Active Patients Seed
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">
              Resets all modifications and restores the full 74-bed occupancy baseline.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleResetData}
            icon={RotateCcw}
          >
            Reset Sample Data
          </Button>
        </div>
      </div>
    </div>
  );
}
