import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  BedDouble,
  Thermometer,
  ShieldCheck,
  Stethoscope,
  Users,
  FileCheck,
  BarChart3,
  Clock,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
  AlertTriangle,
  Mail,
  Send,
  ExternalLink,
  HeartPulse,
  Award,
  Layers,
  Lock,
} from "lucide-react";
import { useApp, TOTAL_FACILITY_BEDS, FEVER_THRESHOLD } from "../context/AppContext";

export function LandingPage() {
  const { theme, toggleTheme, patients, temperatureLogs } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    role: "Clinical Administrator",
    subject: "",
    message: "",
  });
  const [contactErrors, setContactErrors] = useState({});
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Fallback image helper
  const handleImgError = (e, fallbackText) => {
    e.target.onerror = null;
    e.target.src = `https://placehold.co/800x600/1F2C49/15C2D9?text=${encodeURIComponent(fallbackText)}`;
  };

  // Facility live stats computed from context
  const activePatients = patients ? patients.filter((p) => p.status !== "DISCHARGED") : [];
  const occupiedBeds = activePatients.length;
  const availableBeds = TOTAL_FACILITY_BEDS - occupiedBeds;
  const dischargeReadyCount = patients ? patients.filter((p) => p.status === "DISCHARGE_READY").length : 0;
  const febrileCount = patients ? patients.filter((p) => (p.latestTemperature || 0) >= FEVER_THRESHOLD).length : 0;

  // Contact form validation
  const handleContactSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!contactForm.name.trim()) errors.name = "Full name is required";
    if (!contactForm.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!contactForm.subject.trim()) errors.subject = "Subject is required";
    if (!contactForm.message.trim()) errors.message = "Message cannot be empty";

    if (Object.keys(errors).length > 0) {
      setContactErrors(errors);
      return;
    }

    setContactErrors({});
    setContactSubmitted(true);
  };

  const faqItems = [
    {
      q: "What is the three complete fever-free days recovery rule?",
      a: "According to strict clinical quarantine protocols, a patient is only eligible for recovery certification when their core body temperature has remained strictly afebrile (< 38.0°C) across three full consecutive calendar days. Any febrile reading (≥ 38.0°C) automatically resets the recovery counter to Day 0.",
    },
    {
      q: "Can QuarantineOS be evaluated without setting up a backend database?",
      a: "Yes. QuarantineOS is engineered as an entirely self-contained, enterprise-grade client-side application. It utilizes local browser storage with zero external dependencies, allowing technical evaluators and reviewers to test all clinical and administrative workflows immediately without database migrations.",
    },
    {
      q: "Which demo accounts and clinical roles are available for evaluation?",
      a: "Three pre-configured role profiles are available: Nurse (nurse.demo / Nurse@123) for daily bedside vitals logging; Doctor (doctor.demo / Doctor@123) for clinical rounds and discharge reviews; and Admin (admin.demo / Admin@123) for 74-bed capacity oversight and analytics.",
    },
    {
      q: "How does the 74-bed capacity constraint operate?",
      a: "The isolation ward has a hard limit of exactly 74 beds (B-01 through B-74). Bed allocations are synchronized across nurse and admin views. When all 74 beds are assigned, new admissions are halted with informative alerts until a patient is formally discharged.",
    },
    {
      q: "Are clinical temperatures recorded in Celsius or Fahrenheit?",
      a: "All clinical entries throughout QuarantineOS utilize Celsius (°C) with clinical boundary validations (30.0°C – 45.0°C). Normal ranges are color-coded in cool cyan and emerald, while readings at or above 38.0°C are immediately highlighted in amber/crimson.",
    },
    {
      q: "Can an attending physician override or advance a patient's discharge readiness?",
      a: "Yes. In the Doctor's Round and Recovery review workspace, an attending physician can review recent temperature logs and choose to either sign off on standard discharge readiness, request continued observation, or record a clinical override note with full audit history.",
    },
    {
      q: "Where is patient data stored and how is privacy preserved?",
      a: "All clinical records, temperature readings, and doctor visit logs reside entirely inside the browser's localStorage. Zero clinical information or user telemetry is transmitted across third-party networks, ensuring 100% confidential demonstration environments.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFEFE] dark:bg-[#0C121E] text-slate-800 dark:text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-700 dark:selection:text-cyan-300 transition-colors duration-200">
      {/* ========================================================
          1. STICKY HEADER & NAVIGATION
         ======================================================== */}
      <header className="sticky top-0 z-50 bg-[#FDFEFE]/95 dark:bg-[#0C121E]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-navy dark:bg-navy-900 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-sm transition-transform group-hover:scale-105">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-hero text-2xl font-bold tracking-tight text-navy dark:text-white leading-none">
                Quarantine<span className="text-cyan-500 dark:text-cyan-400">OS</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                Healthcare Operations
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <a
              href="#"
              className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors rounded-md"
            >
              Home
            </a>
            <a
              href="#about"
              className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors rounded-md"
            >
              About Us
            </a>
            <a
              href="#features"
              className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors rounded-md"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors rounded-md"
            >
              How It Works
            </a>
            <a
              href="#preview"
              className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors rounded-md"
            >
              Live Preview
            </a>
            <a
              href="#testimonials"
              className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors rounded-md"
            >
              Testimonials
            </a>
            <a
              href="#faq"
              className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors rounded-md"
            >
              FAQ
            </a>
            <a
              href="#contact"
              className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors rounded-md"
            >
              Contact
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-navy" />}
            </button>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-4.5 py-2 text-sm font-semibold text-white bg-navy hover:bg-navy-900 dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-slate-950 rounded-xl shadow-sm hover:shadow transition-all transform active:scale-95"
            >
              <span>Launch Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-[#FDFEFE] dark:bg-[#0C121E] px-4 pt-3 pb-6 space-y-2">
            {[
              { label: "Home", href: "#" },
              { label: "About Us", href: "#about" },
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Live Preview", href: "#preview" },
              { label: "Testimonials", href: "#testimonials" },
              { label: "FAQ", href: "#faq" },
              { label: "Contact", href: "#contact" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-cyan-500 rounded-lg"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-center font-semibold bg-navy text-white dark:bg-cyan-500 dark:text-slate-950"
              >
                Launch Live Demo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================
          2. HERO SECTION
         ======================================================== */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-400/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Copy & Actions */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/80">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                <span>Healthcare Operations, Simplified</span>
              </div>

              {/* Headline */}
              <h1 className="font-hero text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-navy dark:text-white leading-[1.12]">
                Better Patient Monitoring.{" "}
                <span className="text-cyan-600 dark:text-cyan-400 underline decoration-cyan-400/40 decoration-wavy">
                  Smarter Care
                </span>{" "}
                Coordination.
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                QuarantineOS unifies inpatient isolation ward operations—tracking 74 patient beds, automating daily
                Celsius temperature logs, coordinating attending physician rounds, and enforcing clinical three-day
                fever-free recovery rules with zero paper lag.
              </p>

              {/* 3 Benefit Pills */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#EDF3F7] dark:bg-[#121A2A] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" />
                  <span>74-Bed Real-Time Capacity</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#EDF3F7] dark:bg-[#121A2A] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" />
                  <span>3-Day Fever-Free Protocol</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#EDF3F7] dark:bg-[#121A2A] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Multi-Role Clinician Workspaces</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-white bg-navy hover:bg-navy-900 dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-slate-950 shadow-md hover:shadow-lg transition-all transform active:scale-95 text-base"
                >
                  <span>Launch Live Demo</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#preview"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-cyan-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all text-base"
                >
                  <span>Explore Clinical Workflow</span>
                </a>
              </div>

              {/* Quick credential hint */}
              <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Instant interactive evaluation with pre-seeded Indian clinical cohort data.</span>
              </div>
            </div>

            {/* Right Column: Hero Visual with Real Healthcare Photo & Floating Vitals Cards */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main image container */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-900 aspect-[4/3] sm:aspect-[16/11]">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1200&q=85"
                    alt="Attending physician monitoring quarantine patient vitals"
                    className="w-full h-full object-cover object-center filter saturate-105"
                    onError={(e) => handleImgError(e, "QuarantineOS Clinician")}
                  />
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent pointer-events-none" />

                  <div className="absolute bottom-3 left-4 right-4 text-white text-xs">
                    <p className="font-semibold text-cyan-300">Dr. Ananya Deshmukh, MD</p>
                    <p className="text-slate-200 text-[11px]">Attending Physician — Isolation Ward B</p>
                  </div>
                </div>

                {/* Floating Vitals Chip 1 (Top Left) */}
                <div className="absolute -top-4 -left-4 sm:-left-6 bg-white dark:bg-[#121A2A] rounded-xl p-3 shadow-xl border border-slate-200 dark:border-slate-700 max-w-[210px] animate-float">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Thermometer className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100">Bed B-04: Aarav S.</p>
                      <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        36.6°C • Afebrile Day 3
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating Vitals Chip 2 (Bottom Right) */}
                <div className="absolute -bottom-5 -right-3 sm:-right-6 bg-white dark:bg-[#121A2A] rounded-xl p-3.5 shadow-xl border border-slate-200 dark:border-slate-700 max-w-[220px]">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Recovery Status</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300">
                      Discharge Ready
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-navy dark:text-white">Dr. Review Completed</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">3 afebrile days verified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. TRUST STRIP & HIGHLIGHTS
         ======================================================== */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-[#EDF3F7]/50 dark:bg-[#121A2A]/40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold font-hero text-navy dark:text-cyan-400">74 Beds</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Ward Capacity
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold font-hero text-navy dark:text-cyan-400">3 Days</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Fever-Free Rule
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold font-hero text-navy dark:text-cyan-400">&lt; 38.0°C</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Afebrile Threshold
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold font-hero text-navy dark:text-cyan-400">100%</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Client-Side Resilience
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. ABOUT US SECTION
         ======================================================== */}
      <section id="about" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Team Image */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-slate-900 aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=1200&q=85"
                  alt="Clinical isolation and nursing operations team"
                  className="w-full h-full object-cover object-center"
                  onError={(e) => handleImgError(e, "Healthcare Operations Team")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <p className="font-bold text-sm text-cyan-300">Coordinated Clinical Care</p>
                  <p className="text-xs text-slate-300">Nurses, attending physicians, and ward directors working on one shared dataset.</p>
                </div>
              </div>
            </div>

            {/* Story & Principles */}
            <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <HeartPulse className="w-3.5 h-3.5 text-cyan-500" />
                <span>Our Clinical Mission</span>
              </div>

              <h2 className="font-hero text-3xl sm:text-4xl font-bold text-navy dark:text-white leading-tight">
                Built to Prevent Premature Discharge and Eliminate Clinical Bottlenecks
              </h2>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Inpatient isolation wards and quarantine units operate under immense time pressure. Paper clipboards,
                fragmented spreadsheets, and manual temperature logs create dangerous blindspots—leading either to
                premature release of infectious patients or unnecessary bed occupancy.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#EDF3F7] dark:bg-[#121A2A] border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-navy dark:text-cyan-400 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4 text-cyan-500" />
                    <span>Algorithmic Safety</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    The 3-day fever-free rule is enforced deterministically. No patient can be certified without 3 full
                    calendar days afebrile.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#EDF3F7] dark:bg-[#121A2A] border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-navy dark:text-cyan-400 font-bold text-sm">
                    <Users className="w-4 h-4 text-cyan-500" />
                    <span>Role-Aligned Workflows</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Bespoke views tailored for Nurses (vitals sweeps), Doctors (bedside rounds), and Admins (bed capacity
                    logistics).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. 8-FEATURE RESPONSIVE GRID
         ======================================================== */}
      <section id="features" className="py-20 bg-[#EDF3F7]/60 dark:bg-[#121A2A]/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-cyan-100 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300">
              <Layers className="w-3.5 h-3.5 text-cyan-500" />
              <span>Full Operational Capabilities</span>
            </div>
            <h2 className="font-hero text-3xl sm:text-4xl font-bold text-navy dark:text-white">
              Engineered for Real-World Isolation Facilities
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base">
              Every feature in QuarantineOS reflects clinical operational necessities encountered by frontline medical teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C121E] border border-slate-200 dark:border-slate-800 hover:border-cyan-400/60 shadow-subtle hover:shadow-card transition-all group">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BedDouble className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-navy dark:text-white mb-2">Real-Time Bed Management</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Track all 74 isolation beds (B-01 through B-74). Instant filtering by occupancy, ward wing, and admission priority.
              </p>
              <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">74-Bed Hard Limit &rarr;</span>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C121E] border border-slate-200 dark:border-slate-800 hover:border-cyan-400/60 shadow-subtle hover:shadow-card transition-all group">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Thermometer className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-navy dark:text-white mb-2">Clinical Celsius Logging</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Validated numeric entries between 30.0°C and 45.0°C. Immediate color-coded alerts at ≥ 38.0°C febrile threshold.
              </p>
              <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">Precise Vitals Entry &rarr;</span>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C121E] border border-slate-200 dark:border-slate-800 hover:border-cyan-400/60 shadow-subtle hover:shadow-card transition-all group">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-navy dark:text-white mb-2">3-Day Fever-Free Rule</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Deterministic calendar-day evaluation. Automatically tallies consecutive afebrile days and flags eligibility for sign-off.
              </p>
              <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">Automated Streak Calc &rarr;</span>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C121E] border border-slate-200 dark:border-slate-800 hover:border-cyan-400/60 shadow-subtle hover:shadow-card transition-all group">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-navy dark:text-white mb-2">Attending Doctor Rounds</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Daily rounds checklist with overdue indicators. Record examination findings, auscultation notes, and swab statuses.
              </p>
              <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">Bedside Sign-Off &rarr;</span>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C121E] border border-slate-200 dark:border-slate-800 hover:border-cyan-400/60 shadow-subtle hover:shadow-card transition-all group">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-navy dark:text-white mb-2">Role-Specific Workspaces</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Tailored views for Nurse (Nurse Priya Sharma), Doctor (Dr. Ananya Deshmukh), and Admin (Director Rajesh Nair).
              </p>
              <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">Multi-Role Support &rarr;</span>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C121E] border border-slate-200 dark:border-slate-800 hover:border-cyan-400/60 shadow-subtle hover:shadow-card transition-all group">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-navy dark:text-white mb-2">Discharge Progression</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Two-tier clearance requiring 3 afebrile days plus attending physician verification before bed vacating.
              </p>
              <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">Discharge Workflow &rarr;</span>
            </div>

            {/* Feature 7 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C121E] border border-slate-200 dark:border-slate-800 hover:border-cyan-400/60 shadow-subtle hover:shadow-card transition-all group">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-navy dark:text-white mb-2">Interactive Analytics</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Dynamic Recharts graphs illustrating bed occupancy distribution, temperature compliance, and recovery curves.
              </p>
              <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">Live Visual Reports &rarr;</span>
            </div>

            {/* Feature 8 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0C121E] border border-slate-200 dark:border-slate-800 hover:border-cyan-400/60 shadow-subtle hover:shadow-card transition-all group">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-navy dark:text-white mb-2">Resilient Persistence</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Browser localStorage persistence saves every reading, visit, and status change without backend configuration.
              </p>
              <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">Zero Setup Prototype &rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. HOW IT WORKS TIMELINE
         ======================================================== */}
      <section id="how-it-works" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Award className="w-3.5 h-3.5 text-cyan-500" />
              <span>Standard Operating Procedure</span>
            </div>
            <h2 className="font-hero text-3xl sm:text-4xl font-bold text-navy dark:text-white">
              The 4-Step Quarantine Lifecycle
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base">
              From initial bed admission to safe medical discharge, QuarantineOS ensures complete compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="relative space-y-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-navy dark:bg-cyan-500 text-white dark:text-slate-950 font-hero text-xl font-bold flex items-center justify-center mx-auto md:mx-0 shadow-md">
                01
              </div>
              <h3 className="text-lg font-bold text-navy dark:text-white">Patient Admission & Bed Allocation</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Patient is admitted with demographic details and allocated one of 74 available isolation beds (B-01 to B-74).
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative space-y-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-navy dark:bg-cyan-500 text-white dark:text-slate-950 font-hero text-xl font-bold flex items-center justify-center mx-auto md:mx-0 shadow-md">
                02
              </div>
              <h3 className="text-lg font-bold text-navy dark:text-white">Shift Vitals & Temperature Logging</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Nurses log Celsius temperature twice daily. Readings ≥ 38.0°C instantly flag fever and reset recovery streak.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative space-y-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-navy dark:bg-cyan-500 text-white dark:text-slate-950 font-hero text-xl font-bold flex items-center justify-center mx-auto md:mx-0 shadow-md">
                03
              </div>
              <h3 className="text-lg font-bold text-navy dark:text-white">Attending Rounds & Afebrile Verification</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Attending physician conducts rounds, reviewing consecutive afebrile days once the 3-day recovery criteria is met.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative space-y-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-navy dark:bg-cyan-500 text-white dark:text-slate-950 font-hero text-xl font-bold flex items-center justify-center mx-auto md:mx-0 shadow-md">
                04
              </div>
              <h3 className="text-lg font-bold text-navy dark:text-white">Clinical Sign-Off & Safe Discharge</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Physician certifies recovery, releases the patient, generates a clinical summary, and frees the bed for new admissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. INTERACTIVE PRODUCT PREVIEW / LIVE SNAPSHOT
         ======================================================== */}
      <section id="preview" className="py-20 bg-[#EDF3F7]/50 dark:bg-[#121A2A]/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-cyan-100 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300">
              <Activity className="w-3.5 h-3.5 text-cyan-500" />
              <span>Interactive Cohort Snapshot</span>
            </div>
            <h2 className="font-hero text-3xl sm:text-4xl font-bold text-navy dark:text-white">
              Live Clinical Ward Preview
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base">
              Synchronized directly with the running application state. Showing real-time Indian cohort bed status.
            </p>
          </div>

          {/* Interactive Mock Dashboard Container */}
          <div className="rounded-2xl bg-white dark:bg-[#0C121E] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            {/* Header toolbar */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-sm text-navy dark:text-white">
                  Active Ward Roster — Isolation Unit B
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                  {occupiedBeds} / {TOTAL_FACILITY_BEDS} Beds Occupied
                </span>
              </div>
              <Link
                to="/login"
                className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Enter Full Workspace</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Quick Metrics Cards */}
            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="p-3.5 rounded-xl bg-[#EDF3F7] dark:bg-[#121A2A] border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Available Beds</p>
                <p className="text-2xl font-bold text-navy dark:text-white mt-1">{availableBeds}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Ready for admission</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EDF3F7] dark:bg-[#121A2A] border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Discharge Ready</p>
                <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">{dischargeReadyCount}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">3 afebrile days verified</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EDF3F7] dark:bg-[#121A2A] border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Febrile Flags</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{febrileCount}</p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">≥ 38.0°C alert threshold</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EDF3F7] dark:bg-[#121A2A] border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Vitals Logs</p>
                <p className="text-2xl font-bold text-navy dark:text-white mt-1">{temperatureLogs ? temperatureLogs.length : 0}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Recorded in session</p>
              </div>
            </div>

            {/* Cohort Sample Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Bed</th>
                    <th className="py-3 px-4 font-semibold">Patient Name</th>
                    <th className="py-3 px-4 font-semibold">Latest Temp</th>
                    <th className="py-3 px-4 font-semibold">Afebrile Streak</th>
                    <th className="py-3 px-4 font-semibold">Clinical Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Attending Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(patients && patients.length > 0 ? patients.slice(0, 6) : []).map((p) => {
                    const isFever = (p.latestTemperature || 0) >= FEVER_THRESHOLD;
                    return (
                      <tr key={p.patientId} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50">
                        <td className="py-3 px-4 font-mono font-bold text-cyan-600 dark:text-cyan-400">{p.bedNumber}</td>
                        <td className="py-3 px-4 font-semibold text-navy dark:text-white">
                          {p.name}{" "}
                          <span className="text-[10px] font-normal text-slate-400 font-mono">({p.patientId})</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-semibold px-2 py-0.5 rounded ${
                              isFever
                                ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                            }`}
                          >
                            {p.latestTemperature ? `${p.latestTemperature.toFixed(1)}°C` : "Pending"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {p.status === "DISCHARGE_READY" ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> 3 Full Days
                            </span>
                          ) : isFever ? (
                            <span className="text-red-600 dark:text-red-400 font-semibold">0 Days (Reset)</span>
                          ) : (
                            <span className="text-slate-600 dark:text-slate-300">Observation in Progress</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === "DISCHARGE_READY"
                                ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/80 dark:text-cyan-300"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {p.status === "DISCHARGE_READY" ? "READY FOR RELEASE" : p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400 font-medium">
                          {p.assignedDoctor || "Dr. Ananya Deshmukh"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Showing 6 of {patients ? patients.length : 74} patient records</span>
              <Link to="/login" className="font-semibold text-cyan-600 dark:text-cyan-400 hover:underline">
                View all 74 beds in live workspace &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          8. CLINICAL TESTIMONIALS
         ======================================================== */}
      <section id="testimonials" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>Demonstration Clinical Reviews</span>
            </div>
            <h2 className="font-hero text-3xl sm:text-4xl font-bold text-navy dark:text-white">
              Trusted by Frontline Care Teams
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base">
              Feedback reflecting operational clinical scenarios and discharge workflow reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="p-8 rounded-2xl bg-[#EDF3F7] dark:bg-[#121A2A] border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-subtle hover:shadow-card transition-all">
              <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed italic mb-6">
                &ldquo;The automated 3-day afebrile verification ensures no patient is discharged prematurely without
                clinical verification. It eliminates human errors during high-volume bed turnovers.&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold flex items-center justify-center text-sm">
                  AD
                </div>
                <div>
                  <p className="text-sm font-bold text-navy dark:text-white">Dr. Ananya Deshmukh, MD</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Chief Attending, Infectious Disease</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-8 rounded-2xl bg-[#EDF3F7] dark:bg-[#121A2A] border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-subtle hover:shadow-card transition-all">
              <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed italic mb-6">
                &ldquo;Morning vitals sweeps that used to take clipboard juggling now happen in minutes with instant
                color-coded fever flags. Entering temperatures in Celsius is fast and error-free.&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold flex items-center justify-center text-sm">
                  PS
                </div>
                <div>
                  <p className="text-sm font-bold text-navy dark:text-white">Priya Sharma, RN</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Lead Quarantine Ward Nurse</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-8 rounded-2xl bg-[#EDF3F7] dark:bg-[#121A2A] border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-subtle hover:shadow-card transition-all">
              <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed italic mb-6">
                &ldquo;Managing 74 beds with zero administrative overhead. QuarantineOS gives full audit visibility across
                every shift with instant exportable reports and bed turnaround analytics.&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold flex items-center justify-center text-sm">
                  RN
                </div>
                <div>
                  <p className="text-sm font-bold text-navy dark:text-white">Rajesh Nair, MHA</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Hospital Operations Director</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6 italic">
            * Demonstration testimonials representative of clinical operational workflows.
          </p>
        </div>
      </section>

      {/* ========================================================
          9. FAQ ACCORDION
         ======================================================== */}
      <section id="faq" className="py-20 bg-[#EDF3F7]/50 dark:bg-[#121A2A]/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-cyan-100 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300">
              <span>Knowledge Base</span>
            </div>
            <h2 className="font-hero text-3xl sm:text-4xl font-bold text-navy dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Clinical rules, architecture choices, and assessment evaluation guidelines.
            </p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C121E] overflow-hidden transition-all shadow-subtle"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                    className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-navy dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                  >
                    <span>{item.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          10. FUNCTIONAL CONTACT FORM & DEMO NOTICE
         ======================================================== */}
      <section id="contact" className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Mail className="w-3.5 h-3.5 text-cyan-500" />
              <span>Direct Inquiries</span>
            </div>
            <h2 className="font-hero text-3xl sm:text-4xl font-bold text-navy dark:text-white">
              Connect with the Product Team
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Evaluating QuarantineOS for an assessment or institutional deployment? Send us a demonstration inquiry.
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#0C121E] border border-slate-200 dark:border-slate-800 shadow-xl">
            {contactSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-navy dark:text-white">Inquiry Successfully Recorded</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  Thank you, <span className="font-semibold text-navy dark:text-cyan-400">{contactForm.name}</span>.
                  Your message has been received in demonstration mode.
                </p>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 max-w-md mx-auto">
                  <strong>Notice:</strong> This is a demonstration contact form and is not connected to a live support inbox.
                </div>
                <button
                  onClick={() => {
                    setContactSubmitted(false);
                    setContactForm({
                      name: "",
                      email: "",
                      role: "Clinical Administrator",
                      subject: "",
                      message: "",
                    });
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Dr. Rajesh / Clinical Lead"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border ${
                        contactErrors.name ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                      } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                    />
                    {contactErrors.name && <p className="text-[11px] text-red-500">{contactErrors.name}</p>}
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Work Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="physician@hospital.org"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border ${
                        contactErrors.email ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                      } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                    />
                    {contactErrors.email && <p className="text-[11px] text-red-500">{contactErrors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Role dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Clinical Role</label>
                    <select
                      value={contactForm.role}
                      onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="Clinical Administrator">Clinical Administrator</option>
                      <option value="Attending Physician">Attending Physician</option>
                      <option value="Head Nurse / Shift Lead">Head Nurse / Shift Lead</option>
                      <option value="Technical Assessor / Evaluator">Technical Assessor / Evaluator</option>
                    </select>
                  </div>

                  {/* Subject field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Assessment Evaluation / Trial"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border ${
                        contactErrors.subject ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                      } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                    />
                    {contactErrors.subject && <p className="text-[11px] text-red-500">{contactErrors.subject}</p>}
                  </div>
                </div>

                {/* Message field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide details about your clinical testing requirements or questions..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border ${
                      contactErrors.message ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                    } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                  />
                  {contactErrors.message && <p className="text-[11px] text-red-500">{contactErrors.message}</p>}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Demonstration prototype: Form submissions do not leave the local client session.
                  </p>
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-navy hover:bg-navy-900 dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-slate-950 transition-all text-sm"
                  >
                    <span>Submit Inquiry</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================
          11. PRIVACY & LOCAL ARCHITECTURE EXPLANATION
         ======================================================== */}
      <section id="privacy" className="py-12 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex items-center gap-2 text-navy dark:text-cyan-400 font-bold text-sm">
            <Lock className="w-4 h-4 text-cyan-500" />
            <span>Architecture & Data Privacy Disclosure</span>
          </div>
          <p className="leading-relaxed">
            QuarantineOS is designed as a fully functional client-side healthcare operations evaluation prototype. All
            patient records, bed assignments, temperature screenings, doctor visit logs, and discharge notes are stored
            strictly within the evaluator&apos;s browser using the standardized W3C LocalStorage API.
          </p>
          <p className="leading-relaxed">
            No health data (PHI), cookie identifiers, or analytical telemetry are transmitted to external servers. All
            clinical names and IDs (e.g. QOS-1001 to QOS-1074) are completely fictional demonstrations modeled after
            realistic Indian healthcare demographics.
          </p>
        </div>
      </section>

      {/* ========================================================
          12. FINAL CALL TO ACTION BANNER
         ======================================================== */}
      <section className="relative overflow-hidden py-16 bg-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="font-hero text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Ready to test next-generation quarantine operations?
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Experience role-based clinical workspaces with pre-seeded data, real-time Recharts analytics, and automated
            3-day fever-free discharge workflows.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-xl hover:shadow-cyan-500/25 transition-all transform active:scale-95 text-base"
            >
              <span>Launch Live Demo Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span>Demo credentials:</span>
            <span className="font-mono bg-navy-900 px-2 py-0.5 rounded text-cyan-300">nurse.demo</span>
            <span className="font-mono bg-navy-900 px-2 py-0.5 rounded text-cyan-300">doctor.demo</span>
            <span className="font-mono bg-navy-900 px-2 py-0.5 rounded text-cyan-300">admin.demo</span>
          </div>
        </div>
      </section>

      {/* ========================================================
          13. MULTI-COLUMN FOOTER
         ======================================================== */}
      <footer className="bg-[#121A2A] text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-navy border border-cyan-400/50 flex items-center justify-center text-cyan-400">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-hero text-xl font-bold text-white">
                Quarantine<span className="text-cyan-400">OS</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Specialized healthcare operations management platform designed for rapid inpatient quarantine and recovery tracking.
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-2.5">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">Navigation</p>
            <ul className="space-y-1.5">
              <li>
                <a href="#" className="hover:text-cyan-400 transition-colors">Home</a>
              </li>
              <li>
                <a href="#about" className="hover:text-cyan-400 transition-colors">About Us</a>
              </li>
              <li>
                <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-cyan-400 transition-colors">Clinical Reviews</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-cyan-400 transition-colors">FAQ</a>
              </li>
            </ul>
          </div>

          {/* Workspace Links */}
          <div className="space-y-2.5">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">Role Workspaces</p>
            <ul className="space-y-1.5">
              <li>
                <Link to="/login" className="hover:text-cyan-400 transition-colors">Nurse Floor Workspace</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-cyan-400 transition-colors">Attending Physician Rounds</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-cyan-400 transition-colors">Facility Director Oversight</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-cyan-400 transition-colors">Recharts Clinical Analytics</Link>
              </li>
            </ul>
          </div>

          {/* Evaluation Details */}
          <div className="space-y-2.5">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">Evaluation Info</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              QuarantineOS is built for the Technical Product Manager evaluation. Fully responsive across desktop, tablet, and mobile.
            </p>
            <p className="text-[11px] text-slate-500 font-mono">Build v2.4.0 — React + Vite + Tailwind</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>&copy; {new Date().getFullYear()} QuarantineOS. All rights reserved.</p>
          <p>Confidential demonstration prototype. All clinical data is simulated.</p>
        </div>
      </footer>
    </div>
  );
}
