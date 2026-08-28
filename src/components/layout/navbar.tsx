import { useEffect, useState } from "react";
import { Bell, Search, Sun, Moon, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { mockCurrentUser } from "@/lib/mock/employees";
import { initials, relativeTime } from "@/lib/format";
import { mockActivities } from "@/lib/mock/activities";
import { connectSupabase } from "@/services/config";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { UserDataType } from "@/lib/types";

interface NavbarProps {
  onOpenMobileNav: () => void;
}

export function Navbar({ onOpenMobileNav }: NavbarProps) {
  const [dark, setDark] = useState(false);
  const [userDt, setuserDt] = useState<UserDataType>({
    email: "",
    name: "",
  });

  const getUserData = async () => {
    try {
      const { error, data } = await connectSupabase.auth.getUser();
      if (data) {
        const dt = data.user?.identities?.[0]?.identity_data ?? undefined;

        if (dt) {
          setuserDt({
            email: dt.email,
            name: dt.name ?? "no name",
          });
        }
      } else toast.error(error?.message);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Network error");
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark = stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
    getUserData();
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const firstName = mockCurrentUser.name.split(" ")[0];

  const navigate = useNavigate();

  const logout = async () => {
    const { error } = await connectSupabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else toast.info("Logout successfully");

    setTimeout(() => {
      navigate("/");
    }, 500);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden min-w-0 md:block">
        <p className="text-sm font-semibold text-foreground">Welcome back, {userDt.name} 👋</p>
        <p className="text-xs text-muted-foreground">Here's what's happening across your team.</p>
      </div>

      <div className="flex-1" />

      <div className="relative hidden w-72 max-w-full lg:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search projects, tasks, people…"
          className="h-9 w-full rounded-lg border border-border bg-muted/40 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">
              You have {mockActivities.length} new updates
            </p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {mockActivities.slice(0, 5).map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 border-b border-border px-4 py-3 last:border-0 hover:bg-muted/40"
              >
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 text-sm">
                  <p className="line-clamp-2 text-foreground">{a.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {relativeTime(a.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
        {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-muted">
            <Avatar className="h-8 w-8">
              <AvatarImage src={mockCurrentUser.avatarUrl} alt={mockCurrentUser.name} />
              <AvatarFallback>{initials(mockCurrentUser.name)}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div>
              <p className="text-sm font-semibold">{userDt.name}</p>
              <p className="text-xs font-normal text-muted-foreground">{userDt.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/settings")}>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={logout}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
