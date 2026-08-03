import { useEffect, useState } from "react";
import { Plus, MoreHorizontal, CalendarDays, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Modal } from "@/components/ui-kit/modal";
import { PriorityPill, TaskStatusBadge } from "@/components/ui-kit/status-badges";
import { formatShortDate, initials } from "@/lib/format";
import type { Priority, Task, TaskStatus } from "@/lib/types";
import { connectSupabase } from "@/services/config";
import { toast } from "sonner";

interface empName {
  id: string;
  name: string;
}
interface proTitle {
  id: string;
  project_name: string;
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
const statusLabels = {
  todo: "Todo",
  in_progress: "In Progress",
  review: "Review",
  completed: "Completed",
};
const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function TasksPage() {
  const [open, setOpen] = useState<boolean>(false);
  const [viewTask, setViewTask] = useState<boolean>(false);
  const [editTask, setEditTask] = useState<boolean>(false);
  const [taskdetail, settaskdetail] = useState<TaskDetail>();
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<Priority | "all">("all");
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [project, setProject] = useState<proTitle[]>([]);
  const [empName, setEmpName] = useState<empName[]>([]);
  const [task, settask] = useState<TaskDetail[]>([]);

  
  const getTasks = async () => {
    const { data, error } = await connectSupabase
      .from("task")
      .select("*,projects(project_name),employee(name,avatarUrl)");
    if (error) {
      toast.error(error.message);
    } else {
      settask(data);
    }
  };

  const getEmployeName = async () => {
    const { data, error } = await connectSupabase.from("employee").select("name,id");
    if (error) {
      toast.error(error.message);
    } else {
      setEmpName(data);
    }
    getTasks();
  };

  const getProjectTitle = async () => {
    const { data, error } = await connectSupabase.from("projects").select("project_name,id");
    if (error) {
      toast.error(error.message);
    } else {
      setProject(data);
    }
    getTasks();
  };

  const dropTask = async (id: string) => {
    const { error } = await connectSupabase.from("task").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else toast.success("Deleted successfully!");
    getTasks();
  };

  useEffect(() => {
    getEmployeName();
    getProjectTitle();
    getTasks();
  }, [open, viewTask, editTask]);

  const visible = task?.filter(
    (t) =>
      (priority === "all" || t.priority === priority) &&
      (status === "all" || t.status === status) &&
      (query === "" || t.title.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Tasks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All tasks across every project, in one place.
          </p>
        </div>
        <Button className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Create task
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={priority} onValueChange={(v) => setPriority(v as Priority | "all")}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus | "all")}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="todo">To do</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="review">In review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="pl-6">Task</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length == 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-15 text-center align-middle text-muted-foreground"
                  >
                    No results found
                  </TableCell>
                </TableRow>
              ) : (
                visible?.map((t, idx) => {
                  return (
                    <TableRow key={idx} className="border-border">
                      <TableCell className="pl-6 py-3.5">
                        <div className="font-medium text-foreground">{t.title}</div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {t?.projects?.project_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage
                              src={
                                connectSupabase.storage
                                  .from("Employee")
                                  .getPublicUrl(t?.employee?.avatarUrl).data.publicUrl
                              }
                              alt={t?.employee?.name}
                            />
                            <AvatarFallback className="text-[10px]">
                              {initials(t.assigneeId ?? "")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-foreground">{t.employee.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <PriorityPill priority={t.priority} />
                      </TableCell>
                      <TableCell>
                        <TaskStatusBadge status={t.status} />
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatShortDate(t.dueDate)}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setViewTask(true);
                                settaskdetail(t);
                              }}
                            >
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditTask(true);
                                settaskdetail(t);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => dropTask(t.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <CreateTaskModal
        open={open}
        onOpenChange={setOpen}
        empName={empName}
        projectTitle={project}
      />

      {taskdetail && <ViewTask open={viewTask} onOpenChange={setViewTask} value={taskdetail} />}
      {taskdetail && (
        <EditTask
          open={editTask}
          onOpenChange={setEditTask}
          value={taskdetail}
          empName={empName}
          project={project}
        />
      )}
    </div>
  );
}

function CreateTaskModal({
  open,
  onOpenChange,
  empName,
  projectTitle,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  empName: empName[];
  projectTitle: proTitle[];
}) {
  const [projectDetail, setprojectDetail] = useState<Task>({
    id: "",
    title: "",
    description: "",
    projectId: "",
    assigneeId: "",
    priority: "low",
    status: "in_progress",
    dueDate: "",
  });

  const addTask = async () => {
    if (
      projectDetail.title != "" &&
      projectDetail.description != "" &&
      projectDetail.dueDate != "" &&
      projectDetail.assigneeId != ""
    ) {
      const { error } = await connectSupabase.from("task").insert({
        title: projectDetail.title,
        description: projectDetail.description,
        projectId: projectDetail.projectId,
        assigneeId: projectDetail.assigneeId,
        dueDate: projectDetail.dueDate,
        priority: projectDetail.priority,
        status: projectDetail.status,
      });

      if (error) {
        toast.error(error.message);
      } else {
        onOpenChange(false);
        toast.success("Task created");
      }

      setprojectDetail({
        assigneeId: "",
        dueDate: "",
        id: "",
        priority: "" as Priority,
        projectId: "",
        status: "" as TaskStatus,
        title: "",
        description: "",
      });
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Create new task"
      description="Add a new task and assign it to a teammate."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="task-from" onClick={addTask}>
            Create task
          </Button>
        </>
      }
    >
      <form
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        id="task-from"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="sm:col-span-2">
          <Label htmlFor="t-name">Task title <span className="text-red-500">*</span></Label>
          <Input
            id="t-name"
            placeholder="What needs to get done?"
            className="mt-1.5"
            value={projectDetail.title}
            required
            onChange={(e) => setprojectDetail((prev) => ({ ...prev, title: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="t-desc">Description <span className="text-red-500">*</span></Label>
          <Textarea
            id="t-desc"
            value={projectDetail.description}
            required
            rows={3}
            className="mt-1.5"
            onChange={(e) => setprojectDetail((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>
        <div>
          <Label>Project <span className="text-red-500">*</span></Label>
          <Select
            value={projectDetail.projectId}
            required
            onValueChange={(val) => setprojectDetail((prev) => ({ ...prev, projectId: val }))}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projectTitle?.map((p, idx: number) => (
                <SelectItem key={idx} value={p.id}>
                  {p.project_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Assignee <span className="text-red-500">*</span></Label>
          <Select
            value={projectDetail.assigneeId}
            required
            onValueChange={(val) => {
              setprojectDetail((prev) => ({ ...prev, assigneeId: val }));
            }}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>

            <SelectContent>
              {empName?.map((e, idx: number) => (
                <SelectItem key={idx} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
<<<<<<< HEAD
          <Label>Priority <span className="text-red-500">*</span></Label>
          <Select
            required
            value={projectDetail.priority}
            defaultValue="low"
            onValueChange={(val: Priority) =>
              setprojectDetail((prev) => ({ ...prev, priority: val }))
            }
          >
=======
          <Label>Priority</Label>
         <Select
           required  value={projectDetail.priority}
         defaultValue="low"
  onValueChange={(val: Priority) =>
    setprojectDetail((prev) => ({
      ...prev,
      priority: val,
    }))
  }
>
>>>>>>> bb3f60fe09e6926afa3a002678a32c269471a555
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="t-due">Due date <span className="text-red-500">*</span></Label>
          <Input
            id="t-due"
            required
            type="date"
            value={projectDetail.dueDate}
            className="mt-1.5"
            onChange={(e) => setprojectDetail((prev) => ({ ...prev, dueDate: e.target.value }))}
          />
        </div>
      </form>
    </Modal>
  );
}

function ViewTask({
  open,
  onOpenChange,
  value,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  value: TaskDetail;
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="View task"
      description="View task details and track its progress."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </>
      }
    >
      <form className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="t-name">Task title <span className="text-red-500">*</span></Label>
          <Input id="t-name" className="mt-1.5" required readOnly defaultValue={value?.title} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="t-desc">Description <span className="text-red-500">*</span></Label>
          <Textarea
            id="t-desc"
            required
            rows={3}
            className="mt-1.5"
            readOnly
            defaultValue={value?.description}
          />
        </div>
        <div>
          <Label>Project <span className="text-red-500">*</span></Label>
          <Input
            id="t-name"
            placeholder="What needs to get done?"
            className="mt-1.5"
            required
            readOnly
            defaultValue={value?.projects?.project_name}
          />
        </div>
        <div>
          <Label>Assignee <span className="text-red-500">*</span></Label>
          <Input
            id="t-name"
            placeholder="What needs to get done?"
            className="mt-1.5"
            required
            readOnly
            defaultValue={value?.employee?.name}
          />
        </div>
        <div>
          <Label>Priority <span className="text-red-500">*</span></Label>
          <Input
            id="t-name"
            placeholder="What needs to get done?"
            className="mt-1.5"
            required
            readOnly
            defaultValue={priorityLabels[value?.priority as keyof typeof priorityLabels]}
          />
        </div>
        <div>
          <Label>Status <span className="text-red-500">*</span></Label>
          <Input
            id="t-name"
            placeholder="What needs to get done?"
            className="mt-1.5"
            required
            readOnly
            defaultValue={statusLabels[value?.status as keyof typeof statusLabels]}
          />
        </div>
        <div>
          <Label htmlFor="t-due">Due date <span className="text-red-500">*</span></Label>
          <Input
            id="t-due"
            required
            type="date"
            readOnly
            className="mt-1.5"
            defaultValue={value?.dueDate}
          />
        </div>
      </form>
    </Modal>
  );
}

function EditTask({
  open,
  onOpenChange,
  value,
  empName,
  project,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  value: TaskDetail;
  empName: empName[];
  project: proTitle[];
}) {
  const [editTask, setEditTask] = useState<Task>({
    id: value?.id,
    title: value?.title,
    description: value?.description,
    projectId: value?.projectId,
    assigneeId: value?.assigneeId,
    priority: value?.priority,
    status: value?.status,
    dueDate: value?.dueDate,
    // emp_image: value?.emp_image,
  });
  const [isEdited, setIsEdited] = useState(false);
  useEffect(() => {
  if (open) {
    setEditTask({
      id: value.id,
      title: value.title,
      description: value.description,
      projectId: value.projectId,
      assigneeId: value.assigneeId,
      priority: value.priority,
      status: value.status,
      dueDate: value.dueDate,
    });
    setIsEdited(false);
  }
}, [open, value]);
    
  const editTaskfun = async (id: string) => {
    const { error } = await connectSupabase
      .from("task")
      .update({
        title: editTask.title,
        description: editTask.description,
        projectId: editTask.projectId,
        assigneeId: editTask.assigneeId,
        dueDate: editTask.dueDate,
        priority: editTask.priority,
        status: editTask.status,
        // emp_image: editTask.emp_image,
      })
      .eq("id", id);

    if (error) {
      toast.error(error.message);
    } else {
      onOpenChange(false);
      toast.success("Updated task");
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit task"
      description="Modify task details and assignments."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
         <Button
  disabled={!isEdited}
  onClick={() => editTaskfun(value.id)}
>
  Update
</Button>
        </>
      }
    >
      <form
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        id="task-from"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="sm:col-span-2">
          <Label htmlFor="t-name">Task title <span className="text-red-500">*</span></Label>
          <Input
            id="t-name"
            placeholder="What needs to get done?"
            className="mt-1.5"
            required

           value={editTask.title}
           onChange={(e) => {
  setIsEdited(true);

  setEditTask((prev) => ({
    ...prev,
    title: e.target.value,
  }));
}}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="t-desc">Description <span className="text-red-500">*</span></Label>
          <Textarea
            id="t-desc"
            required
            rows={3}
            className="mt-1.5"

             value={editTask.description}
            onChange={(e) => {
  setIsEdited(true);

  setEditTask((prev) => ({
    ...prev,
    description: e.target.value,
  }));
}}
          />
        </div>
        <div>
          <Label>Project <span className="text-red-500">*</span></Label>
          <Select
            required
            defaultValue={value?.projectId}
           onValueChange={(val) => {
  setIsEdited(true);

  setEditTask((prev) => ({
    ...prev,
    projectId: val,
  }));
}}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {project?.map((p, idx: number) => (
                <SelectItem key={idx} value={p.id}>
                  {p.project_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Assignee <span className="text-red-500">*</span></Label>
          <Select
<<<<<<< HEAD
            required
            defaultValue={value?.assigneeId}
            onValueChange={(val) => setEditTask((prev) => ({ ...prev, assigneeId: val }))}
=======
           value={editTask.assigneeId}
           onValueChange={(val) => {
  setIsEdited(true);

  setEditTask((prev) => ({
    ...prev,
    assigneeId: val,
  }));
}}
>>>>>>> bb3f60fe09e6926afa3a002678a32c269471a555
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>

            <SelectContent>
              {empName?.map((e, idx: number) => (
                <SelectItem key={idx} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Priority <span className="text-red-500">*</span></Label>
          <Select
            required
            value={editTask.priority}
            onValueChange={(val: Priority) => setEditTask((prev) => ({ ...prev, priority: val }))}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status <span className="text-red-500">*</span></Label>
          <Select
            required
           value={editTask.status}
            onValueChange={(val: TaskStatus) => {
  setIsEdited(true);
  setEditTask((prev) => ({
    ...prev,
    status: val,
  }));
}}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">Todo</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="t-due">Due date <span className="text-red-500">*</span></Label>
          <Input
            id="t-due"
            required
            type="date"

            className="mt-1.5"
            value={editTask.dueDate}
           onChange={(e) => {
  setIsEdited(true);
  setEditTask((prev) => ({
    ...prev,
    dueDate: e.target.value,
  }));
}}
          />
        </div>
      </form>
    </Modal>
  );
}
