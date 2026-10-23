// Realistic fictional Indian patient cohort for QuarantineOS
// Demonstrating the 3 complete fever-free days recovery rule, doctor review, and discharge management.

export const INDIAN_PATIENTS = [
  { name: "Aarav Sharma", age: 34, gender: "Male" },
  { name: "Priya Deshmukh", age: 29, gender: "Female" },
  { name: "Rohan Kulkarni", age: 42, gender: "Male" },
  { name: "Ananya Patil", age: 31, gender: "Female" },
  { name: "Sneha Iyer", age: 27, gender: "Female" },
  { name: "Rahul Nair", age: 38, gender: "Male" },
  { name: "Vikram Patel", age: 53, gender: "Male" },
  { name: "Neha Joshi", age: 25, gender: "Female" },
  { name: "Amit Verma", age: 46, gender: "Male" },
  { name: "Pooja Hegde", age: 33, gender: "Female" },
  { name: "Siddharth Rao", age: 39, gender: "Male" },
  { name: "Deepa Menon", age: 48, gender: "Female" },
  { name: "Arjun Reddy", age: 36, gender: "Male" },
  { name: "Kavita Pillai", age: 52, gender: "Female" },
  { name: "Manish Gupta", age: 41, gender: "Male" },
  { name: "Divya Sundaram", age: 30, gender: "Female" },
  { name: "Aditya Chatterjee", age: 35, gender: "Male" },
  { name: "Sunita Bhattacharya", age: 58, gender: "Female" },
  { name: "Karan Malhotra", age: 28, gender: "Male" },
  { name: "Meera Krishnan", age: 44, gender: "Female" },
  { name: "Gaurav Saxena", age: 37, gender: "Male" },
  { name: "Shweta Tiwari", age: 32, gender: "Female" },
  { name: "Nikhil Bansal", age: 40, gender: "Male" },
  { name: "Ritu Agrawal", age: 49, gender: "Female" },
  { name: "Varun Chopra", age: 26, gender: "Male" },
  { name: "Swati Sengupta", age: 35, gender: "Female" },
  { name: "Harsh Vardhan", age: 51, gender: "Male" },
  { name: "Preeti Mahajan", age: 43, gender: "Female" },
  { name: "Abhishek Nambiar", age: 33, gender: "Male" },
  { name: "Tanvi Kulkarni", age: 28, gender: "Female" },
  { name: "Rajesh Gokhale", age: 55, gender: "Male" },
  { name: "Geeta Venkatesh", age: 47, gender: "Female" },
  { name: "Pranav Mukhopadhyay", age: 31, gender: "Male" },
  { name: "Shruti Bharadwaj", age: 29, gender: "Female" },
  { name: "Alok Srivastava", age: 45, gender: "Male" },
  { name: "Pallavi Nanda", age: 36, gender: "Female" },
  { name: "Sameer Deshpande", age: 39, gender: "Male" },
  { name: "Radha Subramanian", age: 62, gender: "Female" },
  { name: "Kunal Ghosh", age: 34, gender: "Male" },
  { name: "Smita Deodhar", age: 40, gender: "Female" },
  { name: "Vivek Kamat", age: 42, gender: "Male" },
  { name: "Anuradha Shenoy", age: 50, gender: "Female" },
  { name: "Tarun Bajaj", age: 27, gender: "Male" },
  { name: "Ipsita Roy", age: 32, gender: "Female" },
  { name: "Bhavesh Mehta", age: 48, gender: "Male" },
  { name: "Kusum Parekh", age: 56, gender: "Female" },
  { name: "Sachin Tendulkar", age: 38, gender: "Male" },
  { name: "Rupal Shah", age: 30, gender: "Female" },
  { name: "Mayur Wagh", age: 35, gender: "Male" },
  { name: "Jayashree Rane", age: 54, gender: "Female" },
  { name: "Dinesh Prabhu", age: 43, gender: "Male" },
  { name: "Anita Bhat", age: 37, gender: "Female" },
  { name: "Santosh Naik", age: 46, gender: "Male" },
  { name: "Malini Pai", age: 41, gender: "Female" },
  { name: "Suresh Bhatia", age: 59, gender: "Male" },
  { name: "Rekha Singhal", age: 45, gender: "Female" },
  { name: "Girish Kotecha", age: 36, gender: "Male" },
  { name: "Bhavna Trivedi", age: 33, gender: "Female" },
  { name: "Ashwin Somani", age: 39, gender: "Male" },
  { name: "Archana Somaiya", age: 44, gender: "Female" },
  { name: "Hemant Oswal", age: 52, gender: "Male" },
  { name: "Nandini Mittal", age: 28, gender: "Female" },
  { name: "Chetan Doshi", age: 35, gender: "Male" },
  { name: "Mamta Sethi", age: 42, gender: "Female" },
  { name: "Lalit Gambhir", age: 49, gender: "Male" },
  { name: "Shalini Anand", age: 31, gender: "Female" },
  { name: "Pankaj Grover", age: 44, gender: "Male" },
  { name: "Monika Arora", age: 29, gender: "Female" },
  { name: "Deepak Chawla", age: 40, gender: "Male" },
  { name: "Komal Batra", age: 34, gender: "Female" },
  { name: "Vikas Ahuja", age: 38, gender: "Male" },
  { name: "Seema Juneja", age: 47, gender: "Female" },
  { name: "Sunil Duggal", age: 53, gender: "Male" },
  { name: "Jyoti Gulati", age: 36, gender: "Female" }
];

