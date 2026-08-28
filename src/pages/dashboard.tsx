/* eslint-disable react-hooks/exhaustive-deps */
import { Link } from "react-router-dom";
import {
  FolderKanban,
  Users,
  Clock,
  CheckCircle2,
  ArrowRight,
  Plus,
  CalendarDays,
} from "lucide-react";
import { SummaryCard } from "@/components/ui-kit/summary-card";
import { ProgressBar } from "@/components/ui-kit/progress-bar";
import {
  ProjectStatusBadge,
  PriorityPill,
  TaskStatusBadge,
} from "@/components/ui-kit/status-badges";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockTasks } from "@/lib/mock/tasks";
import { mockCurrentUser } from "@/lib/mock/employees";
import { mockActivities } from "@/lib/mock/activities";
import { employeesById, projectsById } from "@/lib/data";
import { formatShortDate, initials, relativeTime } from "@/lib/format";
import { connectSupabase } from "@/services/config";
import { useEffect, useState } from "react";
import { ProjectStatus, Task } from "@/lib/types";

const activityIcon = {
  project_created: FolderKanban,
  task_assigned: ArrowRight,
  employee_added: Users,
  task_completed: CheckCircle2,
  project_updated: Clock,
} as const;

const activityTint = {
  project_created: "bg-primary-soft text-primary",
  task_assigned: "bg-info/15 text-info",
  employee_added: "bg-accent text-accent-foreground",
  task_completed: "bg-success/15 text-success",
  project_updated: "bg-warning/20 text-warning-foreground",
} as const;

interface DashboardData {
  totalprojectcount: number;
  totalemployeecount: number;
  pendingtaskcount: number;
  completedtaskcount: number;
}
interface recentProjectsType {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  dueDate: string;
}

interface TaskDetail extends Task {
  projects: {
    project_name: string;
  };
  employee: {
    name: string;
    avatarUrl: string;
  };
}

