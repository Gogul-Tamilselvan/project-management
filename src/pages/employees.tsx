import { useEffect, useState } from "react";
import {
  Plus,
  MoreHorizontal,
  Upload,
  Search,
  Mail,
  Phone,
  Building2,
  Briefcase,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { EmployeeStatusBadge } from "@/components/ui-kit/status-badges";
import { initials } from "@/lib/format";
import { Employee, EmployeeStatus } from "@/lib/types";
import { connectSupabase } from "@/services/config";
import { toast } from "sonner";

interface EmployeDB {
  id: string;
  emp_name: string;
  emp_email: string;
  emp_phone: string;
  avatarUrl?: string;
  department: string;
  role: string;
  status: EmployeeStatus;
}

export function EmployeesPage() {
  const [open, setOpen] = useState<boolean>(false);
  const [editopen, seteditopen] = useState<boolean>(false);
  const [profile, setprofile] = useState<boolean>(false);
  const [proDetails, setproDetails] = useState<EmployeDB>();
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeDB | null>(null);
  const [query, setQuery] = useState<string>("");
  const [data, setData] = useState<EmployeDB[]>();
  const visible = data?.filter((e) =>
    (e.emp_name + e.emp_email + e.department).toLowerCase().includes(query.toLowerCase()),
  );
  const deleteemploye = async (id: string) => {
    const { error } = await connectSupabase.from("employee").delete().eq("id", id);
    if (error) {
      toast.error("delete error" + error);
      // console.log("delete error", error);
      return;
    } else toast.success("deleted successfully");
  };
  const getEmployes = async () => {
    const { data, error: err } = await connectSupabase.from("employee").select();
    if (err) {
      console.log(err);
      toast.error(err.message);
    } else {
      setData(data);
    }
  };

  useEffect(() => {
    getEmployes();
  }, []);

  useEffect(() => {
    const channel = connectSupabase
      .channel("employee-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "employee",
        },
        () => {
          getEmployes();
        },
      )
      .subscribe();

    return () => {
      connectSupabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Employees</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your team, roles, and departments.
          </p>
        </div>
        <Button className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Add employee
        </Button>
      </div>
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or department…"
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="pl-6">Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible?.length == 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-15 text-center align-middle text-muted-foreground"
                  >
                    No results found
                  </TableCell>
                </TableRow>
              ) : (
                visible?.map((e, idx) => (
                  <TableRow key={idx} className="border-border">
                    <TableCell className="pl-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={e.avatarUrl} alt={e.emp_name} />
                          <AvatarFallback>{initials(e.emp_name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground">{e.emp_name}</div>
                          <div className="text-xs text-muted-foreground">{e.emp_email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground capitalize">
                      {e.department}
                    </TableCell>
                    <TableCell className="text-sm text-foreground capitalize">{e.role}</TableCell>
                    <TableCell>
                      <EmployeeStatusBadge status={e.status} />
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Row actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setprofile(true);
                              setproDetails(e);
                            }}
                          >
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedEmployee(e);
                              seteditopen(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteemploye(e.id)}
                          >
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <Modal
        open={profile}
        onOpenChange={setprofile}
        title="Employee Profile"
        description="Review and manage employee records, details, and status."
      >
        {/* <div className="rounded-xl border border-border bg-card p-6 shadow-soft lg:col-span-2"> */}
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <Avatar className="h-24 w-24 ring-4 ring-primary-soft">
            <AvatarImage src={proDetails?.avatarUrl} alt={proDetails?.emp_name} />
            <AvatarFallback className="text-2xl">
              {initials(proDetails?.emp_name ?? "")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-foreground">{proDetails?.emp_name}</h2>
              <EmployeeStatusBadge status={proDetails?.status ?? "active"} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground capitalize">{proDetails?.role}</p>
          </div>
        </div>
        {proDetails && (
          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-2">
            <InfoRow icon={Mail} label="Email" value={proDetails?.emp_email} />
            <InfoRow icon={Phone} label="Phone" value={proDetails?.emp_phone} />
            <InfoRow icon={Building2} label="Department" value={proDetails?.department} />
            <InfoRow icon={Briefcase} label="Role" value={proDetails?.role} />
          </div>
        )}
      </Modal>
      <AddEmployeeModal open={open} onOpenChange={setOpen} />
      <EditEmployeeModal editopen={editopen} seteditopen={seteditopen} employe={selectedEmployee} />
    </div>
  );
}

function EditEmployeeModal({
  editopen,
  seteditopen,
  employe,
}: {
  editopen: boolean;
  seteditopen: (v: boolean) => void;
  employe: EmployeDB | null;
}) {
  const [updatedata, setupdatedata] = useState<Employee>({
    id: "",
    name: "",
    email: "",
    phone: "",
    avatarUrl: "",
    department: "",
    role: "",
    status: "active",
  });
  const [updateimage, setupdateimage] = useState<File | null>(null);

  useEffect(() => {
    if (employe) {
      setupdatedata({
        id: employe.id,
        name: employe.emp_name,
        email: employe.emp_email,
        phone: employe.emp_phone,
        avatarUrl: employe.avatarUrl || "",
        department: employe.department,
        role: employe.role,
        status: employe.status,
      });
    }
  }, [employe]);

  const updatedetails = async () => {
    try {
      if (!updatedata.id) {
        toast.error("Employee not found");
        return;
      }

      let imgurl = updatedata.avatarUrl;

      if (updateimage) {
        const filename = `${Date.now()}-${updateimage.name}`;

        const filepath = `avatarUrl/${filename}`;

        const { error: imageerror } = await connectSupabase.storage
          .from("Employe")
          .upload(filepath, updateimage);

        if (imageerror) {
          toast.error(imageerror.message);
          return;
        }

        const { data: urlData } = connectSupabase.storage.from("Employe").getPublicUrl(filepath);

        imgurl = urlData.publicUrl;
      }

      const { data, error } = await connectSupabase
        .from("employee")
        .update({
          emp_name: updatedata.name,
          emp_email: updatedata.email,
          emp_phone: updatedata.phone,
          avatarUrl: imgurl,
          department: updatedata.department,
          role: updatedata.role,
          status: updatedata.status,
        })
        .eq("id", updatedata.id)
        .select();

      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Updated Successfully");
      seteditopen(false);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <Modal
      open={editopen}
      onOpenChange={seteditopen}
      title="Edit employee"
      description="Upadate teammate Information."
      footer={
        <>
          <Button variant="ghost" onClick={() => seteditopen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="employe-form" onClick={updatedetails}>
            Update details
          </Button>
        </>
      }
    >
      <form
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        onSubmit={(e) => e.preventDefault()}
        id="employe-form"
      >
        <div className="sm:col-span-2 flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full border border-dashed border-border bg-muted text-muted-foreground">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <Input
              id="e-pic"
              type="file"
              accept="image/*"
              onChange={(e) => setupdateimage(e.target.files?.[0] ?? null)}
            />
            <p className="mt-1 text-xs text-muted-foreground">PNG or JPG up to 2MB.</p>
          </div>
        </div>
        <div>
          <Label htmlFor="e-name">Full name</Label>
          <Input
            id="e-name"
            placeholder="e.g. Jane Cooper"
            className="mt-1.5"
            value={updatedata.name}
            required
            onChange={(e) => setupdatedata((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="e-email">Email</Label>
          <Input
            id="e-email"
            type="email"
            placeholder="jane@company.com"
            className="mt-1.5"
            value={updatedata.email}
            required
            onChange={(e) => setupdatedata((prev) => ({ ...prev, email: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="e-phone">Phone</Label>
          <Input
            id="e-phone"
            placeholder="+1 555 000 0000"
            value={updatedata.phone}
            className="mt-1.5"
            required
            onChange={(e) => setupdatedata((prev) => ({ ...prev, phone: e.target.value }))}
          />
        </div>
        <div>
          <Label>Department</Label>
          <Select
            value={updatedata.department}
            required
            onValueChange={(value) => setupdatedata((prev) => ({ ...prev, department: value }))}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="e-role">Designation</Label>
          <Input
            id="e-role"
            placeholder="e.g. Senior Product Designer"
            className="mt-1.5"
            value={updatedata.role}
            required
            onChange={(e) => setupdatedata((prev) => ({ ...prev, role: e.target.value }))}
          />
        </div>
        <div>
          <Label>Status</Label>
          <Select
            value={updatedata.status}
            required
            onValueChange={(value: EmployeeStatus) =>
              setupdatedata((prev) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="away">Away</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>
    </Modal>
  );
}

function AddEmployeeModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [formData, setFormData] = useState<Employee>({
    id: `emp_`,
    name: "",
    email: "",
    phone: "",
    avatarUrl: "",
    department: "",
    role: "",
    status: "active",
  });

  const [image, setimage] = useState<File | null>();

  const addEmploye = async () => {
    try {
      if (!image) {
        toast.info("Please select an image.");
        return;
      }

      const fileName = `${Date.now()}-${image.name}`;
      const filePath = `Emp_image/${fileName}`;

      const { error: uploadError } = await connectSupabase.storage
        .from("Employe")
        .upload(filePath, image);

      if (uploadError) throw uploadError;

      const { data: urlData } = connectSupabase.storage.from("Employe").getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;

      if (
        formData.name.trim() !== "" &&
        formData.email.trim() !== "" &&
        formData.phone.trim() !== "" &&
        formData.department.trim() !== "" &&
        formData.role.trim() !== ""
      ) {
        const { data, error } = await connectSupabase
          .from("employee")
          .insert([
            {
              emp_name: formData.name,
              emp_email: formData.email,
              emp_phone: formData.phone,
              avatarUrl: imageUrl,
              department: formData.department,
              role: formData.role,
              status: formData.status,
            },
          ])
          .select();
        if (error) {
          toast.error(error.message);
        } else toast.success("Employee added!");
        onOpenChange(false);
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Add employee"
      description="Invite a new teammate to your workspace."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="employe-form" onClick={addEmploye}>
            Add employee
          </Button>
        </>
      }
    >
      <form
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        onSubmit={(e) => e.preventDefault()}
        id="employe-form"
      >
        <div className="sm:col-span-2 flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full border border-dashed border-border bg-muted text-muted-foreground">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <Input
              id="e-pic"
              type="file"
              accept="image/*"
              required
              onChange={(e) => setimage(e.target.files?.[0] ?? null)}
            />
            <p className="mt-1 text-xs text-muted-foreground">PNG or JPG up to 2MB.</p>
          </div>
        </div>
        <div>
          <Label htmlFor="e-name">Full name</Label>
          <Input
            id="e-name"
            placeholder="e.g. Jane Cooper"
            className="mt-1.5"
            required
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
          />
        </div>
        <div>
          <Label htmlFor="e-email">Email</Label>
          <Input
            id="e-email"
            type="email"
            placeholder="jane@company.com"
            className="mt-1.5"
            required
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
          />
        </div>
        <div>
          <Label htmlFor="e-phone">Phone</Label>
          <Input
            id="e-phone"
            placeholder="+1 555 000 0000"
            className="mt-1.5"
            required
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                phone: e.target.value,
              }))
            }
          />
        </div>
        <div>
          <Label>Department</Label>
          <Select
            value={formData.department}
            required
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                department: value,
              }))
            }
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="e-role">Designation</Label>
          <Input
            id="e-role"
            placeholder="e.g. Senior Product Designer"
            className="mt-1.5"
            required
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                role: e.target.value,
              }))
            }
          />
        </div>
        <div>
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: EmployeeStatus) =>
              setFormData((prev) => ({
                ...prev,
                status: value,
              }))
            }
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="away">Away</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>
    </Modal>
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