export const NURSES = [
  "Nurse Priya Sharma",
  "Nurse Sneha Iyer",
  "Nurse Pooja Menon"
];

export const DOCTORS = [
  "Dr. Ananya Deshmukh",
  "Dr. Rohan Kulkarni",
  "Dr. Kavya Nair",
  "Dr. Vikram Rao"
];

export function generateInitialPatients() {
  const patients = [];

  for (let i = 1; i <= 74; i++) {
    const padNum = String(i).padStart(2, "0");
    const bedNumber = `B-${padNum}`;
    const patientId = `QOS-${1000 + i}`;
    const profile = INDIAN_PATIENTS[i - 1] || { name: `Patient ${i}`, age: 35, gender: "Other" };
    
    // Admission date: 3 to 14 days ago
    const daysAgo = 3 + (i % 10);
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const admissionDate = date.toISOString().split("T")[0];

    const assignedNurse = NURSES[i % NURSES.length];
    const assignedDoctor = DOCTORS[i % DOCTORS.length];

    // Status: 
    // Patients 4, 11, 23: already doctor-approved for discharge (DISCHARGE_READY)
    // Patients 6, 16, 34: 3 fever-free days, awaiting doctor review
    const isApprovedReady = [4, 11, 23].includes(i);
    const isAwaitingReview = [6, 16, 34].includes(i);
    const status = isApprovedReady ? "DISCHARGE_READY" : "ACTIVE";

    // Latest temperature
    let latestTemperature;
    if ([1, 5, 14, 28, 42, 59].includes(i)) {
      latestTemperature = Number((38.0 + ((i % 12) * 0.1)).toFixed(1)); // Fever spike
    } else if (i % 4 === 0) {
      latestTemperature = Number((37.1 + ((i % 5) * 0.1)).toFixed(1));
    } else {
      latestTemperature = Number((36.4 + ((i % 8) * 0.1)).toFixed(1));
    }

    // Daily temperature check status
    const overdueList = [1, 7, 18, 40];
    const pendingList = [3, 12, 25, 31, 48, 55, 62, 70];
    let temperatureStatus = "COMPLETED";
    if (overdueList.includes(i)) {
      temperatureStatus = "OVERDUE";
    } else if (pendingList.includes(i)) {
      temperatureStatus = "PENDING";
    }

    // Doctor review status
    let doctorReviewStatus = "PENDING_ELIGIBILITY";
    let dischargeReadiness = "NOT_READY";
    let reviewNotes = "";
    let reviewedAt = null;
    let reviewedBy = null;

    if (isApprovedReady) {
      doctorReviewStatus = "APPROVED";
      dischargeReadiness = "READY";
      reviewNotes = "3 complete fever-free days verified with normal biomarkers. Cleared for discharge.";
      reviewedAt = new Date(Date.now() - 4 * 3600 * 1000).toISOString();
      reviewedBy = assignedDoctor;
    } else if (isAwaitingReview) {
      doctorReviewStatus = "AWAITING_REVIEW";
      dischargeReadiness = "NOT_READY";
      reviewNotes = "3 complete fever-free calendar days logged. Awaiting attending physician sign-off.";
    }

    let doctorVisitStatus = "COMPLETED";
    if ([1, 14].includes(i)) {
      doctorVisitStatus = "OVERDUE";
    } else if ([2, 19].includes(i)) {
      doctorVisitStatus = "IN_PROGRESS";
    } else if ([5, 8, 24, 28, 33, 39, 44, 49, 53, 58, 63, 66, 71, 74].includes(i)) {
      doctorVisitStatus = "PENDING";
    }

    const priority = latestTemperature >= 38.0 || [1, 14, 28].includes(i)
      ? "High"
      : [3, 7, 18, 31, 44].includes(i)
      ? "Medium"
      : "Low";

    patients.push({
      patientId,
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      bedNumber,
      admissionDate,
      assignedNurse,
      assignedDoctor,
      status, // "ACTIVE" | "DISCHARGE_READY" | "DISCHARGED"
      latestTemperature,
      temperatureStatus, // "PENDING" | "COMPLETED" | "OVERDUE"
      doctorVisitStatus, // "PENDING" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE"
      doctorReviewStatus, // "PENDING_ELIGIBILITY" | "AWAITING_REVIEW" | "APPROVED" | "CONTINUE_OBSERVATION" | "OVERRIDE_APPROVED"
      dischargeReadiness, // "NOT_READY" | "READY"
      reviewNotes,
      reviewedAt,
      reviewedBy,
      priority,
      notes: latestTemperature >= 38.0
        ? "Febrile spike observed. Monitored for respiratory indicators."
        : isApprovedReady
        ? "3 complete fever-free days protocol verified. Doctor signed off discharge readiness."
        : "Standard observation protocol. Vitals stable.",
      createdAt: new Date(Date.now() - daysAgo * 24 * 3600 * 1000).toISOString(),
    });
  }

  return patients;
}

