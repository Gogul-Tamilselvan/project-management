import { useState } from "react";
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
import { mockProjects } from "@/lib/mock/projects";
import type { ProjectStatus } from "@/lib/types";

const filters: Array<{ label: string; value: ProjectStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "In progress", value: "in_progress" },
  { label: "Planning", value: "planning" },
  { label: "On hold", value: "on_hold" },
  { label: "Completed", value: "completed" },
];

export function ProjectsPage() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "all">("all");

  const visible = mockProjects.filter(
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
        <Button className="gap-1.5" onClick={() => setOpen(true)}>
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
            <ProjectCard key={p.id} project={p} onView={() => console.log("view", p.id)} />
          ))}
        </div>
      )}

      <CreateProjectModal open={open} onOpenChange={setOpen} />
    </div>
  );
}

function CreateProjectModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Create new project"
      description="Set up a new project. You can invite team members after creating."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              console.log("create project (mock)");
              onOpenChange(false);
            }}
          >
            Create project
          </Button>
        </>
      }
    >
      <form
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="sm:col-span-2">
          <Label htmlFor="p-name">Project name</Label>
          <Input id="p-name" placeholder="e.g. Mobile App v3" className="mt-1.5" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="p-desc">Description</Label>
          <Textarea
            id="p-desc"
            placeholder="What is this project about?"
            className="mt-1.5"
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="p-start">Start date</Label>
          <Input id="p-start" type="date" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="p-end">End date</Label>
          <Input id="p-end" type="date" className="mt-1.5" />
        </div>
        <div className="sm:col-span-2">
          <Label>Status</Label>
          <Select defaultValue="planning">
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="on_hold">On hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>
    </Modal>
  );
}
