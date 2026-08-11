import { useEffect, useState } from "react";
import { connectSupabase } from "../../services/config";
import { useParams } from "react-router-dom";

type TaskStatus = | "todo" | "in_progress" | "review" | "completed";

interface KanbanTask {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority?: string;
    assigneeId?: string;
    dueDate?: string;
    projectId: string;
}

interface Employee {
    id: string;
    name: string;
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


    const [draggedTask, setDraggedTask] =
        useState<KanbanTask | null>(null);

    const { projectId } = useParams<{
        projectId: string;
    }>();


    useEffect(() => {
        if (projectId) {
            fetchTasks();
            fetchEmployees();
        } else {
            setLoading(false);
        }
    }, [projectId]);


    const fetchTasks = async () => {
        try {
            setLoading(true);

            const { data, error } = await connectSupabase
                .from("task")
                .select("*")
                .eq("projectId", projectId);

            if (error) {
                console.error(
                    "Error fetching tasks:",
                    error
                );
                return;
            }

            console.log(
                "Selected project ID:",
                projectId
            );

            console.log(
                "Project tasks:",
                data
            );

            setTasks(data || []);
        } catch (error) {
            console.error(
                "Unexpected error:",
                error
            );
        } finally {
            setLoading(false);
        }
    };


    const fetchEmployees = async () => {
        const { data, error } = await connectSupabase
            .from("employee")
            .select("id, name");

        if (error) {
            console.error(
                "Error fetching employees:",
                error
            );
            return;
        }

        console.log(
            "Employees:",
            data
        );

        setEmployees(data || []);
    };


    const getAssigneeName = (
        assigneeId?: string
    ) => {
        if (!assigneeId) {
            return "Unassigned";
        }

        const employee = employees.find(
            (employee) =>
                employee.id === assigneeId
        );

        return employee?.name || "Unknown";
    };


    const handleDragStart = (
        task: KanbanTask
    ) => {
        setDraggedTask(task);
    };


    const handleDrop = async (
        newStatus: TaskStatus
    ) => {
        if (!draggedTask) {
            return;
        }


        if (
            draggedTask.status === newStatus
        ) {
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
                console.error(
                    "Error updating task status:",
                    error
                );
                return;
            }


            setTasks((previousTasks) =>
                previousTasks.map((task) =>
                    task.id === draggedTask.id
                        ? {
                            ...task,
                            status: newStatus,
                        }
                        : task
                )
            );

            console.log(
                "Task status updated:",
                newStatus
            );
        } catch (error) {
            console.error(
                "Unexpected error:",
                error
            );
        } finally {
            setDraggedTask(null);
        }
    };

    // Loading
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
                <p className="text-red-500">
                    Project ID not found.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Kanban Board
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Manage and track tasks for this project
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

                {columns.map((column) => {
                    const columnTasks = tasks.filter(
                        (task) => task.status === column.id
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
                                    <h2
                                        className={`font-semibold ${style.header}`}
                                    >
                                        {column.title}
                                    </h2>

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
                                            <div className="mb-2 text-2xl text-slate-300">
                                                +
                                            </div>

                                            <p className="text-sm font-medium text-slate-400">
                                                No tasks
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                Drop a task here
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    columnTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            draggable
                                            onDragStart={() =>
                                                handleDragStart(task)
                                            }
                                            onDragEnd={() =>
                                                setDraggedTask(null)
                                            }
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
                            ${task.priority.toLowerCase() ===
                                                                "high"
                                                                ? "bg-red-100 text-red-700"
                                                                : task.priority.toLowerCase() ===
                                                                    "medium"
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
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <span>📅</span>

                                                    <span>
                                                        {`Due Date: ${task.dueDate}`}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="mt-3 flex items-center gap-2">

                                                <div
                                                    className="
                          flex h-7 w-7
                          items-center justify-center
                          rounded-full
                          bg-slate-100
                          text-xs font-semibold
                          text-slate-600
                        "
                                                >
                                                    {getAssigneeName(
                                                        task.assigneeId
                                                    )
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <span className="text-xs font-medium text-slate-600">
                                                    {getAssigneeName(
                                                        task.assigneeId
                                                    )}
                                                </span>

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
                                        Drop task heref
                                    </div>
                                </div>
                            )}

                        </div>
                    );
                })}

            </div>
        </div>
    );


}