export function generateInitialTemperatureLogs(patients) {
  const logs = [];
  let logIdCounter = 1001;

  patients.forEach((patient, idx) => {
    // Generate readings for 3 past calendar days:
    // Day -3 (e.g. Oct 20)
    // Day -2 (e.g. Oct 21)
    // Day -1 (e.g. Oct 22)
    // And Day 0 (today, Oct 23) if completed
    const isApprovedReady = [4, 11, 23].includes(idx + 1);
    const isAwaitingReview = [6, 16, 34].includes(idx + 1);
    const has3FeverFreeDays = isApprovedReady || isAwaitingReview || [9, 20, 30].includes(idx + 1);
    const hasRecentFever = [1, 5, 14, 28, 42, 59].includes(idx + 1);

    // Days -3, -2, -1
    for (let dayOffset = 3; dayOffset >= 1; dayOffset--) {
      const pastDate = new Date(Date.now() - dayOffset * 24 * 3600 * 1000);
      pastDate.setHours(9 + (idx % 3), (idx * 13) % 60, 0, 0);

      let dayTemp;
      if (has3FeverFreeDays) {
        // Guaranteed normal temperatures (< 38.0°C) across all 3 days
        dayTemp = Number((36.5 + ((idx + dayOffset) % 8) * 0.1).toFixed(1));
      } else if (hasRecentFever && dayOffset === 1) {
        // Fever yesterday (resets streak)
        dayTemp = Number((38.3 + ((idx % 7) * 0.1)).toFixed(1));
      } else if (idx % 3 === 0 && dayOffset === 2) {
        // Fever 2 days ago
        dayTemp = Number((38.1 + ((idx % 5) * 0.1)).toFixed(1));
      } else {
        dayTemp = Number((36.6 + ((idx + dayOffset) % 9) * 0.1).toFixed(1));
      }

      logs.push({
        id: `TMP-${logIdCounter++}`,
        patientId: patient.patientId,
        patientName: patient.name,
        bedNumber: patient.bedNumber,
        temperature: dayTemp,
        status: dayTemp >= 38.0 ? "ELEVATED" : "NORMAL",
        recordedAt: pastDate.toISOString(),
        recordedBy: patient.assignedNurse,
        notes: dayTemp >= 38.0 ? "Fever spike noted during routine check." : "Afebrile; stable vitals.",
      });
    }

    // Today's reading (Day 0) if completed
    if (patient.temperatureStatus === "COMPLETED" || patient.temperatureStatus === "Completed") {
      const todayDate = new Date();
      todayDate.setHours(8 + (idx % 4), (idx * 11) % 60, 0, 0);

      const temp = patient.latestTemperature;
      logs.push({
        id: `TMP-${logIdCounter++}`,
        patientId: patient.patientId,
        patientName: patient.name,
        bedNumber: patient.bedNumber,
        temperature: temp,
        status: temp >= 38.0 ? "ELEVATED" : "NORMAL",
        recordedAt: todayDate.toISOString(),
        recordedBy: patient.assignedNurse,
        notes: temp >= 38.0 ? "Patient warm to touch; oral antipyretic logged." : "Afebrile; standard morning screening.",
      });
    }
  });

  return logs.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
}

