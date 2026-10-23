import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Eye,
  EyeOff,
  LogIn,
  Stethoscope,
  Users,
  ShieldAlert,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useApp, DEMO_ACCOUNTS } from "../context/AppContext";
import { Button } from "../components/ui/Button";

export function Login() {
  const navigate = useNavigate();
  const { login, theme, toggleTheme } = useApp();

  const [username, setUsername] = useState("nurse.demo");
  const [password, setPassword] = useState("Nurse@123");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoleKey, setSelectedRoleKey] = useState("nurse");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectRole = (roleKey) => {
    const acc = DEMO_ACCOUNTS[roleKey];
    setSelectedRoleKey(roleKey);
    setUsername(acc.username);
    setPassword(acc.password);
    setErrorMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(username, password);
      if (res.success) {
        navigate("/dashboard");
      } else {
        setErrorMessage(res.error);
        setIsSubmitting(false);
      }
    }, 250);
  };

  return (
    <div className="min-h-screen w-full bg-[#FDFEFE] dark:bg-[#0C121E] text-foreground flex flex-col justify-between p-4 sm:p-6 lg:p-8 transition-colors select-none">
      {/* Top utility row: Logo branding and Theme toggle */}
      <header className="flex items-center justify-between max-w-5xl w-full mx-auto pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-navy dark:bg-navy-900 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-sm">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L4 5v6.5c0 5.2 3.6 9.8 8 11.5 4.4-1.7 8-6.3 8-11.5V5l-8-3z" />
              <path d="M12 8v8M8 12h8" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-lg font-sans tracking-tight text-navy dark:text-white">
              QuarantineOS
            </span>
            <span className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold block uppercase tracking-wider">
              Care Operations
            </span>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2.5 rounded-xl border border-border/80 hover:bg-secondary text-foreground transition-all shadow-subtle"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-navy" />
          )}
        </button>
      </header>

      {/* Main Login Container */}
      <main className="max-w-4xl w-full mx-auto my-auto py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero / Context Information */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-800 dark:text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>TPM Demonstration Assessment</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-hero font-bold tracking-tight text-navy dark:text-slate-100">
                Care Operations & Patient Isolation
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Centralized facility capacity monitoring, infrared temperature screening, and attending physician rounds for municipal health units.
              </p>
            </div>

            {/* Quick Demo Credentials Cards */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-navy dark:text-slate-300 uppercase tracking-wider">
                Select a Demo Identity to Pre-fill:
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                {Object.entries(DEMO_ACCOUNTS).map(([key, acc]) => {
                  const isSelected = selectedRoleKey === key;
                  return (
                    <div
                      key={key}
                      onClick={() => handleSelectRole(key)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-left ${
                        isSelected
                          ? "bg-cyan-500/10 border-cyan-500/50 shadow-sm"
                          : "bg-secondary/40 dark:bg-card/40 border-border/80 hover:bg-secondary/70"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected
                              ? "bg-cyan-500 text-navy-950 font-black shadow-sm"
                              : "bg-secondary dark:bg-slate-800 text-foreground"
                          }`}
                        >
                          {acc.avatar}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-navy dark:text-slate-100">
                              {acc.title} Workspace
                            </span>
                            {isSelected && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-semibold">
                                Selected
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-muted-foreground block truncate">
                            {acc.username} / {acc.password}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs text-cyan-600 dark:text-cyan-400 font-medium shrink-0 pl-2">
                        Click to fill →
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-7">
            <div className="bg-card dark:bg-[#121A2A] rounded-2xl border border-border/80 p-6 sm:p-8 shadow-card">
              <div className="space-y-1 mb-6">
                <h2 className="text-xl font-bold font-sans text-navy dark:text-slate-100">
                  Sign in to QuarantineOS
                </h2>
                <p className="text-xs text-muted-foreground">
                  Demo environment — use the sample credentials provided.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-navy dark:text-slate-200 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. nurse.demo"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-secondary/30 dark:bg-slate-900/60 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 font-mono"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-navy dark:text-slate-200">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      {showPassword ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" /> Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" /> Show
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-secondary/30 dark:bg-slate-900/60 border border-border/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 font-mono"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full"
                    icon={LogIn}
                  >
                    {isSubmitting ? "Authenticating Demo Session..." : "Enter Workspace"}
                  </Button>
                </div>
              </form>

              <div className="mt-6 pt-5 border-t border-border/60 text-center">
                <span className="text-[11px] text-muted-foreground block">
                  Simulated local authorization • Open TPM prototype evaluation
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-2 text-xs text-muted-foreground max-w-5xl mx-auto w-full border-t border-border/50 pt-4">
        <span>QuarantineOS Care Operations • Metropolitan Health Administration</span>
      </footer>
    </div>
  );
}
