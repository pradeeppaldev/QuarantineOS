import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  generateInitialPatients,
  generateInitialTemperatureLogs,
  generateInitialDoctorVisits,
  NURSES,
  DOCTORS,
} from "../data/seedData";
import { calculatePatientRecovery } from "../lib/recoveryRules";
import { DEMO_NOTIFICATIONS } from "../data/demoData";

const AppContext = createContext(null);

export const DEMO_ACCOUNTS = {
  nurse: {
    role: "nurse",
    username: "nurse.demo",
    password: "Nurse@123",
    name: "Nurse Priya Sharma, RN",
    title: "Nurse",
    badge: "Floor Lead — Ward B",
    avatar: "PS",
    description: "Vitals logging, shift observation, and routine bed care.",
  },
  doctor: {
    role: "doctor",
    username: "doctor.demo",
    password: "Doctor@123",
    name: "Dr. Ananya Deshmukh, MD",
    title: "Doctor",
    badge: "Attending Physician",
    avatar: "AD",
    description: "Clinical diagnoses, ward rounds, and discharge certifications.",
  },
  admin: {
    role: "admin",
    username: "admin.demo",
    password: "Admin@123",
    name: "Director Rajesh Nair, MHA",
    title: "Admin",
    badge: "Operations Director",
    avatar: "RN",
    description: "Facility logistics, bed allocation, and compliance oversight.",
  },
};

