import { useState, useEffect } from "react";
import { Mail, Phone, Building2, Briefcase, Pencil, KeyRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui-kit/modal";
import { EmployeeStatusBadge } from "@/components/ui-kit/status-badges";
import { initials } from "@/lib/format";
import { connectSupabase } from "@/services/config";
import { Employee, EmployeeStatus } from "@/lib/types";
import { toast } from "sonner";


export function ProfilePage() {
  const [editOpen, setEditOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [user, setUser] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignedTasks, setAssignedTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);

  const [formData, setFormData] = useState<Employee>({
    id: "",
    name: "",
    email: "",
    phone: "",
    avatarUrl: "",
    department: "",
    role: "",
    status: "active",
  });
  const [isEdited, setIsEdited] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const updateProfile = async () => {
    if (!user) return;

    const { error } = await connectSupabase
      .from("employee")
      .update({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        role: formData.role,
      })
      .eq("id", user.id);

    if (error) {
      console.error(error);
      toast.error("Failed to update profile");
      return;
    }

    // Update local state immediately
    setUser(formData);

    // Close the modal
    setEditOpen(false);
     setIsEdited(false);
    // Optional success message
    toast.success("Profile updated successfully");

    // Reload latest data from Supabase
    fetchProfile();
  };

  const fetchStats = async (employeeId: string) => {
    const { data, error } = await connectSupabase.rpc(
      "get_employee_stats",
      { emp_id: employeeId }
    );

    if (error) {
      console.error(error);
      return;
    }

    const stats = data[0];

    setAssignedTasks(Number(stats.assigned_tasks));
    setCompletedTasks(Number(stats.completed_tasks));
    setActiveProjects(Number(stats.active_projects));
  };

  const changePassword = async () => {
    if (!passwordData.currentPassword) {
      toast.error("Enter current password");
      return;
    }

    if (!passwordData.newPassword) {
      toast.error("Enter new password");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const {
      data: { user },
    } = await connectSupabase.auth.getUser();

    if (!user?.email) {
      toast.error("User not found");
      return;
    }

    // Verify current password
    const { error: signInError } = await connectSupabase.auth.signInWithPassword({
      email: user.email,
      password: passwordData.currentPassword,
    });

    if (signInError) {
      toast.error("Current password is incorrect");
      return;
    }

    // Update password
    const { error } = await connectSupabase.auth.updateUser({
      password: passwordData.newPassword,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password updated successfully");
  setIsPasswordEdited(false);

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPwOpen(false);
  };
  const [isPasswordEdited, setIsPasswordEdited] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);

    const {
      data: { user: authUser },
    } = await connectSupabase.auth.getUser();

    if (!authUser) {
    setLoading(false);
    return;
  }
    const { data, error } = await connectSupabase
      .from("employee")
      .select("*")
      .eq("email", authUser.email)
      .maybeSingle();

    if (error) {
      console.error(error);
       setLoading(false);
    return;
    }  if (!data) {
      toast.error("Your employee profile was not found.");
    setUser(null);
    setLoading(false);
    return;
  }

  setUser(data);

  await fetchStats(data.id);
    setLoading(false);
  };

  if (loading) return null;

  if (!user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h2 className="text-3xl font-bold text-foreground">Profile not found</h2>

          <p className="mt-3 text-sm text-muted-foreground">
            We couldn't find an employee profile associated with your account. Please contact your
            administrator.
          </p>

          <Button className="mt-6" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your personal information and account details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <Avatar className="h-24 w-24 ring-4 ring-primary-soft">
              <AvatarImage src={
                  connectSupabase.storage
                    .from("Employee")
                    .getPublicUrl(user?.avatarUrl ?? "").data.publicUrl
                }
                alt={user?.name ?? ""}
              /> 
              <AvatarFallback className="text-2xl">{initials(user?.name ?? "")}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
                {user && <EmployeeStatusBadge status={user.status} />}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{user?.role}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    if (user) {
                      setFormData(user);
                    }
                    setIsEdited(false);
                    setEditOpen(true);
                  }}
                  className="gap-1.5"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit profile
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                onClick={() => { setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
  });

  setIsPasswordEdited(false);
  setPwOpen(true);
}}
                  className="gap-1.5"
                >
                  <KeyRound className="h-3.5 w-3.5" /> Change password
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-2">
            <InfoRow icon={Mail} label="Email" value={user?.email ?? ""} />
            <InfoRow icon={Phone} label="Phone" value={user?.phone ?? ""} />
            <InfoRow icon={Building2} label="Department" value={user?.department ?? ""} />
            <InfoRow icon={Briefcase} label="Role" value={user?.role ?? ""} />
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <StatBlock label="Active projects" value={activeProjects} />
          <StatBlock label="Assigned tasks" value={assignedTasks} />
          <StatBlock label="Tasks completed" value={completedTasks} />
        </div>
      </div>

      <Modal
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit profile"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
           <Button disabled={!isEdited} onClick={updateProfile}>
           Save changes
           </Button>
          </>
        }
      >
        <form
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="sm:col-span-2">
            <Label htmlFor="pr-name">Full name</Label>
            <Input
              id="pr-name"
              value={formData.name}
              onChange={(e) =>{
             setIsEdited(true);
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="pr-email">Email</Label>
            <Input
              id="pr-email"
              value={formData.email}
              onChange={(e) =>{
                 setIsEdited(true)
              
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="pr-phone">Phone</Label>
            <Input
              id="pr-phone"
              value={formData.phone}
              onChange={(e) =>{
                 setIsEdited(true)
                setFormData({
                  ...formData,
                  phone: e.target.value,
                })
              }}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="pr-dept">Department</Label>
            <Input
              id="pr-dept"
              value={formData.department}
              onChange={(e) =>{
                 setIsEdited(true);
                setFormData({
                  ...formData,
                  department: e.target.value,
                })
              }}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="pr-role">Role</Label>
            <Input
              id="pr-role"
              value={formData.role}
              onChange={(e) =>{
                 setIsEdited(true);
                setFormData({
                  ...formData,
                  role: e.target.value,
                })
              }}
              className="mt-1.5"
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={pwOpen}
        onOpenChange={setPwOpen}
        title="Change password"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPwOpen(false)}>
              Cancel
            </Button>
            <Button
  disabled={!isPasswordEdited}
  onClick={changePassword}
>
  Update password
</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <Label htmlFor="pw-current">Current password</Label>
            <Input
              id="pw-current"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>{
                  setIsPasswordEdited(true);
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="pw-new">New password</Label>
            <Input
              id="pw-new"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>{
     setIsPasswordEdited(true);
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="pw-confirm">Confirm new password</Label>
            <Input
              id="pw-confirm"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>{
                 setIsPasswordEdited(true);
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }}
              className="mt-1.5"
            />
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
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
    </div>
  );
}
