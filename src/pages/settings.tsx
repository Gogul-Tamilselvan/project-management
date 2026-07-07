import { Bell, Palette, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your workspace, notifications, and preferences.
        </p>
      </div>

      <Section icon={User} title="Account" description="Update your account information.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="s-name">Workspace name</Label>
            <Input id="s-name" defaultValue="Plane HQ" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="s-slug">Workspace URL</Label>
            <Input id="s-slug" defaultValue="plane.app/hq" className="mt-1.5" />
          </div>
        </div>
      </Section>

      <Section icon={Palette} title="Appearance" description="Customize how Plane looks for you.">
        <ToggleRow label="Compact mode" description="Reduce padding and font sizes throughout the app." />
        <ToggleRow label="Reduce motion" description="Minimize non-essential animations." />
      </Section>

      <Section icon={Bell} title="Notifications" description="Choose how you'd like to be notified.">
        <ToggleRow label="Email notifications" description="Get an email when you're mentioned or assigned." defaultOn />
        <ToggleRow label="Push notifications" description="Real-time notifications in your browser." defaultOn />
        <ToggleRow label="Weekly digest" description="A summary of team activity every Monday." />
      </Section>

      <Section icon={Shield} title="Security" description="Protect your account.">
        <ToggleRow label="Two-factor authentication" description="Add an extra layer of security to your account." />
      </Section>

      <div className="flex justify-end gap-2">
        <Button variant="ghost">Cancel</Button>
        <Button>Save changes</Button>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof User;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-soft">
      <div className="flex items-start gap-3 border-b border-border px-6 py-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="space-y-4 p-6">{children}</div>
    </section>
  );
}

function ToggleRow({
  label,
  description,
  defaultOn,
}: {
  label: string;
  description: string;
  defaultOn?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultOn} />
    </div>
  );
}
