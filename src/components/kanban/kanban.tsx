import { useEffect, useState } from "react";
import { connectSupabase } from "../../services/config";
import { useParams } from "react-router-dom";

type TaskStatus =
    | "todo"
    | "in_progress"
    | "review"
    | "completed";

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
    const [loading, setLoading] = useState(true);

    const [draggedTask, setDraggedTask] =
        useState<KanbanTask | null>(null);

    const { projectId } = useParams<{
        projectId: string;
    }>();


    useEffect(() => {
        if (projectId) {
            fetchTasks();
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
                        : task
                )
            );

            console.log("Task status updated:", newStatus);
        } catch (error) {
            console.error("Unexpected error:", error);
        } finally {
            setDraggedTask(null);
        }
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
                <p className="text-red-500">
                    Project ID not found.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold">
                    Kanban Board
                </h1>

                <p className="text-sm text-muted-foreground">
                    Manage tasks for this project
                </p>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

                {columns.map((column) => {
                    const columnTasks =
                        tasks.filter(
                            (task) =>
                                task.status === column.id
                        );

                    return (
                        <div
                            key={column.id}

                            // Allow drop
                            onDragOver={(event) => {
                                event.preventDefault();
                            }}

                            // Handle drop
                            onDrop={() => {
                                handleDrop(column.id);
                            }}

                            className="rounded-lg bg-muted/50 p-4"
                        >

                            {/* Column Header */}
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-semibold">
                                    {column.title}
                                </h2>

                                <span className="rounded-full bg-background px-2 py-1 text-xs">
                                    {columnTasks.length}
                                </span>
                            </div>

                            {/* Tasks */}
                            <div className="min-h-[400px] space-y-3">

                                {columnTasks.length === 0 ? (
                                    <div className="rounded-lg border border-dashed p-6 text-center">
                                        <p className="text-sm text-muted-foreground">
                                            No tasks
                                        </p>
                                    </div>
                                ) : (
                                    columnTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            draggable
                                            onDragStart={() => handleDragStart(task)}
                                            onDragEnd={() => setDraggedTask(null)}
                                            className="cursor-grab rounded-lg border bg-background p-4 shadow-sm active:cursor-grabbing"
                                        >
                                            <h3 className="font-medium">
                                                {`Title: ${task.title}`}
                                            </h3>
                                            {task.description && (
                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    {`Description: ${task.description}`}
                                                </p>
                                            )}

                                            {task.priority && (
                                                <p className="mt-3 text-xs">
                                                    {`Priority: ${task.priority}`}
                                                </p>
                                            )}

                                            {task.dueDate && (
                                                <p className="mt-1 text-xs">
                                                    {`Due Date: ${task.dueDate}`}
                                                </p>
                                            )}

                                            {task.assigneeId && (
                                                <p className="mt-1 text-xs">
                                                    {`Assignee ID: ${task.assigneeId}`}
                                                </p>
                                            )}

                                        </div>
                                    ))
                                )}

                            </div>
                        </div>
                    );
                })}

            </div>
        </div>
    );
}
