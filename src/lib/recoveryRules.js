// Clinical Recovery Rules Engine for QuarantineOS
// Implements the Three Complete Fever-Free Days Rule for Quarantine Clearance.

export const FEVER_THRESHOLD = 38.0;

/**
 * Calculates the consecutive complete fever-free calendar days for a patient.
 *
 * Requirements:
 * - A patient is considered eligible for doctor review only after 3 full calendar days without fever.
 * - Fever threshold: >= 38.0°C.
 * - Current calendar day (today) is partial/in-progress and NEVER counts as a complete day.
 * - Every qualifying day must have at least one valid recorded temperature, and ALL readings on that day must be < 38.0°C.
 * - Any reading >= 38.0°C on a day breaks the streak.
 * - Missing days with no readings break the streak.
 *
 * @param {string} patientId
 * @param {Array} temperatureLogs - Full temperature logs array
 * @param {Date} [referenceDate] - Current date reference (defaults to now)
 * @returns {Object} Recovery status details
 */
export function calculatePatientRecovery(patientId, temperatureLogs = [], referenceDate = new Date()) {
  const patientLogs = temperatureLogs.filter((l) => l.patientId === patientId);

  // Group logs by local date string YYYY-MM-DD
  const logsByDate = {};
  patientLogs.forEach((log) => {
    const d = new Date(log.recordedAt);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!logsByDate[dateKey]) {
      logsByDate[dateKey] = [];
    }
    logsByDate[dateKey].push(log);
  });

  // Current today's local date string
  const todayKey = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, "0")}-${String(referenceDate.getDate()).padStart(2, "0")}`;

  // Evaluate today's current readings to detect if currently febrile
  const todayLogs = logsByDate[todayKey] || [];
  const todayHasFever = todayLogs.some((l) => Number(l.temperature) >= FEVER_THRESHOLD);
  const todayLatestTemp = todayLogs.length > 0 ? todayLogs[todayLogs.length - 1].temperature : null;

  // Walk backwards from yesterday (day - 1, day - 2, day - 3, ...)
  const qualifyingDays = [];
  let streakBrokenReason = null;

  for (let offset = 1; offset <= 30; offset++) {
    const targetDate = new Date(referenceDate);
    targetDate.setDate(targetDate.getDate() - offset);
    const dateKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}-${String(targetDate.getDate()).padStart(2, "0")}`;
    const formattedDate = targetDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    const dayLogs = logsByDate[dateKey];

    // If no readings on this complete day -> missing readings -> streak breaks!
    if (!dayLogs || dayLogs.length === 0) {
      if (!streakBrokenReason) {
        streakBrokenReason = `Missing temperature records on ${formattedDate}.`;
      }
      break;
    }

    // Check if any reading on this day was >= 38.0°C
    const elevatedLog = dayLogs.find((l) => Number(l.temperature) >= FEVER_THRESHOLD);
    if (elevatedLog) {
      if (!streakBrokenReason) {
        streakBrokenReason = `Fever reading recorded on ${formattedDate} (${elevatedLog.temperature}°C).`;
      }
      break;
    }

    // All readings on this day are strictly below 38.0°C!
    qualifyingDays.push({
      dateKey,
      formattedDate,
      readingsCount: dayLogs.length,
      maxTemp: Math.max(...dayLogs.map((l) => Number(l.temperature))),
      logs: dayLogs,
    });
  }

  const consecutiveFeverFreeDays = qualifyingDays.length;
  const isRuleSatisfied = consecutiveFeverFreeDays >= 3;

  // If today has a fever spike, it immediately prevents recovery eligibility
  const isEligibleForReview = isRuleSatisfied && !todayHasFever;

  let eligibilityStatusText = "In Progress";
  if (todayHasFever) {
    eligibilityStatusText = "Active Fever";
  } else if (isEligibleForReview) {
    eligibilityStatusText = "Eligible for Review";
  } else if (consecutiveFeverFreeDays === 2) {
    eligibilityStatusText = "2 of 3 Days Met";
  } else if (consecutiveFeverFreeDays === 1) {
    eligibilityStatusText = "1 of 3 Days Met";
  } else {
    eligibilityStatusText = "Monitoring (0 of 3 Days)";
  }

  return {
    patientId,
    consecutiveFeverFreeDays,
    isRuleSatisfied,
    isEligibleForReview,
    todayHasFever,
    todayLatestTemp,
    qualifyingDays: qualifyingDays.slice(0, 3), // Most recent 3 qualifying complete days
    streakBrokenReason: isEligibleForReview ? null : streakBrokenReason || "Fewer than three consecutive fever-free days recorded.",
    eligibilityStatusText,
  };
}
