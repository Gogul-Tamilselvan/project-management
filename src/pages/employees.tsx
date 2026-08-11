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

export function EmployeesPage() {
  const [open, setOpen] = useState<boolean>(false);
  const [editopen, seteditopen] = useState<boolean>(false);
  const [profile, setprofile] = useState<boolean>(false);
  const [proDetails, setproDetails] = useState<Employee>();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [query, setQuery] = useState<string>("");
  const [data, setData] = useState<Employee[]>();
  const visible = data?.filter((e) =>
    (e.name + e.email + e.department).toLowerCase().includes(query.toLowerCase()),
  );
  const deleteemploye = async (id: string) => {
    const { error } = await connectSupabase.from("employee").delete().eq("id", id);
    if (error) {
      toast.error("delete error" + error);
      return;
    } else toast.success("Deleted successfully.");
    getEmployes();
  };
  const getEmployes = async () => {
    const { data, error: err } = await connectSupabase.from("employee").select();
    if (err) {
      toast.error(err.message);
    } else {
      setData(data);
    }
  };

  useEffect(() => {
    getEmployes();
  }, [open, editopen, profile]);

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
                          <AvatarImage
                            src={
                              connectSupabase.storage
                                .from("Employee")
                                .getPublicUrl(e?.avatarUrl ?? "").data.publicUrl
                            }
                            alt={e.name}
                          />
                          <AvatarFallback>{initials(e.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground">{e.name}</div>
                          <div className="text-xs text-muted-foreground">{e.email}</div>
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
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <Avatar className="h-24 w-24 ring-4 ring-primary-soft">
            <AvatarImage
              src={
                connectSupabase.storage.from("Employee").getPublicUrl(proDetails?.avatarUrl ?? "")
                  .data.publicUrl
              }
              alt={proDetails?.name}
            />
            <AvatarFallback className="text-2xl">{initials(proDetails?.name ?? "")}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-foreground">{proDetails?.name}</h2>
              <EmployeeStatusBadge status={proDetails?.status ?? "active"} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground capitalize">{proDetails?.role}</p>
          </div>
        </div>
        {proDetails && (
          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-2">
            <InfoRow icon={Mail} label="Email" value={proDetails?.email} />
            <InfoRow icon={Phone} label="Phone" value={proDetails?.phone} />
            <InfoRow icon={Building2} label="Department" value={proDetails?.department} />
            <InfoRow icon={Briefcase} label="Role" value={proDetails?.role} />
          </div>
        )}
      </Modal>
      <AddEmployeeModal open={open} onOpenChange={setOpen} />

      <EditEmployeeModal
        editopen={editopen}
        seteditopen={seteditopen}
        employee={selectedEmployee}
      />
    </div>
  );
}

function EditEmployeeModal({
  editopen,
  seteditopen,
  employee,
}: {
  editopen: boolean;
  seteditopen: (v: boolean) => void;
  employee: Employee | null;
}) {
  const [updatedata, setupdatedata] = useState<Employee>({
    id: "",
    name: "",
    email: "",
    phone: "",
    avatarUrl: "",
    department: "",
    role: "",
    status: "" as EmployeeStatus,
  });
  const [updateimage, setupdateimage] = useState<File | null>(null);
  const [originalData, setOriginalData] = useState<Employee | null>(null);

  useEffect(() => {
    if (employee) {
      const data = {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        avatarUrl: employee.avatarUrl || "",
        department: employee.department,
        role: employee.role,
        status: employee.status,
      };
      setupdatedata(data);
      setOriginalData(data);
      setupdateimage(null);
    }
  }, [employee]);

  const haschanges =
    JSON.stringify(updatedata) !== JSON.stringify(originalData) || updateimage !== null;

  const updatedetails = async () => {
    try {
      if (!updatedata.id) {
        toast.error("Employee not found");
        return;
      }

      let avatarPath = updatedata.avatarUrl;

      if (updateimage) {
        if (updatedata.avatarUrl) {
          const { error: deleteError } = await connectSupabase.storage
            .from("Employee")
            .remove([updatedata.avatarUrl]);
        }

        const fileName = `${Date.now()}-${updateimage.name}`;
        const filePath = `Emp_image/${fileName}`;

        const { error: uploadError } = await connectSupabase.storage
          .from("Employee")
          .upload(filePath, updateimage);

        if (uploadError) {
          toast.error(uploadError.message);
          return;
        }

        avatarPath = filePath;
      }

      const { error } = await connectSupabase
        .from("employee")
        .update({
          name: updatedata.name,
          email: updatedata.email,
          phone: updatedata.phone,
          avatarUrl: avatarPath,
          department: updatedata.department,
          role: updatedata.role,
          status: updatedata.status,
        })
        .eq("id", updatedata.id);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Employee Updated successfully.");
      setupdateimage(null);
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
          <Button type="submit" form="employe-form" onClick={updatedetails} disabled={!haschanges}>
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
            <Avatar className="h-16 w-16">
              <AvatarImage src={updatedata.avatarUrl} />
              <AvatarFallback>{initials(updatedata.name)}</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <Input
              id="e-pic"
              type="file"
              accept="image/*"
              onChange={(e) => setupdateimage(e.target.files?.[0] ?? null)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              PNG or JPG up to 2MB. <span className="text-red-500">*</span>
            </p>
          </div>
        </div>
        <div>
          <Label htmlFor="e-name">
            Full name <span className="text-red-500">*</span>
          </Label>
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
          <Label htmlFor="e-email">
            Email <span className="text-red-500">*</span>
          </Label>
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
          <Label htmlFor="e-phone">
            Phone <span className="text-red-500">*</span>
          </Label>
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
          <Label>
            Department <span className="text-red-500">*</span>
          </Label>
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
          <Label htmlFor="e-role">
            Designation <span className="text-red-500">*</span>
          </Label>
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
          <Label>
            Status <span className="text-red-500">*</span>
          </Label>
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
    id: "",
    name: "",
    email: "",
    phone: "",
    avatarUrl: "",
    department: "",
    role: "",
    status: "" as EmployeeStatus,
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
        .from("Employee")
        .upload(filePath, image);

      if (uploadError) throw uploadError;

      const { error } = await connectSupabase.from("employee").insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        avatarUrl: filePath,
        department: formData.department,
        role: formData.role,
        status: formData.status,
      });

      if (error) throw error;

      toast.success("Employee Added Successfully.");
      onOpenChange(false);
    } catch (error) {
      toast.error((error as Error).message);
    }

    setFormData({
      id: "",
      department: "",
      email: "",
      name: "",
      phone: "",
      role: "",
      status: "" as EmployeeStatus,
    });
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
            <p className="mt-1 text-xs text-muted-foreground">
              PNG or JPG up to 2MB. <span className="text-red-500">*</span>
            </p>
          </div>
        </div>
        <div>
          <Label htmlFor="e-name">
            Full name <span className="text-red-500">*</span>
          </Label>
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
          <Label htmlFor="e-email">
            Email <span className="text-red-500">*</span>
          </Label>
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
          <Label htmlFor="e-phone">
            Phone <span className="text-red-500">*</span>
          </Label>
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
          <Label>
            Department <span className="text-red-500">*</span>
          </Label>
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
          <Label htmlFor="e-role">
            Designation <span className="text-red-500">*</span>
          </Label>
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
          <Label>
            Status <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.status}
            required
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
