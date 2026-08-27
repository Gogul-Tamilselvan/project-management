import { cn } from "@/lib/utils";
import type { Priority, ProjectStatus, TaskStatus, EmployeeStatus } from "@/lib/types";

const base =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset";

const projectMap: Record<ProjectStatus, { label: string; cls: string }> = {
  todo: { label: "To do", cls: "bg-muted text-muted-foreground ring-border" },
  planning: { label: "Planning", cls: "bg-info/15 text-info ring-info/25" },
  in_progress: { label: "In progress", cls: "bg-primary-soft text-primary ring-primary/20" },
  review: { label: "In review", cls: "bg-warning/15 text-warning-foreground ring-warning/30" },
  on_hold: { label: "On hold", cls: "bg-muted text-muted-foreground ring-border" },
  completed: { label: "Completed", cls: "bg-success/15 text-success ring-success/25" },
};

const taskMap: Record<TaskStatus, { label: string; cls: string }> = {
  todo: { label: "To do", cls: "bg-muted text-muted-foreground ring-border" },
  in_progress: { label: "In progress", cls: "bg-primary-soft text-primary ring-primary/20" },
  review: { label: "In review", cls: "bg-warning/15 text-warning-foreground ring-warning/30" },
  completed: { label: "Completed", cls: "bg-success/15 text-success ring-success/25" },
};

const priorityMap: Record<Priority, { label: string; cls: string; dot: string }> = {
  low: {
    label: "Low",
    cls: "bg-muted text-muted-foreground ring-border",
    dot: "bg-muted-foreground/50",
  },
  medium: { label: "Medium", cls: "bg-info/15 text-info ring-info/25", dot: "bg-info" },
  high: {
    label: "High",
    cls: "bg-warning/15 text-warning-foreground ring-warning/30",
    dot: "bg-warning",
  },
  urgent: {
    label: "Urgent",
    cls: "bg-destructive/12 text-destructive ring-destructive/25",
    dot: "bg-destructive",
  },
};

const employeeMap: Record<EmployeeStatus, { label: string; cls: string; dot: string }> = {
  active: { label: "Active", cls: "bg-success/15 text-success ring-success/25", dot: "bg-success" },
  away: {
    label: "Away",
    cls: "bg-warning/15 text-warning-foreground ring-warning/30",
    dot: "bg-warning",
  },
  offline: {
    label: "Offline",
    cls: "bg-muted text-muted-foreground ring-border",
    dot: "bg-muted-foreground/60",
  },
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const { label, cls } = projectMap[status];
  return <span className={cn(base, cls)}>{label}</span>;
}
export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const { label, cls } = taskMap[status];
  return <span className={cn(base, cls)}>{label}</span>;
}
export function PriorityPill({ priority }: { priority: Priority }) {
  const { label, cls, dot } = priorityMap[priority];
  return (
    <span className={cn(base, cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}
export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  const { label, cls, dot } = employeeMap[status];
  return (
    <span className={cn(base, cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}
