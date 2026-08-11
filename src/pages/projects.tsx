import { useState, useEffect } from "react";
import { Plus, Search, FolderKanban } from "lucide-react";
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
import { ProjectCard } from "@/components/ui-kit/project-card";
import { Modal } from "@/components/ui-kit/modal";
import { EmptyState } from "@/components/ui-kit/empty-state";
import type { ProjectStatus, Project } from "@/lib/types";
import { connectSupabase } from "@/services/config";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const filters: Array<{ label: string; value: ProjectStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "In Progress", value: "in_progress" },
  { label: "To Do", value: "todo" },
  { label: "Review", value: "review" },
  { label: "Completed", value: "completed" },
];

export function ProjectsPage() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "all">("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [mode, setMode] = useState<"create" | "edit" | "view">("create");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  useEffect(() => {
    getProjects();
  }, []);

  const handleDelete = async () => {
    if (!selectedProject) return;

    // Check whether this project has assigned tasks
    const { data: tasks, error: taskError } = await connectSupabase
      .from("task")
      .select("id")
      .eq("projectId", selectedProject.id);

    if (taskError) {
      console.error("Task check error:", taskError);
      toast.error("Unable to check project tasks");
      return;
    }

    // Project has assigned tasks
    if (tasks && tasks.length > 0) {
      toast.error("Tasks assigned to this project");

      setIsDeleteOpen(false);
      setSelectedProject(null);
      return;
    }
    // Delete project if no tasks are assigned
    const { error } = await connectSupabase
      .from("projects")
      .delete()
      .eq("id", selectedProject.id);

    if (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete project");
      return;
    }

    toast.success("Project deleted successfully");

    setIsDeleteOpen(false);
    setSelectedProject(null);

    getProjects();
  };

  const handleEdit = (project: Project) => {
    setMode("edit");
    setEditingProject(project);
    setOpen(true);
  };

  const navigate = useNavigate();
  const handleView = (project: Project) => {
    navigate(`/kanban/${project.id}`);
  };

  const getProjects = async () => {
    const { data, error } = await connectSupabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    const formattedProjects: Project[] = data.map((item) => ({
      id: item.id,
      name: item.project_name,
      description: item.description,
      status: item.status,
      progress: 0,
      startDate: item.start_date,
      dueDate: item.end_date,
      teamIds: [],
    }));

    setProjects(formattedProjects);
  };

  const visible = projects.filter(
    (p) =>
      (status === "all" || p.status === status) &&
      (query === "" || p.name.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Plan, track, and ship every initiative across your workspace.
          </p>
        </div>
        <Button
          className="gap-1.5"
          onClick={() => {
            setEditingProject(null);
            setMode("create");
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Create project
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
                (status === f.value
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground")
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Try clearing your filters or create a new project to get started."
          actionLabel="Create project"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onEdit={handleEdit}
              onDelete={() => {
                setSelectedProject(p);
                setIsDeleteOpen(true);
              }}
              onView={handleView}
            />
          ))}
        </div>
      )}

      <CreateProjectModal
        open={open}
        onOpenChange={setOpen}
        onCreate={getProjects}
        editingProject={editingProject}
        mode={mode}
        resetModal={() => {
          setEditingProject(null);
          setMode("create");
        }}
      />
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-xl font-bold">Delete Project</h2>

            <p className="mt-3">Are you sure you want to delete this project?</p>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setSelectedProject(null);
                }}
              >
                Cancel
              </Button>

              <Button variant="destructive" onClick={handleDelete}>
                Yes Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateProjectModal({
  open,
  onOpenChange,
  onCreate,
  editingProject,
  mode,
  resetModal,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: () => void;
  resetModal: () => void;
  editingProject: Project | null;
  mode: "create" | "edit" | "view";
}) {
  interface ProjectFormData {
    id: string;
    name: string;
    description: string;
    status: ProjectStatus;
    progress: number;
    startDate: string;
    dueDate: string;
    teamIds: string[];
  }

  const initialFormData: ProjectFormData = {
    id: "",
    name: "",
    description: "",
    status: "todo",
    progress: 0,
    startDate: "",
    dueDate: "",
    teamIds: [],
  };

  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [originalData, setOriginalData] = useState<ProjectFormData | null>(initialFormData);

  const resetForm = () => {
    setFormData(initialFormData);
    setOriginalData(initialFormData);
  };

  useEffect(() => {
    if (editingProject) {
      const projectData = {
        id: editingProject.id,
        name: editingProject.name,
        description: editingProject.description,
        status: editingProject.status,
        progress: editingProject.progress,
        startDate: editingProject.startDate,
        dueDate: editingProject.dueDate,
        teamIds: editingProject.teamIds,
      };

      setFormData(projectData);
      setOriginalData(projectData);
    } else {

      setFormData(initialFormData);
      setOriginalData(initialFormData);
    }
  }, [editingProject]);

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (mode === "view") return;

    if (editingProject) {
      // UPDATE PROJECT
      const { error } = await connectSupabase
        .from("projects")
        .update({
          project_name: formData.name,
          description: formData.description,
          status: formData.status,
          start_date: formData.startDate,
          end_date: formData.dueDate,
        })
        .eq("id", editingProject.id);

      if (error) {
        console.error("Update Error:", error);
        return;
      } else toast.success("Project updated successfully");
    } else {
      // CREATE PROJECT

      const { error } = await connectSupabase.from("projects").insert({
        project_name: formData.name,
        description: formData.description,
        status: formData.status,
        start_date: formData.startDate,
        end_date: formData.dueDate,
      });

      if (error) {
        console.error("Insert Error:", error);
        return;
      } else toast.success("Project created successfully");
    }

    // Refresh project list
    onCreate();

    // Reset form
    resetForm();

    resetModal();

    // Close modal
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          resetForm();
          resetModal();
        }
        onOpenChange(value);
      }}
      title={
        mode === "create"
          ? "Create New Project"
          : mode === "edit"
            ? "Edit Project"
            : "Project Details"
      }
      description={
        mode === "create"
          ? "Set up a new project. You can invite team members after creating."
          : mode === "edit"
            ? "Update your project details."
            : "View project information."
      }
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => {
              resetForm();
              resetModal();
              onOpenChange(false);
            }}
          >
            {mode === "view" ? "Close" : "Cancel"}
          </Button>
          {mode !== "view" && (
            <Button type="submit" form="project-form" disabled={mode === "edit" && !hasChanges}>
              {mode === "create" ? "Create Project" : "Update Project"}
            </Button>
          )}
        </>
      }
    >
      <form
        id="project-form"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        onSubmit={handleSubmit}
      >
        <div className="sm:col-span-2">
          <Label htmlFor="p-name">
            Project name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="p-name"
            placeholder="e.g. Mobile App v3"
            className="mt-1.5"
            name="name"
            value={formData.name}
            onChange={handleChange}
            readOnly={mode === "view"}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="p-desc">
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="p-desc"
            placeholder="What is this project about?"
            className="mt-1.5"
            rows={3}
            name="description"
            value={formData.description}
            onChange={handleChange}
            readOnly={mode === "view"}
            required
          />
        </div>
        <div>
          <Label htmlFor="p-start">
            Start date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="p-start"
            type="date"
            className="mt-1.5"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            onClick={(e) => {
              (e.currentTarget as HTMLInputElement).showPicker?.();
            }}
            readOnly={mode === "view"}
            required
          />
        </div>
        <div>
          <Label htmlFor="p-end">
            End date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="p-end"
            type="date"
            className="mt-1.5"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            onClick={(e) => {
              (e.currentTarget as HTMLInputElement).showPicker?.();

            }}
            readOnly={mode === "view"}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            disabled={mode === "view"}
            onValueChange={(value: string) =>
              setFormData((prev) => ({
                ...prev,
                status: value as ProjectStatus,
              }))
            }
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>
    </Modal>
  );
}