export function generateInitialDoctorVisits(patients) {
  const visits = [];
  let visitIdCounter = 2001;

  patients.forEach((patient, idx) => {
    if (idx % 2 === 0 || patient.priority === "High" || patient.status === "DISCHARGE_READY") {
      const isOverdue = patient.doctorVisitStatus === "OVERDUE";
      const isInProgress = patient.doctorVisitStatus === "IN_PROGRESS";
      const isPending = patient.doctorVisitStatus === "PENDING";
      const isCompleted = patient.doctorVisitStatus === "COMPLETED" || patient.doctorVisitStatus === "Completed";

      const scheduledDate = new Date();
      if (isOverdue) {
        scheduledDate.setHours(scheduledDate.getHours() - 3);
      } else if (isInProgress) {
        scheduledDate.setMinutes(scheduledDate.getMinutes() - 20);
      } else if (isPending) {
        scheduledDate.setHours(14 + (idx % 4), (idx * 15) % 60, 0, 0);
      } else {
        scheduledDate.setHours(9 + (idx % 3), (idx * 10) % 60, 0, 0);
      }

      visits.push({
        id: `VIS-${visitIdCounter++}`,
        patientId: patient.patientId,
        patientName: patient.name,
        bedNumber: patient.bedNumber,
        scheduledAt: scheduledDate.toISOString(),
        status: isOverdue ? "OVERDUE" : isInProgress ? "IN_PROGRESS" : isPending ? "PENDING" : "COMPLETED",
        doctorName: patient.assignedDoctor,
        clinicalNotes: isCompleted
          ? "Chest clear to auscultation. Symptoms resolving in line with recovery criteria."
          : isInProgress
          ? "Currently examining vitals, lung sounds, and checking swab status."
          : patient.notes || "Scheduled clinical progression evaluation.",
        completedAt: isCompleted ? scheduledDate.toISOString() : null,
      });
    }
  });

  return visits.sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));
}
