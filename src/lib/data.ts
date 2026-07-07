/**
 * Data access layer.
 *
 * Today: returns mock data synchronously wrapped in a Promise.
 * Tomorrow: replace bodies with Supabase queries — component code stays the same.
 */
import { mockActivities } from "./mock/activities";
import { mockCurrentUser, mockEmployees } from "./mock/employees";
import { mockProjects } from "./mock/projects";
import { mockTasks } from "./mock/tasks";
import type { Activity, CurrentUser, Employee, Project, Task } from "./types";

const delay = <T,>(value: T, ms = 200): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export const getProjects = () => delay<Project[]>(mockProjects);
export const getProject = (id: string) =>
  delay<Project | undefined>(mockProjects.find((p) => p.id === id));

export const getEmployees = () => delay<Employee[]>(mockEmployees);
export const getEmployee = (id: string) =>
  delay<Employee | undefined>(mockEmployees.find((e) => e.id === id));

export const getTasks = () => delay<Task[]>(mockTasks);

export const getActivities = () => delay<Activity[]>(mockActivities);

export const getCurrentUser = () => delay<CurrentUser>(mockCurrentUser);

// Sync helpers for components that want an instant, non-async read (dashboards)
export const employeesById = Object.fromEntries(mockEmployees.map((e) => [e.id, e]));
export const projectsById = Object.fromEntries(mockProjects.map((p) => [p.id, p]));
