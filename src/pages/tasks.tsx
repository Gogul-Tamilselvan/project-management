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

interface empName {
  emp_name: string;
  avatarUrl: string;
}
interface proTitle {
  project_name: string;
}

export function TasksPage() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<Priority | "all">("all");
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [project, setProject] = useState<proTitle[]>([]);
  const [empName, setEmpName] = useState<empName[]>([]);
  const [task, settask] = useState<taskType[]>([]);

  const getTasks = async () => {
    const { data, error } = await connectSupabase.from("task").select("*");
    if (error) {
      console.log(error.message);
    } else {
      console.log(data);
      settask(data);
    }
  };

  const getEmployeName = async () => {
    const { data, error } = await connectSupabase.from("employee").select("avatarUrl,emp_name");
    if (error) {
      console.log(error.message);
    } else {
      setEmpName(data);
      console.log(data);
    }

    getTasks();
  };

  const getProjectTitle = async () => {
    const { data, error } = await connectSupabase.from("projects").select("project_name");
    if (error) {
      console.log(error.message);
    } else {
      setProject(data);
      console.log(data);
    }

    getTasks();
  };

  const dropTask = async (id: number) => {
    const { data, error } = await connectSupabase.from("task").delete().eq("id", id);
  };

  useEffect(() => {
    getEmployeName();
    getProjectTitle();
    getTasks();
  }, []);

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
                      <TableCell className="text-sm text-muted-foreground">{t.project}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={t?.emp_image} alt={t.assignee} />
                            <AvatarFallback className="text-[10px]">
                              {initials(t.assignee ?? "")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-foreground">{t.assignee}</span>
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
                          {formatShortDate(t.duedate)}
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
                            <DropdownMenuItem>Open</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
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
    </div>
  );
}

interface taskType {
  id: number;
  title: string;
  description?: string;
  project: string;
  assignee: string;
  priority: Priority;
  status: TaskStatus;
  duedate: string;
  emp_image: string;
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
  const [projectDetail, setprojectDetail] = useState<taskType>({
    id: 0,
    title: "",
    description: "",
    project: "",
    assignee: "",
    priority: "low",
    status: "in_progress",
    duedate: "",
    emp_image: "",
  });

  const addTask = async () => {
    if (
      projectDetail.title != "" &&
      projectDetail.description != "" &&
      projectDetail.duedate != "" &&
      projectDetail.assignee != ""
    ) {
      const { data, error } = await connectSupabase.from("task").insert({
        title: projectDetail.title,
        description: projectDetail.description,
        project: projectDetail.project,
        assignee: projectDetail.assignee,
        duedate: projectDetail.duedate,
        priority: projectDetail.priority,
        status: projectDetail.status,
        emp_image: projectDetail.emp_image,
      });

      if (error) {
        console.log(error.message);
      } else {
        onOpenChange(false);
        console.log(data);
      }
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
          <Label htmlFor="t-name">Task title</Label>
          <Input
            id="t-name"
            placeholder="What needs to get done?"
            className="mt-1.5"
            required
            onChange={(e) => setprojectDetail((prev) => ({ ...prev, title: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="t-desc">Description</Label>
          <Textarea
            id="t-desc"
            required
            rows={3}
            className="mt-1.5"
            onChange={(e) => setprojectDetail((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>
        <div>
          <Label>Project</Label>
          <Select
            required
            onValueChange={(val) => setprojectDetail((prev) => ({ ...prev, projectId: val }))}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projectTitle?.map((p, idx: number) => (
                <SelectItem key={idx} value={p.project_name}>
                  {p.project_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Assignee</Label>
          <Select
            required
            onValueChange={(val) => {
              const employee = JSON.parse(val);

              setprojectDetail((prev) => ({
                ...prev,
                assigneeId: employee.emp_name,
                emp_image: employee.avatarUrl,
              }));
            }}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>

            <SelectContent>
              {empName?.map((e, idx: number) => (
                <SelectItem
                  key={idx}
                  value={JSON.stringify({
                    emp_name: e.emp_name,
                    avatarUrl: e.avatarUrl,
                  })}
                >
                  {e.emp_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Priority</Label>
          <Select
            required
            defaultValue="medium"
            onValueChange={(val: Priority) =>
              setprojectDetail((prev) => ({ ...prev, priority: val }))
            }
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
          <Label htmlFor="t-due">Due date</Label>
          <Input
            id="t-due"
            required
            type="date"
            className="mt-1.5"
            onChange={(e) => setprojectDetail((prev) => ({ ...prev, dueDate: e.target.value }))}
          />
        </div>
      </form>
    </Modal>
  );
}
