import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, Building2, Briefcase, Pencil, KeyRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui-kit/modal";
import { EmployeeStatusBadge } from "@/components/ui-kit/status-badges";
import { mockCurrentUser } from "@/lib/mock/employees";
import { mockTasks } from "@/lib/mock/tasks";
import { mockProjects } from "@/lib/mock/projects";
import { initials } from "@/lib/format";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const [editOpen, setEditOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const u = mockCurrentUser;

  const myTasks = mockTasks.filter((t) => t.assigneeId === u.id).length;
  const myProjects = mockProjects.filter((p) => p.teamIds.includes(u.id)).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your personal information and account details.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <Avatar className="h-24 w-24 ring-4 ring-primary-soft">
              <AvatarImage src={u.avatarUrl} alt={u.name} />
              <AvatarFallback className="text-2xl">{initials(u.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold text-foreground">{u.name}</h2>
                <EmployeeStatusBadge status={u.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{u.role}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setEditOpen(true)} className="gap-1.5">
                  <Pencil className="h-3.5 w-3.5" /> Edit profile
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setPwOpen(true)} className="gap-1.5">
                  <KeyRound className="h-3.5 w-3.5" /> Change password
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-2">
            <InfoRow icon={Mail} label="Email" value={u.email} />
            <InfoRow icon={Phone} label="Phone" value={u.phone} />
            <InfoRow icon={Building2} label="Department" value={u.department} />
            <InfoRow icon={Briefcase} label="Role" value={u.role} />
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <StatBlock label="Active projects" value={myProjects} />
          <StatBlock label="Assigned tasks" value={myTasks} />
          <StatBlock label="Tasks completed" value={mockTasks.filter((t) => t.assigneeId === u.id && t.status === "completed").length} />
        </div>
      </div>

      <Modal
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit profile"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => setEditOpen(false)}>Save changes</Button>
          </>
        }
      >
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
          <div className="sm:col-span-2">
            <Label htmlFor="pr-name">Full name</Label>
            <Input id="pr-name" defaultValue={u.name} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="pr-email">Email</Label>
            <Input id="pr-email" defaultValue={u.email} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="pr-phone">Phone</Label>
            <Input id="pr-phone" defaultValue={u.phone} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="pr-dept">Department</Label>
            <Input id="pr-dept" defaultValue={u.department} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="pr-role">Role</Label>
            <Input id="pr-role" defaultValue={u.role} className="mt-1.5" />
          </div>
        </form>
      </Modal>

      <Modal
        open={pwOpen}
        onOpenChange={setPwOpen}
        title="Change password"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPwOpen(false)}>Cancel</Button>
            <Button onClick={() => setPwOpen(false)}>Update password</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <Label htmlFor="pw-current">Current password</Label>
            <Input id="pw-current" type="password" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="pw-new">New password</Label>
            <Input id="pw-new" type="password" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="pw-confirm">Confirm new password</Label>
            <Input id="pw-confirm" type="password" className="mt-1.5" />
          </div>
        </form>
      </Modal>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
    </div>
  );
}
