# QuarantineOS 🏥
### Next-Generation Inpatient Isolation & Clinical Operations Platform

QuarantineOS is a modern, high-performance healthcare operations web application designed for quarantine facilities and inpatient isolation units. It unifies bed management, shift temperature monitoring, attending physician rounds, recovery tracking, and discharge clearance into a streamlined, role-specific workflow.

Built for the **Technical Product Manager** assessment.

---

## 🚀 Key Features

- **74-Bed Real-Time Capacity Tracking**: Enforces strict bed allocation limits (`B-01` to `B-74`) with instant bed filtering, status overview, and occupancy analytics.
- **Shift Temperature Logging (Celsius)**: Clinical-grade vitals logging with validation range (30.0°C – 45.0°C). Automatic color-coded visual alerts when temperature meets or exceeds the **38.0°C** fever threshold.
- **Three Complete Fever-Free Days Recovery Rule**: Deterministic algorithm tracking consecutive calendar days with normal temperatures (< 38.0°C). Any febrile spike automatically resets the recovery streak.
- **Attending Doctor Rounds & Sign-Off**: Daily rounds scheduling, bedside auscultation and symptoms evaluation, and formal medical clearance for discharge.
- **Role-Based Workspaces**: Tailored user experiences for:
  - 🩺 **Nurse Workspace** (`nurse.demo`): Daily bedside vitals sweeps, shift task checklists, and immediate febrile escalation.
  - 👨‍⚕️ **Doctor Workspace** (`doctor.demo`): Ward rounds checklist, patient progression review, and discharge authorization.
  - 📋 **Admin Operations** (`admin.demo`): Overall 74-bed logistics, bed turnaround times, audit logs, and compliance oversight.
- **Interactive Recharts Analytics**: Real-time charts covering bed occupancy distribution, daily vitals compliance, temperature distributions, and discharge trends.
- **100% Client-Side Persistence**: Fully functional without requiring an external database setup. All records persist seamlessly across sessions using browser `localStorage`.
- **Public Product Landing Page**: Responsive marketing introduction with live ward metrics snapshot, SOP timeline, clinical FAQ accordion, and inquiry form.

---

## 🔑 Demo Access Credentials

The application includes pre-configured demo profiles with realistic Indian clinical cohort data:

| Role | Username | Password | Attending Staff / Title |
| :--- | :--- | :--- | :--- |
| **Nurse** | `nurse.demo` | `Nurse@123` | Nurse Priya Sharma, RN (Floor Lead — Ward B) |
| **Doctor** | `doctor.demo` | `Doctor@123` | Dr. Ananya Deshmukh, MD (Attending Physician) |
| **Admin** | `admin.demo` | `Admin@123` | Director Rajesh Nair, MHA (Operations Director) |

*Clicking any demo role card on the `/login` screen automatically populates the credentials.*

---

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS with custom design system tokens
- **Icons**: Lucide React
- **Visual Analytics**: Recharts
- **Routing**: React Router DOM (v7)
- **Persistence**: LocalStorage with state hydration

---

## 📋 Clinical Recovery Algorithm

A patient is eligible for recovery certification **only after three full calendar days without fever**:
1. **Fever Threshold**: Standardized at **38.0°C**. A reading $\ge 38.0^\circ\text{C}$ indicates fever.
2. **Calendar Days**: The rule counts complete calendar days with afebrile readings.
3. **Streak Reset**: A fever recorded on any day resets the consecutive counter back to 0.
4. **Physician Review**: Once 3 consecutive fever-free days are achieved, the patient transitions to `AWAITING_REVIEW`. The attending doctor verifies biomarkers and signs off on `DISCHARGE_READY`.

---

## 💻 Local Setup & Development

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/pradeeppaldev/QuarantineOS.git

# Navigate into the project directory
cd QuarantineOS

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Production Build

```bash
# Compile and bundle for production
npm run build

# Preview production build locally
npm run preview
```

---

## 🔒 Privacy & Architecture Note

QuarantineOS operates entirely in the browser. No Protected Health Information (PHI), telemetry, or external network calls are made. All names, patient IDs (`QOS-1001` to `QOS-1074`), and medical data are simulated demonstrations for assessment purposes.

---

## 📄 License

MIT License. Developed for technical assessment evaluation.
