import type { Activity } from "../types";

export const mockActivities: Activity[] = [
  {
    id: "a1",
    kind: "task_completed",
    actorId: "u2",
    message: "completed “Ship checklist widget to production”",
    timestamp: "2026-07-07T09:12:00Z",
  },
  {
    id: "a2",
    kind: "task_assigned",
    actorId: "u4",
    message: "assigned “Enterprise migration runbook” to Jonas Müller",
    timestamp: "2026-07-07T08:40:00Z",
  },
  {
    id: "a3",
    kind: "project_created",
    actorId: "u4",
    message: "created project “Mobile App v3”",
    timestamp: "2026-07-06T17:22:00Z",
  },
  {
    id: "a4",
    kind: "employee_added",
    actorId: "u1",
    message: "added Lena Park to the Design team",
    timestamp: "2026-07-06T14:05:00Z",
  },
  {
    id: "a5",
    kind: "project_updated",
    actorId: "u1",
    message: "updated the status of “Atlas Design System 2.0” to In progress",
    timestamp: "2026-07-05T11:48:00Z",
  },
  {
    id: "a6",
    kind: "task_completed",
    actorId: "u7",
    message: "completed “Kickoff research plan”",
    timestamp: "2026-07-04T16:30:00Z",
  },
];
