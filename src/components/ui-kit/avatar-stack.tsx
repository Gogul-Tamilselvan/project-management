import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import type { Employee } from "@/lib/types";

interface AvatarStackProps {
  users: Pick<Employee, "id" | "name" | "avatarUrl">[];
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

const sizeClass = { sm: "h-6 w-6 text-[10px]", md: "h-8 w-8 text-xs" } as const;

export function AvatarStack({ users, max = 4, size = "md", className }: AvatarStackProps) {
  const shown = users.slice(0, max);
  const rest = users.length - shown.length;
  return (
    <div className={cn("flex -space-x-2", className)}>
      {shown.map((u) => (
        <Avatar
          key={u.id}
          className={cn(
            sizeClass[size],
            "ring-2 ring-background transition-transform hover:z-10 hover:scale-110",
          )}
        >
          {u.avatarUrl ? <AvatarImage src={u.avatarUrl} alt={u.name} /> : null}
          <AvatarFallback className="bg-accent text-accent-foreground font-medium">
            {initials(u.name)}
          </AvatarFallback>
        </Avatar>
      ))}
      {rest > 0 && (
        <div
          className={cn(
            sizeClass[size],
            "ring-2 ring-background rounded-full bg-muted text-muted-foreground grid place-items-center font-medium",
          )}
        >
          +{rest}
        </div>
      )}
    </div>
  );
}
