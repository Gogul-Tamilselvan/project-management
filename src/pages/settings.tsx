import { Bell, Palette, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { connectSupabase } from "@/services/config";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function SettingsPage() {
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [workspaceUrl, setWorkspaceUrl] = useState<string>("");

  const [compactMode, setCompactMode] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const [twoFactor, setTwoFactor] = useState(false);

  const handleCancel = () => {
    loadSettings();
  };

  const loadSettings = async () => {
    const { data, error } = await connectSupabase
      .from("workspace_settings")
      .select("*")
      .eq("id", "8c91f0ad-932e-4ac5-acc8-9ba9d8e83243")
      .single();

    if (error) {
      console.error("LOAD ERROR:", error);
      return;
    }

    if (data) {
      setWorkspaceName(data.workspace_name);
      setWorkspaceUrl(data.workspace_url);

      setCompactMode(data.compact_mode);
      setReduceMotion(data.reduce_motion);

      setEmailNotifications(data.email_notifications);
      setPushNotifications(data.push_notifications);
      setWeeklyDigest(data.weekly_digest);

      setTwoFactor(data.two_factor);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("compact-mode", compactMode);
  }, [compactMode]);

  useEffect(() => {
    document.body.classList.toggle("reduce-motion", reduceMotion);
  }, [reduceMotion]);

  const handleSave = async () => {
    const { data: userData } = await connectSupabase.auth.getUser();

    if (!userData.user) {
      alert("User is not logged in");
      return;
    }

    const { error } = await connectSupabase
      .from("workspace_settings")
      .update({
        workspace_name: workspaceName,
        workspace_url: workspaceUrl,
        compact_mode: compactMode,
        reduce_motion: reduceMotion,
        email_notifications: emailNotifications,
        push_notifications: pushNotifications,
        weekly_digest: weeklyDigest,
        two_factor: twoFactor,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "8c91f0ad-932e-4ac5-acc8-9ba9d8e83243");

    if (error) {
      console.error("SAVE ERROR:", error);
      alert(error.message);
      return;
    }

    toast.success("Settings saved successfully");
  };

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

            <Input
              id="s-name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="s-slug">Workspace URL</Label>

            <Input
              id="s-slug"
              value={workspaceUrl}
              onChange={(e) => setWorkspaceUrl(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>
      </Section>

      <Section icon={Palette} title="Appearance" description="Customize how Plane looks for you.">
        <ToggleRow
          label="Compact mode"
          description="Reduce padding and font sizes throughout the app."
          checked={compactMode}
          onChange={setCompactMode}
        />

        <ToggleRow
          label="Reduce motion"
          description="Minimize non-essential animations."
          checked={reduceMotion}
          onChange={setReduceMotion}
        />
      </Section>

      <Section
        icon={Bell}
        title="Notifications"
        description="Choose how you'd like to be notified."
      >
        <ToggleRow
          label="Email notifications"
          description="Get an email when you're mentioned or assigned."
          checked={emailNotifications}
          onChange={setEmailNotifications}
        />

        <ToggleRow
          label="Push notifications"
          description="Real-time notifications in your browser."
          checked={pushNotifications}
          onChange={setPushNotifications}
        />

        <ToggleRow
          label="Weekly digest"
          description="A summary of team activity every Monday."
          checked={weeklyDigest}
          onChange={setWeeklyDigest}
        />
      </Section>

      <Section icon={Shield} title="Security" description="Protect your account.">
        <ToggleRow
          label="Two-factor authentication"
          description="Add an extra layer of security to your account."
          checked={twoFactor}
          onChange={setTwoFactor}
        />
      </Section>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>

        <Button onClick={handleSave}>Save changes</Button>
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
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>

        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
