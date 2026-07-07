import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, MoreHorizontal, Upload, Search } from "lucide-react";
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
import { mockEmployees } from "@/lib/mock/employees";
import { initials } from "@/lib/format";

export const Route = createFileRoute("/_app/employees")({
  component: EmployeesPage,
});

function EmployeesPage() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const visible = mockEmployees.filter((e) =>
    (e.name + e.email + e.department).toLowerCase().includes(query.toLowerCase()),
  );

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
              {visible.map((e) => (
                <TableRow key={e.id} className="border-border">
                  <TableCell className="pl-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={e.avatarUrl} alt={e.name} />
                        <AvatarFallback>{initials(e.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground">{e.name}</div>
                        <div className="text-xs text-muted-foreground">{e.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{e.department}</TableCell>
                  <TableCell className="text-sm text-foreground">{e.role}</TableCell>
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
                        <DropdownMenuItem>View profile</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddEmployeeModal open={open} onOpenChange={setOpen} />
    </div>
  );
}

function AddEmployeeModal({
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
      title="Add employee"
      description="Invite a new teammate to your workspace."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>Add employee</Button>
        </>
      }
    >
      <form
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="sm:col-span-2 flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full border border-dashed border-border bg-muted text-muted-foreground">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <Button type="button" variant="secondary" size="sm">
              Upload photo
            </Button>
            <p className="mt-1 text-xs text-muted-foreground">PNG or JPG up to 2MB.</p>
          </div>
        </div>
        <div>
          <Label htmlFor="e-name">Full name</Label>
          <Input id="e-name" placeholder="e.g. Jane Cooper" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="e-email">Email</Label>
          <Input id="e-email" type="email" placeholder="jane@company.com" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="e-phone">Phone</Label>
          <Input id="e-phone" placeholder="+1 555 000 0000" className="mt-1.5" />
        </div>
        <div>
          <Label>Department</Label>
          <Select>
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
        <div className="sm:col-span-2">
          <Label htmlFor="e-role">Designation</Label>
          <Input id="e-role" placeholder="e.g. Senior Product Designer" className="mt-1.5" />
        </div>
      </form>
    </Modal>
  );
}
