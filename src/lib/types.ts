export type ProjectStatus = "planning" | "in_progress" | "on_hold" | "completed";
export type TaskStatus = "todo" | "in_progress" | "review" | "completed";
export type Priority = "low" | "medium" | "high" | "urgent";
export type EmployeeStatus = "active" | "away" | "offline";

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  department: string;
  role: string;
  status: EmployeeStatus;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number; // 0-100
  startDate: string; // ISO
  dueDate: string; // ISO
  teamIds: string[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  assigneeId: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string; // ISO
}

export type ActivityKind =
  "project_created" | "task_assigned" | "employee_added" | "task_completed" | "project_updated";

export interface Activity {
  id: string;
  kind: ActivityKind;
  actorId: string;
  message: string;
  timestamp: string; // ISO
}

export interface CurrentUser extends Employee {}
