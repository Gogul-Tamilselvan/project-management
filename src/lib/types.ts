export type ProjectStatus =
  "todo" | "planning" | "in_progress" | "review" | "on_hold" | "completed";
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

// export interface CurrentUser extends Employee {}

export interface UserDataType {
  email: string;
  name: string;
  // sub: string;
  // phone_verified: boolean;
  // email_verified: boolean;
}

export interface TimeSheetType {
  approval_status: string;
  approved_at: string;
  approved_by: string;
  created_at: string;
  id: string;
  task_description: string;
  task_id: string;
  time_duration: number;
}

export interface EmailAlertType {
  created_date?: string;
  team_lead_name: string;
  task_title: string;
  task_description: string;
  priority: string;
  due_date?: string;
  team_lead_initial: string;
  task_url?: string;
  name: string;
  email: string;
  to_email: string;
  from_email: string;
}
