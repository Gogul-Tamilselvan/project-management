import { useEffect, useState } from "react";
import { connectSupabase } from "../../services/config";
import { useParams } from "react-router-dom";
import { CalendarDays, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage, Avatar } from "../ui/avatar";
import { TaskStatus } from "@/lib/types";
import { formatShortDate, initials } from "@/lib/format";
import { Button } from "../ui/button";

interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: string;
  assigneeId: string;
  dueDate: string;
  projectId: string;
  employee: Employee;
}

interface Employee {
  id: string;
  name: string;
  avatarUrl?: string;
}

const columns: {
  id: TaskStatus;
  title: string;
}[] = [
  {
    id: "todo",
    title: "To Do",
  },
  {
    id: "in_progress",
    title: "In Progress",
  },
  {
    id: "review",
    title: "Review",
  },
  {
    id: "completed",
    title: "Completed",
  },
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTimesheetOpen, setIsTimesheetOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [selectedEmp, setselectedEmp] = useState<string>("");

  const [taskDescription, setTaskDescription] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [editingTimesheet, setEditingTimesheet] = useState<any | null>(null);
  console.log("task: ", tasks);

  const [draggedTask, setDraggedTask] = useState<KanbanTask | null>(null);
  const [isChanged, setIsChanged] = useState(false);
  const [isTL, setIsTL] = useState(false);
  const { projectId } = useParams<{
    projectId: string;
  }>();

  useEffect(() => {
    if (projectId) {
      fetchTasks();
      // fetchEmployees();
      fetchTimesheets();
      checkUserRole();
    } else {
      setLoading(false);
    }
  }, [projectId]);
  const checkUserRole = async () => {
    try {
      const {
        data: { user },
      } = await connectSupabase.auth.getUser();

      if (!user) {
        setIsTL(false);
        return;
      }

      const { data: employeesData, error } = await connectSupabase
        .from("employee")
        .select("id, email, role");

      if (error) {
        console.error("Role fetch error:", error);
        setIsTL(false);
        return;
      }

      // console.log(
      //   "EMPLOYEE DETAILS:",
      //   employeesData?.map((emp) => ({
      //     id: emp.id,
      //     email: emp.email,
      //     role: emp.role,
      //   })),
      // );

      const employee = employeesData?.find(
        (emp) => emp.email?.toLowerCase() === user.email?.toLowerCase(),
      );

      if (!employee) {
        console.log("No employee record found for this user");
        setIsTL(false);
        return;
      }

      setIsTL(employee.role?.toLowerCase() === "tl");
    } catch (error) {
      console.error("Unexpected role error:", error);
      setIsTL(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const { data, error } = await connectSupabase
        .from("task")
        .select("*,employee(id,name,avatarUrl)")
        .eq("projectId", projectId);

      const empdata = new Map<string, Employee>();
      data?.forEach((v) => empdata.set(v.employee.id, v.employee));

      // console.log("uni: ", Array.from(empdata.values()));

      setEmployees(Array.from(empdata.values()));

      if (error) {
        console.error("Error fetching tasks:", error);
        return;
      }

      setTasks(data || []);
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimesheets = async () => {
    const { data, error } = await connectSupabase
      .from("timesheets")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (!error) {
      setTimesheets(data);
    }
  };

  const handleDragStart = (task: KanbanTask) => {
    setDraggedTask(task);
  };

  const getTaskById = (taskId: string) => {
    return tasks.find((task) => task.id === taskId);
  };

  const projectTimesheets = timesheets.filter((item) =>
    tasks.some((task) => task.id === item.task_id),
  );

  const totalMinutes = projectTimesheets.reduce((sum, item) => sum + (item.time_duration || 0), 0);

  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;
  const formattedTotal = `${String(totalHours).padStart(2, "0")}:${String(totalMins).padStart(
    2,
    "0",
  )}`;

  const handleDrop = async (newStatus: TaskStatus) => {
    if (!draggedTask) {
      return;
    }

    if (draggedTask.status === newStatus) {
      setDraggedTask(null);
      return;
    }

    try {
      const { error } = await connectSupabase
        .from("task")
        .update({
          status: newStatus,
        })
        .eq("id", draggedTask.id);

      if (error) {
        console.error("Error updating task status:", error);
        return;
      }

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === draggedTask.id
            ? {
                ...task,
                status: newStatus,
              }
            : task,
        ),
      );

      console.log("Task status updated:", newStatus);
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setDraggedTask(null);
    }
  };

  const handleSaveTimesheet = async () => {
    if (!selectedTask) return;

    const hoursPart = Number(hours);
    const minutesPart = Number(minutes);

    const totalMinutes = hoursPart * 60 + minutesPart;

    if (editingTimesheet) {
      // UPDATE existing entry
      const { error } = await connectSupabase
        .from("timesheets")
        .update({
          task_description: taskDescription,
          time_duration: totalMinutes,
        })
        .eq("id", editingTimesheet.id);

      if (error) {
        console.error("Update error:", error);
        toast.error("Failed to update timesheet entry");
        return;
      }

      toast.success("Timesheet entry updated successfully");
    } else {
      // CREATE new entry
      const { error } = await connectSupabase.from("timesheets").insert({
        task_id: selectedTask.id,
        task_description: taskDescription,
        time_duration: totalMinutes,
        approval_status: "pending",
      });

      if (error) {
        console.error("Insert error:", error);
        toast.error("Failed to add timesheet entry");
        return;
      }

      toast.success("Timesheet entry added successfully");
    }

    fetchTimesheets();

    setIsTimesheetOpen(false);
    setEditingTimesheet(null);
  };

  const handleDeleteTimesheet = async (timesheetId: string) => {
    const { data, error } = await connectSupabase
      .from("timesheets")
      .delete()
      .eq("id", timesheetId)
      .select();

    console.log("Delete result:", { data, error });

    if (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete timesheet entry");
      return;
    }
    toast.success("Timesheet entry deleted successfully");

    fetchTimesheets();
  };

  const handleTimesheetApproval = async (timesheetId: string, status: "approved" | "rejected") => {
    if (!isTL) {
      toast.error("Only TL can approve or reject timesheets");
      return;
    }

    const successMessage =
      status === "approved"
        ? "Timesheet approved successfully"
        : "Timesheet rejected successfully - task moved back to Review";

    const {
      data: { user },
    } = await connectSupabase.auth.getUser();

    if (!user) {
      toast.error("User not found");
      return;
    }

    const { error } = await connectSupabase
      .from("timesheets")
      .update({
        approval_status: status,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", timesheetId);

    if (error) {
      console.error("Approval error:", error);
      toast.error(`Failed to ${status} timesheet`);
      return;
    }

    // If rejected, move the related task back to "review"
    if (status === "rejected") {
      const relatedTimesheet = timesheets.find((t) => t.id === timesheetId);
      const taskId = relatedTimesheet?.task_id;

      if (taskId) {
        const { error: taskError } = await connectSupabase
          .from("task")
          .update({ status: "review" })
          .eq("id", taskId);

        if (taskError) {
          console.error("Task status update error:", taskError);
          toast.error("Timesheet rejected, but failed to move task back to Review");
        }
      }
    }

    toast.success(successMessage);

    fetchTimesheets();
    fetchTasks();
  };
  const handleEditTimesheet = (item: any) => {
    const relatedTask = getTaskById(item.task_id);

    setEditingTimesheet(item);
    setSelectedTask(relatedTask || null);
    setTaskDescription(item.task_description);
    setHours(String(Math.floor(item.time_duration / 60)));
    setMinutes(String(item.time_duration % 60));
    setIsChanged(false);
    setIsTimesheetOpen(true);
  };

  const filterEmployee = (id?: string) => {
    if (!id) return tasks;
    return tasks.filter((v) => v.employee.id === id);
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="p-6">
        <p className="text-red-500">Project ID not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="flex items-center justify-between flex-wrap">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kanban Board</h1>
          <p className="mt-1 text-sm text-slate-500">Manage and track tasks for this project</p>
        </div>
        <div className="flex items-center justify-between m-2">
          {employees.slice(0, 5).map((v) => (
            <Avatar
              className="h-7 w-7 cursor-pointer"
              key={v.id}
              onClick={() => setselectedEmp(v.id)}
            >
              <AvatarImage
              // src={
              //   connectSupabase.storage.from("Employee").getPublicUrl(v.employee.avatarUrl ?? "")
              //     .data.publicUrl
              // }
              />
              <AvatarFallback
                className="text-white"
                style={{ backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)` }}
              >
                {initials(v.name ?? "E")}
              </AvatarFallback>
            </Avatar>
          ))}

          {tasks.length - 3 != 0 && (
            <AvatarGroupCount className="bg-gray-400">{tasks.length - 3}</AvatarGroupCount>
          )}

          {selectedEmp && (
            <Button variant="destructive" className="ms-2" onClick={() => setselectedEmp("")}>
              Clear
            </Button>
          )}
          {/* </AvatarGroup> */}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((column) => {
          const columnTasks = filterEmployee(selectedEmp).filter(
            (task) => task.status === column.id,
          );
          const columnStyles = {
            todo: {
              header: "text-blue-600",
              badge: "bg-blue-100 text-blue-700",
              border: "border-blue-200",
              top: "border-t-blue-500",
            },
            in_progress: {
              header: "text-orange-600",
              badge: "bg-orange-100 text-orange-700",
              border: "border-orange-200",
              top: "border-t-orange-500",
            },
            review: {
              header: "text-purple-600",
              badge: "bg-purple-100 text-purple-700",
              border: "border-purple-200",
              top: "border-t-purple-500",
            },
            completed: {
              header: "text-green-600",
              badge: "bg-green-100 text-green-700",
              border: "border-green-200",
              top: "border-t-green-500",
            },
          };
          const style = columnStyles[column.id];

          return (
            <div
              key={column.id}
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onDrop={() => {
                handleDrop(column.id);
              }}
              className={`
                             flex min-h-[500px] flex-col
                             rounded-xl border border-slate-200
                             bg-white shadow-sm
                             border-t-4 ${style.top}
                             transition-all `}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                <div className="flex items-center gap-3">
                  <h2 className={`font-semibold ${style.header}`}>{column.title}</h2>

                  <span
                    className={`
                                        rounded-full px-2.5 py-1
                                        text-xs font-semibold
                                        ${style.badge} `}
                  >
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-3 p-4">
                {columnTasks.length === 0 ? (
                  <div
                    className={`
                                         flex min-h-[180px]
                                         items-center justify-center
                                         rounded-lg border border-dashed
                                         ${style.border}
                                         bg-slate-50/50 `}
                  >
                    <div className="text-center">
                      <div className="mb-2 text-2xl text-slate-300">+</div>

                      <p className="text-sm font-medium text-slate-400">No tasks</p>

                      <p className="mt-1 text-xs text-slate-400">Drop a task here</p>
                    </div>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable={task.status !== "completed"}
                      onDragStart={() => task.status !== "completed" && handleDragStart(task)}
                      onDragEnd={() => setDraggedTask(null)}
                      className="
                                             group cursor-grab
                                             rounded-xl border border-slate-200
                                             bg-white p-4
                                             shadow-sm
                                             transition-all duration-200
                                             hover:-translate-y-0.5
                                             hover:shadow-md
                                             active:cursor-grabbing  "
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-semibold leading-5 text-slate-900">
                          {`Title: ${task.title}`}
                        </h3>

                        <button
                          type="button"
                          className="
                          text-lg leading-none
                          text-slate-400
                          opacity-0
                          transition
                          group-hover:opacity-100
                          hover:text-slate-700
                        "
                        >
                          ⋮
                        </button>
                      </div>
                      {task.description && (
                        <p className="mt-2 line-clamp-3 text-sm leading-5 text-slate-500">
                          {`Description: ${task.description}`}
                        </p>
                      )}

                      {task.priority && (
                        <div className="mt-4">
                          <span
                            className={`
                            inline-flex rounded-full
                            px-2.5 py-1
                            text-xs font-medium
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

                      <div className="my-4 border-t border-slate-100" />

                      {task.dueDate && (
                        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatShortDate(task.dueDate)}
                        </span>
                      )}

                      <div className="mt-3 flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage
                            src={
                              connectSupabase.storage
                                .from("Employee")
                                .getPublicUrl(task?.employee.avatarUrl ?? "").data.publicUrl
                            }
                          />
                          <AvatarFallback className="text-[10px]">
                            {initials(task.employee.name ?? "")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-foreground">{task.employee.name}</span>
                      </div>
                      <div className="mt-4 border-t pt-3">
                        <button
                          className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
                          onClick={() => {
                            setSelectedTask(task);
                            setTaskDescription("");
                            setHours("");
                            setMinutes("");
                            setEditingTimesheet(null);
                            setIsTimesheetOpen(true);
                          }}
                        >
                          ⏱ Add Timesheet
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {columnTasks.length > 0 && (
                <div className="px-4 pb-4">
                  <div
                    className="flex items-center justify-center rounded-lg
                                         border border-dashed border-slate-200 py-3text-xs text-slate-400
                                         transition hover:border-slate-300 hover:bg-slate-50 "
                  >
                    Drop task here
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">My Timesheet Entries</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            {/* Desktop / tablet table (hidden on mobile) */}
            <div className="hidden overflow-x-auto rounded-lg border border-slate-100 sm:block">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-5 py-3 text-left font-semibold text-slate-600">Date</th>
                    <th className="px-5 py-3 text-left font-semibold text-slate-600">
                      Task Description
                    </th>
                    <th className="px-5 py-3 text-left font-semibold text-slate-600">Duration</th>
                    <th className="px-5 py-3 text-left font-semibold text-slate-600">
                      Task (Related)
                    </th>
                    <th className="px-5 py-3 text-left font-semibold text-slate-600">Approval</th>
                    <th className="px-5 py-3 text-center font-semibold text-slate-600">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {projectTimesheets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                        No timesheet entries yet.
                      </td>
                    </tr>
                  ) : (
                    projectTimesheets.map((item) => {
                      const relatedTask = getTaskById(item.task_id);

                      const hour = Math.floor(item.time_duration / 60);
                      const minute = item.time_duration % 60;

                      return (
                        <tr
                          key={item.id}
                          className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                            {new Date(item.created_at).toLocaleDateString()}
                          </td>

                          <td className="px-5 py-4 text-slate-700">{item.task_description}</td>

                          <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">
                            {hour}h {minute}m
                          </td>

                          <td className="px-5 py-4">
                            {relatedTask ? (
                              <span className="text-slate-700">{relatedTask.title}</span>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {item.approval_status === "approved" ? (
                              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                Approved
                              </span>
                            ) : item.approval_status === "rejected" ? (
                              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                Rejected
                              </span>
                            ) : (
                              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-2">
                              {/* Employee Edit */}
                              <button
                                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100"
                                onClick={() => handleEditTimesheet(item)}
                              >
                                <Pencil size={16} />
                              </button>

                              {/* Employee Delete */}
                              <button
                                className="rounded-lg border border-slate-200 p-2 text-red-500 hover:bg-red-50"
                                onClick={() => handleDeleteTimesheet(item.id)}
                              >
                                <Trash2 size={16} />
                              </button>

                              {/* TL ONLY */}
                              {isTL && item.approval_status === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleTimesheetApproval(item.id, "approved")}
                                    className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
                                  >
                                    Approve
                                  </button>

                                  <button
                                    onClick={() => handleTimesheetApproval(item.id, "rejected")}
                                    className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile stacked cards (hidden on sm and up) */}
            <div className="space-y-3 sm:hidden">
              {projectTimesheets.length === 0 ? (
                <div className="rounded-lg border border-slate-100 px-4 py-8 text-center text-sm text-slate-400">
                  No timesheet entries yet.
                </div>
              ) : (
                projectTimesheets.map((item) => {
                  const relatedTask = getTaskById(item.task_id);
                  const hour = Math.floor(item.time_duration / 60);
                  const minute = item.time_duration % 60;

                  return (
                    <div key={item.id} className="rounded-lg border border-slate-100 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {item.task_description}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <button
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100"
                            onClick={() => handleEditTimesheet(item)}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="rounded-lg border border-slate-200 p-2 text-red-500 hover:bg-red-50"
                            onClick={() => handleDeleteTimesheet(item.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                        <span className="font-medium text-slate-900">
                          {hour}h {minute}m
                        </span>

                        {relatedTask ? (
                          <span className="text-slate-600">{relatedTask.title}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                        {item.approval_status === "approved" ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Approved
                          </span>
                        ) : item.approval_status === "rejected" ? (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            Rejected
                          </span>
                        ) : (
                          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                            Pending
                          </span>
                        )}

                        {isTL && item.approval_status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleTimesheetApproval(item.id, "approved")}
                              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleTimesheetApproval(item.id, "rejected")}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-6 text-center sm:p-8">
            <h3 className="text-sm font-semibold text-slate-500">Total Time</h3>

            <p className="mt-4 text-4xl font-bold text-green-600 sm:text-5xl">{formattedTotal}</p>

            <p className="mt-2 text-sm text-slate-400">Hours</p>
          </div>
        </div>
      </div>
      {isTimesheetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[550px] rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingTimesheet ? "Edit Timesheet" : "Add Timesheet"}
              </h2>

              <button
                type="button"
                onClick={() => {
                  setIsTimesheetOpen(false);
                  setEditingTimesheet(null);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:bg-slate-100 focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block font-medium">Task Description</label>
                <textarea
                  rows={5}
                  value={taskDescription}
                  onChange={(e) => {
                    setTaskDescription(e.target.value);
                    setIsChanged(true);
                  }}
                  className="w-full rounded-lg border p-3"
                  placeholder="Enter task description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block font-medium">Hours</label>
                  <input
                    type="number"
                    min={0}
                    value={hours}
                    onChange={(e) => {
                      setHours(e.target.value);
                      setIsChanged(true);
                    }}
                    className="w-full rounded-lg border border-slate-200 p-3 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. 2"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium">Minutes</label>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={minutes}
                    onChange={(e) => {
                      setMinutes(e.target.value);
                      setIsChanged(true);
                    }}
                    className="w-full rounded-lg border border-slate-200 p-3 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. 30"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsTimesheetOpen(false)}
                  className="rounded-lg border px-5 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTimesheet}
                  disabled={!!editingTimesheet && !isChanged}
                  className={`rounded-lg px-5 py-2 text-white ${
                    editingTimesheet && !isChanged
                      ? "cursor-not-allowed bg-gray-300"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {editingTimesheet ? "Update Timesheet" : "Save Timesheet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
