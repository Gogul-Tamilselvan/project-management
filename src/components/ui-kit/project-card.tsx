import { motion } from "framer-motion";
import { CalendarDays, Eye, Pencil, Trash2 } from "lucide-react";
import type { Project } from "@/lib/types";
import { employeesById } from "@/lib/data";
import { formatShortDate } from "@/lib/format";
import { AvatarStack } from "./avatar-stack";
import { ProgressBar } from "./progress-bar";
import { ProjectStatusBadge } from "./status-badges";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  project: Project;
  onView?: (p: Project) => void;
  onEdit?: (p: Project) => void;
  onDelete?: (p: Project) => void;
}

export function ProjectCard({ project, onView, onEdit, onDelete }: ProjectCardProps) {
  const team = project.teamIds.map((id) => employeesById[id]).filter(Boolean);

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-elegant"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-foreground">{project.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-foreground">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} />
      </div>

      <div className="flex items-center justify-between">
        <AvatarStack users={team} />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          Due {formatShortDate(project.dueDate)}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => onView?.(project)}>
          <Eye className="mr-1.5 h-3.5 w-3.5" /> View
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onEdit?.(project)} aria-label="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => onDelete?.(project)}
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.article>
  );
}
