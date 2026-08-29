import { Routes, Route, Link, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardPage } from "@/pages/dashboard";
import { ProjectsPage } from "@/pages/projects";
import { EmployeesPage } from "@/pages/employees";
import { TasksPage } from "@/pages/tasks";
import { ProfilePage } from "@/pages/profile";
import { SettingsPage } from "@/pages/settings";
import { SignupPage } from "./pages/signup";
import { SigninPage } from "./pages/signin";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { connectSupabase } from "@/services/config";
import KanbanBoard from "./components/kanban/kanban";
import TaskApprovalPage from "./components/kanban/TaskApprovalPage";
import { getCurrentUserRoleService } from "./services/AuthService";

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export function App() {
  const [logged, setLogged] = useState<boolean | null>(null);
  const [userRole, setuserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await connectSupabase.auth.getSession();

      setLogged(!!data.session);
    };

    checkSession();

    const {
      data: { subscription },
    } = connectSupabase.auth.onAuthStateChange(async (_event, session) => {
      setLogged(!!session);
      const res = await getCurrentUserRoleService();
      setuserRole(res?.role ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (logged === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route
          path="/signin"
          element={logged ? <Navigate to="/dashboard" replace /> : <SigninPage />}
        />
        <Route
          path="/signup"
          element={logged ? <Navigate to="/signin" replace /> : <SignupPage />}
        />

        <Route element={logged ? <AppShell /> : <Navigate to="/signin" replace />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:projectId" element={<KanbanBoard />} />
          {/* <Route path="projects/tasks/approvals" element={<TaskApprovalPage />} /> */}
          {userRole === "TL" && <Route path="taskreview" element={<TaskApprovalPage />} />}
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