export function DashboardPage() {
  const [recentProjects, setRecentProjects] = useState<recentProjectsType[]>([]);
  const [tasks, settasks] = useState<TaskDetail[]>([]);

  const getTaks = async () => {
    const { data, error } = await connectSupabase
      .from("task")
      .select("*,projects(project_name),employee(name,avatarUrl)");

    settasks(data ?? []);
    // console.log("taskss: ", data);
  };

  const myTasks = tasks.filter((t) => t.status !== "completed").slice(0, 4);

  const getEmployeName = async () => {
    const { data, error } = await connectSupabase.from("employee").select("name");
    if (error) {
      // console.log(error.message);
      return;
    }
    //  else console.log(data);
  };

  const getRecentProjects = async () => {
    const { data, error } = await connectSupabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      // console.log(error);
      return;
    }

    const formattedProjects = data.map((item) => ({
      id: item.id,
      name: item.project_name,
      description: item.description,
      status: item.status,
      progress: getProgressByStatus(item.status),
      dueDate: item.end_date,
    }));

    setRecentProjects(formattedProjects);
  };

  const getProgressByStatus = (status: string): number => {
    switch (status) {
      case "todo":
        return 0;
      case "in_progress":
        return 50;
      case "review":
        return 75;
      case "completed":
        return 100;
      default:
        return 0;
    }
  };
  useEffect(() => {
    getEmployeName();
    getRecentProjects();
    getTaks();
  }, []);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const { count: totalProjects, error: projectError } = await connectSupabase
      .from("projects")
      .select("*", { count: "exact", head: true });

    const { count: totalEmployees, error: employeeError } = await connectSupabase
      .from("employee")
      .select("*", { count: "exact", head: true });

    const { count: pendingTasks, error: pendingError } = await connectSupabase
      .from("task")
      .select("*", { count: "exact", head: true })
      .neq("status", "completed");

    const { count: completedTasks, error: completedError } = await connectSupabase
      .from("task")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed");

    if (projectError) console.log(projectError.message);
    if (employeeError) console.log(employeeError.message);
    if (pendingError) console.log(pendingError.message);
    if (completedError) console.log(completedError.message);

    setDashboardData({
      totalprojectcount: totalProjects || 0,
      totalemployeecount: totalEmployees || 0,
      pendingtaskcount: pendingTasks || 0,
      completedtaskcount: completedTasks || 0,
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A snapshot of everything your team is working on this week.
          </p>
        </div>
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" />
          <Link to="/projects">New project</Link>
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total projects"
          value={dashboardData?.totalprojectcount ?? 0}
          delta={{ value: "+2 this month", positive: true }}
          icon={FolderKanban}
          tint="primary"
        />
        <SummaryCard
          label="Total employees"
          value={dashboardData?.totalemployeecount ?? 0}
          delta={{ value: "+3 this quarter", positive: true }}
          icon={Users}
          tint="info"
        />
        <SummaryCard
          label="Pending tasks"
          value={dashboardData?.pendingtaskcount ?? 0}
          delta={{ value: "-4 vs last week", positive: true }}
          icon={Clock}
          tint="warning"
        />
        <SummaryCard
          label="Completed tasks"
          value={dashboardData?.completedtaskcount ?? 0}
          delta={{ value: "+12% MoM", positive: true }}
          icon={CheckCircle2}
          tint="success"
        />
      </div>

      {/* Recent projects + Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-card shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-base font-semibold">Recent projects</h2>
              <p className="text-xs text-muted-foreground">Latest projects across your workspace</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/projects" className="gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="pl-6">Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-45">Progress</TableHead>
                  <TableHead className="pr-6 text-right">Due date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProjects.map((p) => (
                  <TableRow key={p.id} className="border-border">
                    <TableCell className="pl-6 py-4">
                      <div className="font-medium text-foreground">{p.name}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                        {p.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ProjectStatusBadge status={p.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ProgressBar value={p.progress} className="flex-1" />
                        <span className="w-9 text-right text-xs font-medium text-foreground">
                          {p.progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 text-right text-sm text-muted-foreground">
                      {formatShortDate(p.dueDate)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Activity timeline */}
        <section className="rounded-xl border border-border bg-card shadow-soft">
          <div className="px-6 py-4">
            <h2 className="text-base font-semibold">Activity</h2>
            <p className="text-xs text-muted-foreground">Recent events across your team</p>
          </div>
          <ol className="relative space-y-4 px-6 pb-6">
            {mockActivities.map((a, idx) => {
              const Icon = activityIcon[a.kind];
              const actor = employeesById[a.actorId];
              return (
                <li key={a.id} className="relative flex gap-3">
                  {idx !== mockActivities.length - 1 && (
                    <span className="absolute left-4 top-9 h-[calc(100%-4px)] w-px bg-border" />
                  )}
                  <div
                    className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full ring-4 ring-card ${activityTint[a.kind]}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 pt-1">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{actor?.name ?? "Someone"}</span>{" "}
                      <span className="text-muted-foreground">{a.message}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {relativeTime(a.timestamp)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      {/* My tasks */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">My tasks</h2>
            <p className="text-xs text-muted-foreground">Tasks assigned to you or your team</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/tasks" className="gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {myTasks.length == 0 ? (
            <div className="h-15 text-center align-middle text-muted-foreground">no results</div>
          ) : (
            myTasks.map((t) => {
              return (
                <div
                  key={t.id}
                  className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-elegant"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {t?.title}
                    </span>
                    <PriorityPill priority={t.priority} />
                  </div>
                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{t.title}</h3>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={
                            connectSupabase.storage
                              .from("Employee")
                              .getPublicUrl(t?.employee?.avatarUrl).data.publicUrl
                          }
                          alt={t.employee?.name}
                        />
                        <AvatarFallback className="text-[10px]">
                          {initials(t.employee?.name ?? "")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {t.employee?.name.split(" ")[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        {formatShortDate(t.dueDate)}
                      </span>
                      <TaskStatusBadge status={t.status} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