export const TOTAL_FACILITY_BEDS = 74;
export const FEVER_THRESHOLD = 38.0;
export { NURSES, DOCTORS };

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("quarantineos_theme");
    return saved === "dark" ? "dark" : "light";
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const session = localStorage.getItem("quarantineos_session");
    if (session) {
      try {
        return JSON.parse(session);
      } catch (e) {
        return null;
      }
    }
    return DEMO_ACCOUNTS.nurse;
  });

  // Shared Patients State (v2 with QOS IDs and updated Indian clinical staff)
  const [patients, setPatients] = useState(() => {
    const stored = localStorage.getItem("quarantineos_patients_v2");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse stored patients", e);
      }
    }
    const initial = generateInitialPatients();
    localStorage.setItem("quarantineos_patients_v2", JSON.stringify(initial));
    return initial;
  });

  // Shared Temperature Logs State
  const [temperatureLogs, setTemperatureLogs] = useState(() => {
    const stored = localStorage.getItem("quarantineos_temperature_logs_v2");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse stored temp logs", e);
      }
    }
    const initialLogs = generateInitialTemperatureLogs(patients);
    localStorage.setItem("quarantineos_temperature_logs_v2", JSON.stringify(initialLogs));
    return initialLogs;
  });

  // Shared Doctor Visits State
  const [doctorVisits, setDoctorVisits] = useState(() => {
    const stored = localStorage.getItem("quarantineos_doctor_visits_v2");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse stored visits", e);
      }
    }
    const initialVisits = generateInitialDoctorVisits(patients);
    localStorage.setItem("quarantineos_doctor_visits_v2", JSON.stringify(initialVisits));
    return initialVisits;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("quarantineos_notifications");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEMO_NOTIFICATIONS;
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Sync theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("quarantineos_theme", theme);
  }, [theme]);

  // Sync session
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("quarantineos_session", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("quarantineos_session");
    }
  }, [currentUser]);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem("quarantineos_patients_v2", JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem("quarantineos_temperature_logs_v2", JSON.stringify(temperatureLogs));
  }, [temperatureLogs]);

  useEffect(() => {
    localStorage.setItem("quarantineos_doctor_visits_v2", JSON.stringify(doctorVisits));
  }, [doctorVisits]);

  useEffect(() => {
    localStorage.setItem("quarantineos_notifications", JSON.stringify(notifications));
  }, [notifications]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const login = (username, password) => {
    const account = Object.values(DEMO_ACCOUNTS).find(
      (acc) => acc.username.trim() === username.trim() && acc.password === password
    );

    if (account) {
      setCurrentUser(account);
      return { success: true };
    }
    return { success: false, error: "Invalid username or password. Please use the demo credentials provided." };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("quarantineos_session");
  };

  // Bed and Occupancy Calculations
  const activePatients = useMemo(() => {
    return patients.filter((p) => p.status !== "DISCHARGED");
  }, [patients]);

  const occupiedBedsCount = activePatients.length;
  const availableBedsCount = Math.max(0, TOTAL_FACILITY_BEDS - occupiedBedsCount);
  const occupiedBedNumbers = useMemo(() => {
    return new Set(activePatients.map((p) => p.bedNumber));
  }, [activePatients]);

  // Helper to recalculate a patient's latest temperature based on logs
  const getPatientLatestTemp = (patientId, currentLogs = temperatureLogs) => {
    const patientLogs = currentLogs
      .filter((l) => l.patientId === patientId)
      .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
    if (patientLogs.length > 0) {
      return patientLogs[0].temperature;
    }
    return null;
  };

  // Dynamic Dashboard Metrics
  const metrics = useMemo(() => {
    const active = activePatients;
    const pendingTemp = active.filter((p) => p.temperatureStatus === "PENDING" || p.temperatureStatus === "Pending").length;
    const overdueTemp = active.filter((p) => p.temperatureStatus === "OVERDUE").length;
    const completedTemp = active.filter((p) => p.temperatureStatus === "COMPLETED" || p.temperatureStatus === "Completed").length;

    const pendingDoc = doctorVisits.filter((v) => v.status === "PENDING" || v.status === "OVERDUE" || v.status === "IN_PROGRESS").length;
    const completedDoc = doctorVisits.filter((v) => v.status === "COMPLETED").length;
    const overdueDoc = doctorVisits.filter((v) => v.status === "OVERDUE").length;

    const dischargeReady = active.filter(
      (p) => p.status === "DISCHARGE_READY" || p.doctorReviewStatus === "APPROVED" || p.doctorReviewStatus === "OVERRIDE_APPROVED"
    ).length;

    const eligibleForReview = active.filter((p) => {
      const rec = calculatePatientRecovery(p.patientId, temperatureLogs);
      return rec.isEligibleForReview && p.doctorReviewStatus !== "APPROVED" && p.doctorReviewStatus !== "OVERRIDE_APPROVED";
    }).length;

    const elevatedTemp = active.filter((p) => Number(p.latestTemperature) >= FEVER_THRESHOLD).length;
    const highPriority = active.filter((p) => p.priority === "High" || Number(p.latestTemperature) >= FEVER_THRESHOLD).length;

    return {
      activePatientsCount: active.length,
      totalBeds: TOTAL_FACILITY_BEDS,
      occupiedBeds: occupiedBedsCount,
      availableBeds: availableBedsCount,
      pendingTempChecks: pendingTemp,
      overdueTempChecks: overdueTemp,
      completedTempChecks: completedTemp,
      totalNeedTempChecks: pendingTemp + overdueTemp,
      pendingDoctorVisits: pendingDoc,
      completedDoctorVisits: completedDoc,
      overdueDoctorVisits: overdueDoc,
      dischargeReadyCount: dischargeReady,
      eligibleForReviewCount: eligibleForReview,
      elevatedTempCount: elevatedTemp,
      highPriorityCount: highPriority,
    };
  }, [activePatients, occupiedBedsCount, availableBedsCount, doctorVisits, temperatureLogs]);

  // -------------------------------------------------------------
  // TEMPERATURE LOGGING & DAILY CHECK ACTIONS
  // -------------------------------------------------------------
  const addTemperatureLog = ({ patientId, temperature, notes, recordedBy, recordedAt }) => {
    const val = Number(temperature);
    if (isNaN(val) || val < 30.0 || val > 45.0) {
      return { success: false, error: "Temperature must be a valid number between 30.0°C and 45.0°C." };
    }

    const patient = patients.find((p) => p.patientId === patientId);
    if (!patient) {
      return { success: false, error: "Patient record not found." };
    }

    const newLogId = `TMP-${Date.now().toString().slice(-5)}`;
    const isElevated = val >= FEVER_THRESHOLD;
    const logDate = recordedAt ? new Date(recordedAt).toISOString() : new Date().toISOString();

    const newLog = {
      id: newLogId,
      patientId: patient.patientId,
      patientName: patient.name,
      bedNumber: patient.bedNumber,
      temperature: val,
      status: isElevated ? "ELEVATED" : "NORMAL",
      recordedAt: logDate,
      recordedBy: recordedBy || currentUser?.name || "Staff Nurse",
      notes: notes || (isElevated ? "Elevated reading flagged for clinical round." : "Routine vitals recorded."),
    };

    const nextLogs = [newLog, ...temperatureLogs];
    setTemperatureLogs(nextLogs);

    // Update patient's latest temperature, mark daily check completed, update priority
    setPatients((prev) =>
      prev.map((p) => {
        if (p.patientId === patientId) {
          const newPriority = isElevated ? "High" : p.priority === "High" && val < FEVER_THRESHOLD ? "Medium" : p.priority;
          return {
            ...p,
            latestTemperature: val,
            temperatureStatus: "COMPLETED",
            priority: newPriority,
          };
        }
        return p;
      })
    );

    return { success: true, log: newLog };
  };

  const updateTemperatureLog = (logId, updatedFields) => {
    const targetLog = temperatureLogs.find((l) => l.id === logId);
    if (!targetLog) return { success: false, error: "Log record not found." };

    const val = updatedFields.temperature !== undefined ? Number(updatedFields.temperature) : targetLog.temperature;
    if (isNaN(val) || val < 30.0 || val > 45.0) {
      return { success: false, error: "Temperature must be a valid number between 30.0°C and 45.0°C." };
    }

    const isElevated = val >= FEVER_THRESHOLD;

    const nextLogs = temperatureLogs.map((l) => {
      if (l.id === logId) {
        return {
          ...l,
          ...updatedFields,
          temperature: val,
          status: isElevated ? "ELEVATED" : "NORMAL",
        };
      }
      return l;
    });

    setTemperatureLogs(nextLogs);

    // Recalculate patient's latest temperature from newest log
    const patientId = targetLog.patientId;
    const newestTemp = getPatientLatestTemp(patientId, nextLogs) || val;

    setPatients((prev) =>
      prev.map((p) => {
        if (p.patientId === patientId) {
          return {
            ...p,
            latestTemperature: newestTemp,
            priority: newestTemp >= FEVER_THRESHOLD ? "High" : p.priority,
          };
        }
        return p;
      })
    );

    return { success: true };
  };

  const deleteTemperatureLog = (logId) => {
    const targetLog = temperatureLogs.find((l) => l.id === logId);
    if (!targetLog) return { success: false, error: "Log not found." };

    const nextLogs = temperatureLogs.filter((l) => l.id !== logId);
    setTemperatureLogs(nextLogs);

    const patientId = targetLog.patientId;
    const remainingTemp = getPatientLatestTemp(patientId, nextLogs);

    setPatients((prev) =>
      prev.map((p) => {
        if (p.patientId === patientId) {
          return {
            ...p,
            latestTemperature: remainingTemp !== null ? remainingTemp : p.latestTemperature,
          };
        }
        return p;
      })
    );

    return { success: true };
  };

  const toggleDailyCheckStatus = (patientId) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.patientId === patientId) {
          const nextStatus = (p.temperatureStatus === "COMPLETED" || p.temperatureStatus === "Completed")
            ? "PENDING"
            : "COMPLETED";
          return {
            ...p,
            temperatureStatus: nextStatus,
          };
        }
        return p;
      })
    );
  };

  // -------------------------------------------------------------
  // DOCTOR ROUNDS & VISITS ACTIONS
  // -------------------------------------------------------------
  const addDoctorVisit = ({ patientId, doctorName, scheduledAt, clinicalNotes }) => {
    const patient = patients.find((p) => p.patientId === patientId);
    if (!patient) return { success: false, error: "Patient record not found." };

    const newVisitId = `VIS-${Date.now().toString().slice(-5)}`;
    const newVisit = {
      id: newVisitId,
      patientId: patient.patientId,
      patientName: patient.name,
      bedNumber: patient.bedNumber,
      scheduledAt: scheduledAt || new Date().toISOString(),
      status: "PENDING",
      doctorName: doctorName || patient.assignedDoctor || currentUser?.name || "Dr. Marcus Chen",
      clinicalNotes: clinicalNotes || "Scheduled clinical round.",
      completedAt: null,
    };

    setDoctorVisits((prev) => [newVisit, ...prev]);

    setPatients((prev) =>
      prev.map((p) => {
        if (p.patientId === patientId) {
          return {
            ...p,
            doctorVisitStatus: "PENDING",
          };
        }
        return p;
      })
    );

    return { success: true, visit: newVisit };
  };

  const updateDoctorVisit = (visitId, updatedFields) => {
    let affectedPatientId = null;
    let newStatus = null;

    setDoctorVisits((prev) =>
      prev.map((v) => {
        if (v.id === visitId) {
          affectedPatientId = v.patientId;
          newStatus = updatedFields.status || v.status;
          return {
            ...v,
            ...updatedFields,
            completedAt: updatedFields.status === "COMPLETED" ? new Date().toISOString() : v.completedAt,
          };
        }
        return v;
      })
    );

    if (affectedPatientId && newStatus) {
      setPatients((prev) =>
        prev.map((p) => {
          if (p.patientId === affectedPatientId) {
            return {
              ...p,
              doctorVisitStatus: newStatus,
            };
          }
          return p;
        })
      );
    }

    return { success: true };
  };

  const deleteDoctorVisit = (visitId) => {
    setDoctorVisits((prev) => prev.filter((v) => v.id !== visitId));
    return { success: true };
  };

  // -------------------------------------------------------------
  // PATIENT CRUD
  // -------------------------------------------------------------
  const addPatient = (patientData) => {
    if (occupiedBedsCount >= TOTAL_FACILITY_BEDS) {
      return {
        success: false,
        error: `Facility capacity limit reached (${TOTAL_FACILITY_BEDS}/${TOTAL_FACILITY_BEDS} beds). A patient must be discharged before a new patient can be admitted.`,
      };
    }

    const trimmedId = patientData.patientId.trim().toUpperCase();
    if (patients.some((p) => p.patientId.toUpperCase() === trimmedId)) {
      return {
        success: false,
        error: `Patient ID "${trimmedId}" is already assigned to an existing record.`,
      };
    }

    const bed = patientData.bedNumber.trim().toUpperCase();
    if (occupiedBedNumbers.has(bed)) {
      return {
        success: false,
        error: `Bed ${bed} is currently occupied by another active patient. Please choose an available bed.`,
      };
    }

    const newPatient = {
      ...patientData,
      patientId: trimmedId,
      bedNumber: bed,
      age: Number(patientData.age),
      latestTemperature: Number(patientData.latestTemperature),
      temperatureStatus: "PENDING",
      doctorVisitStatus: "PENDING",
      createdAt: new Date().toISOString(),
    };

    setPatients((prev) => [newPatient, ...prev]);

    // Also record initial intake temperature log
    addTemperatureLog({
      patientId: trimmedId,
      temperature: Number(patientData.latestTemperature),
      notes: "Intake baseline temperature recorded on admission.",
      recordedBy: patientData.assignedNurse || currentUser?.name,
    });

    return { success: true };
  };

  const updatePatient = (patientId, updatedFields) => {
    if (updatedFields.bedNumber) {
      const newBed = updatedFields.bedNumber.trim().toUpperCase();
      const existingWithBed = activePatients.find(
        (p) => p.bedNumber.toUpperCase() === newBed && p.patientId !== patientId
      );
      if (existingWithBed) {
        return {
          success: false,
          error: `Bed ${newBed} is already occupied by active patient ${existingWithBed.name} (${existingWithBed.patientId}).`,
        };
      }
    }

    setPatients((prev) =>
      prev.map((p) => {
        if (p.patientId === patientId) {
          return {
            ...p,
            ...updatedFields,
            age: updatedFields.age !== undefined ? Number(updatedFields.age) : p.age,
            latestTemperature:
              updatedFields.latestTemperature !== undefined
                ? Number(updatedFields.latestTemperature)
                : p.latestTemperature,
          };
        }
        return p;
      })
    );

    return { success: true };
  };

  const deletePatient = (patientId) => {
    setPatients((prev) => prev.filter((p) => p.patientId !== patientId));
    setTemperatureLogs((prev) => prev.filter((l) => l.patientId !== patientId));
    setDoctorVisits((prev) => prev.filter((v) => v.patientId !== patientId));
    return { success: true };
  };

  // Recovery & Discharge Workflow Actions
  const getPatientRecovery = (patientId) => {
    return calculatePatientRecovery(patientId, temperatureLogs);
  };

  const submitDoctorRecoveryReview = (patientId, { reviewNotes, decision, isOverride, overrideReason }) => {
    const patient = patients.find((p) => p.patientId === patientId);
    if (!patient) return { success: false, error: "Patient record not found." };

    const recoveryInfo = calculatePatientRecovery(patientId, temperatureLogs);

    if (decision === "APPROVE_DISCHARGE") {
      if (!recoveryInfo.isEligibleForReview && !isOverride) {
        return {
          success: false,
          error: `Patient has not completed 3 consecutive fever-free days (${recoveryInfo.consecutiveFeverFreeDays}/3 met). An authorized override reason is required to approve discharge.`,
        };
      }

      if (isOverride && (!overrideReason || !overrideReason.trim())) {
        return {
          success: false,
          error: "An explicit clinical override reason must be documented for premature discharge clearance.",
        };
      }

      const reviewStatus = isOverride ? "OVERRIDE_APPROVED" : "APPROVED";
      const fullNotes = isOverride
        ? `${reviewNotes || "Clinical clearance granted."} [AUTHORIZED OVERRIDE: ${overrideReason.trim()}]`
        : reviewNotes || "3 complete fever-free days verified. Cleared for discharge.";

      setPatients((prev) =>
        prev.map((p) => {
          if (p.patientId === patientId) {
            return {
              ...p,
              status: "DISCHARGE_READY",
              dischargeReadiness: "READY",
              doctorReviewStatus: reviewStatus,
              reviewNotes: fullNotes,
              reviewedAt: new Date().toISOString(),
              reviewedBy: currentUser?.name || "Dr. Marcus Chen",
            };
          }
          return p;
        })
      );

      return { success: true };
    } else {
      // Continue Observation
      setPatients((prev) =>
        prev.map((p) => {
          if (p.patientId === patientId) {
            return {
              ...p,
              status: "ACTIVE",
              dischargeReadiness: "NOT_READY",
              doctorReviewStatus: "CONTINUE_OBSERVATION",
              reviewNotes: reviewNotes || "Continued clinical observation ordered by attending physician.",
              reviewedAt: new Date().toISOString(),
              reviewedBy: currentUser?.name || "Dr. Marcus Chen",
            };
          }
          return p;
        })
      );

      return { success: true };
    }
  };

  const processPatientDischarge = (patientId, { dischargeNotes }) => {
    const patient = patients.find((p) => p.patientId === patientId);
    if (!patient) return { success: false, error: "Patient record not found." };

    if (patient.status === "DISCHARGED") {
      return { success: false, error: "Patient is already discharged." };
    }

    // Verify recovery or approval
    const recoveryInfo = calculatePatientRecovery(patientId, temperatureLogs);
    if (recoveryInfo.todayHasFever) {
      return {
        success: false,
        error: "Patient recorded an elevated fever reading today (>= 38.0°C). Discharge cannot proceed while febrile.",
      };
    }

    setPatients((prev) =>
      prev.map((p) => {
        if (p.patientId === patientId) {
          return {
            ...p,
            status: "DISCHARGED",
            dischargeReadiness: "DISCHARGED",
            dischargedAt: new Date().toISOString(),
            dischargedBy: currentUser?.name || "Operations Staff",
            dischargeNotes: dischargeNotes || "Standard quarantine protocol fulfilled. Discharged home.",
          };
        }
        return p;
      })
    );

    return { success: true };
  };

  const dischargePatient = (patientId) => {
    return processPatientDischarge(patientId, { dischargeNotes: "Discharged from facility." });
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        currentUser,
        login,
        logout,
        patients,
        activePatients,
        occupiedBedsCount,
        availableBedsCount,
        occupiedBedNumbers,
        metrics,
        temperatureLogs,
        addTemperatureLog,
        updateTemperatureLog,
        deleteTemperatureLog,
        toggleDailyCheckStatus,
        doctorVisits,
        addDoctorVisit,
        updateDoctorVisit,
        deleteDoctorVisit,
        addPatient,
        updatePatient,
        deletePatient,
        dischargePatient,
        getPatientRecovery,
        submitDoctorRecoveryReview,
        processPatientDischarge,
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
        markAllNotificationsAsRead,
        clearNotification,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileDrawerOpen,
        setMobileDrawerOpen,
        TOTAL_FACILITY_BEDS,
        FEVER_THRESHOLD,
        NURSES,
        DOCTORS,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
