import React, { useState } from "react";
import {
  ListTodo,
  CheckCircle2,
  Clock,
  AlertCircle,
  Thermometer,
  Coffee,
  Bed,
  Check,
} from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useApp } from "../context/AppContext";

export function MyTasks() {
  const { currentUser } = useApp();

  const [tasks, setTasks] = useState([
    {
      id: "t-1",
      title: "Round 14:00 Infrared Vitals Check",
      ward: "Ward B (Step-down)",
      due: "14:00",
      status: "In Progress",
      priority: "High",
      type: "vitals",
      completed: false,
    },
    {
      id: "t-2",
      title: "Elevated Fever Retest — Eleanor Vance (B-01)",
      ward: "Ward A (High Acuity)",
      due: "14:30",
      status: "Pending",
      priority: "High",
      type: "fever",
      completed: false,
    },
    {
      id: "t-3",
      title: "Bed Linen Replenishment & Disinfection",
      ward: "Beds B-10 to B-20",
      due: "15:00",
      status: "Pending",
      priority: "Medium",
      type: "logistics",
      completed: false,
    },
    {
      id: "t-4",
      title: "Afternoon Nutritional Meal Cart Distribution",
      ward: "Ward A & Ward B",
      due: "16:00",
      status: "Pending",
      priority: "Medium",
      type: "meals",
      completed: false,
    },
    {
      id: "t-5",
      title: "Day Shift Handoff Log Sign-off",
      ward: "Nursing Station 02",
      due: "17:30",
      status: "Scheduled",
      priority: "Low",
      type: "admin",
      completed: false,
    },
  ]);

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nurse Shift Tasks"
        description={`Daily clinical checklist and bedside care schedule for ${currentUser?.name || "Floor Nurse"}.`}
        breadcrumbs={[
          { label: "QuarantineOS", href: "/dashboard" },
          { label: "Nurse Workspace" },
          { label: "My Tasks" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-xl bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 font-bold border border-cyan-500/30">
              {completedCount}/{tasks.length} Completed
            </span>
          </div>
        }
      />

      <div className="bg-card rounded-2xl border border-border/80 shadow-card p-5 space-y-4">
        <SectionHeader
          title="Floor Shift Schedule"
          description="Mark tasks complete as clinical care progresses throughout the shift."
        />

        <div className="space-y-2.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                task.completed
                  ? "bg-secondary/40 border-border/60 opacity-60 line-through"
                  : "bg-secondary/20 dark:bg-card/70 border-border/80 hover:border-cyan-500/40"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${
                    task.completed
                      ? "bg-cyan-500 border-cyan-600 text-white"
                      : "border-slate-300 dark:border-slate-700 bg-card"
                  }`}
                >
                  {task.completed && <Check className="w-4 h-4 stroke-[2.5]" />}
                </div>

                <div className="min-w-0">
                  <span className="text-xs font-semibold text-navy dark:text-slate-100 block truncate">
                    {task.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono block">
                    {task.ward} • Due {task.due}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={task.priority} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
