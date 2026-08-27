import { useEffect, useState } from "react";
import { connectSupabase } from "../../services/config";
import { toast } from "sonner";
import { Check, X, Clock, User, CalendarDays, AlertCircle, ClipboardCheck } from "lucide-react";
import { CardsSkeleton } from "../ui-kit/loading-skeleton";

interface Employee {
  id: string;
  name: string;
}

interface ApprovalTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: string;
  projectId?: string;

  approval_status: "pending" | "approved" | "rejected";
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;

  created_at?: string;

  employee?: Employee | null;
}

export default function TaskApprovalPage() {
  const [tasks, setTasks] = useState<ApprovalTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTL, setIsTL] = useState(false);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ApprovalTask | null>(null);

  const [rejectionReason, setRejectionReason] = useState("");
  const [processingApproveTaskId, setProcessingApproveTaskId] = useState<string | null>(null);
  const [processingRejectTaskId, setProcessingRejectTaskId] = useState<string | null>(null);

  useEffect(() => {
    checkUserRole();
  }, []);

  useEffect(() => {
    if (isTL) {
      fetchPendingTasks();
    }
  }, [isTL]);

  // CHECK CURRENT USER ROLE

  const checkUserRole = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await connectSupabase.auth.getUser();

      if (!user) {
        setIsTL(false);
        setLoading(false);
        return;
      }

      const { data: employee, error } = await connectSupabase
        .from("employee")
        .select("id, email, role")
        .eq("email", user.email)
        .single();

      if (error || !employee) {
        console.error("Employee role error:", error);

        setIsTL(false);
        setLoading(false);
        return;
      }

      const tl = employee.role?.toLowerCase() === "tl";

      setIsTL(tl);
      setLoading(false);
    } catch (error) {
      console.error("Unexpected role error:", error);

      setIsTL(false);
      setLoading(false);
    }
  };

  // FETCH PENDING APPROVAL TASKS

  const fetchPendingTasks = async () => {
    try {
      setLoading(true);

      const { data, error } = await connectSupabase
        .from("task")
        .select(
          `
          *,
          employee(id, name)
        `,
        )
        .eq("status", "review")
        .eq("approval_status", "pending")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("Error fetching approval tasks:", error);

        toast.error("Failed to load approval tasks");
        return;
      }

      setTasks((data || []) as ApprovalTask[]);
    } catch (error) {
      console.error("Unexpected error fetching tasks:", error);

      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // APPROVE TASK

  const approveTask = async (taskId: string) => {
    if (!isTL) {
      toast.error("Only TL can approve tasks");
      return;
    }

    try {
      setProcessingApproveTaskId(taskId);

      const {
        data: { user },
      } = await connectSupabase.auth.getUser();

      if (!user) {
        toast.error("User not found");
        return;
      }

      const { error } = await connectSupabase
        .from("task")
        .update({
          status: "completed",
          approval_status: "approved",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          rejection_reason: null,
        })
        .eq("id", taskId)
        .eq("status", "review")
        .eq("approval_status", "pending");

      if (error) {
        console.error("Approval error:", error);

        toast.error("Failed to approve task");
        return;
      }

      toast.success("Task approved successfully");

      await fetchPendingTasks();
    } catch (error) {
      console.error("Unexpected approval error:", error);

      toast.error("Something went wrong");
    } finally {
      setProcessingApproveTaskId(null);
    }
  };

  const openRejectModal = (task: ApprovalTask) => {
    if (!isTL) {
      toast.error("Only TL can reject tasks");
      return;
    }

    setSelectedTask(task);
    setRejectionReason("");
    setIsRejectModalOpen(true);
  };

  // REJECT TASK

  const rejectTask = async () => {
    if (!isTL) {
      toast.error("Only TL can reject tasks");
      return;
    }

    if (!selectedTask) {
      return;
    }

    if (!rejectionReason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }

    try {
      setProcessingRejectTaskId(selectedTask.id);

      const {
        data: { user },
      } = await connectSupabase.auth.getUser();

      if (!user) {
        toast.error("User not found");
        return;
      }

      const { error } = await connectSupabase
        .from("task")
        .update({
          status: "in_progress",
          approval_status: "rejected",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          rejection_reason: rejectionReason.trim(),
        })
        .eq("id", selectedTask.id)
        .eq("status", "review")
        .eq("approval_status", "pending");

      if (error) {
        console.error("Reject error:", error);

        toast.error("Failed to reject task");
        return;
      }

      toast.success("Task rejected");

      setIsRejectModalOpen(false);
      setSelectedTask(null);
      setRejectionReason("");

      await fetchPendingTasks();
    } catch (error) {
      console.error("Unexpected rejection error:", error);

      toast.error("Something went wrong");
    } finally {
      setProcessingRejectTaskId(null);
    }
  };

  if (loading) {
    return <CardsSkeleton />;
  }

  if (!isTL) {
    return (
      <div className="flex min-h-[500px] items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-red-100 bg-card p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-7 w-7 text-red-600" />
          </div>

          <h2 className="mt-5 text-xl font-semibold text-foreground">Access Denied</h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            You do not have permission to access Task Approval. Only Team Leads can approve or
            reject tasks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-card p-4 md:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                <ClipboardCheck className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Task Approval</h1>

                <p className="mt-1 text-sm text-foreground">
                  Review and approve tasks submitted by employees
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
            <Clock className="h-5 w-5 text-yellow-600" />

            <div>
              <p className="text-xs font-medium text-yellow-700">Pending Approval</p>

              <p className="text-xl font-bold text-yellow-800">{tasks.length}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        {tasks.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
            <div className="max-w-sm px-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check className="h-8 w-8 text-green-600" />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-foreground">All caught up!</h2>

              <p className="mt-2 text-sm leading-6 text-foreground">
                There are currently no tasks waiting for your approval.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const isApproving = processingApproveTaskId === task.id;

              const isRejecting = processingRejectTaskId === task.id;

              return (
                <div
                  key={task.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-foreground">{task.title}</h2>

                        <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-700">
                          Pending Approval
                        </span>
                      </div>

                      {task.description && (
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-foreground">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                        {task.employee && (
                          <div className="flex items-center gap-2 text-sm text-foreground">
                            <User className="h-4 w-4 text-foreground" />

                            <span>{task.employee.name}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <ClipboardCheck className="h-4 w-4 text-foreground" />

                          <span>In Review</span>
                        </div>

                        {task.dueDate && (
                          <div className="flex items-center gap-2 text-sm text-foreground">
                            <CalendarDays className="h-4 w-4 text-foreground" />

                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {task.priority && (
                      <div>
                        <span
                          className={`
                            inline-flex rounded-full
                            px-3 py-1 text-xs font-semibold
                            ${
                              task.priority.toLowerCase() === "high"
                                ? "bg-red-100 text-red-700"
                                : task.priority.toLowerCase() === "medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                            }
                          `}
                        >
                          {task.priority}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="my-5 border-t border-border" />

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-foreground">
                      This task is waiting for TL approval.
                    </div>

                    <div className="flex w-full gap-3 sm:w-auto">
                      <button
                        type="button"
                        disabled={isApproving || isRejecting}
                        onClick={() => openRejectModal(task)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-card px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>

                      <button
                        type="button"
                        disabled={isApproving || isRejecting}
                        onClick={() => approveTask(task.id)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                      >
                        {isApproving ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Approve
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REJECT MODAL*/}

      {isRejectModalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Reject Task</h2>

                <p className="mt-1 text-sm text-foreground">
                  Please provide a reason for rejecting this task.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setSelectedTask(null);
                  setRejectionReason("");
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 rounded-lg bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Task
              </p>

              <p className="mt-1 text-sm font-semibold text-muted-foreground">
                {selectedTask.title}
              </p>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Rejection Reason
              </label>

              <textarea
                rows={5}
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Explain what needs to be corrected..."
                className="w-full resize-none rounded-lg border border-border p-3 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={processingRejectTaskId === selectedTask.id}
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setSelectedTask(null);
                  setRejectionReason("");
                }}
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={processingRejectTaskId === selectedTask.id || !rejectionReason.trim()}
                onClick={rejectTask}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processingRejectTaskId === selectedTask.id ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-transparent" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4" />
                    Reject Task
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
