import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  label: string;
  value: string | number;
  delta?: { value: string; positive?: boolean };
  icon: LucideIcon;
  tint?: "primary" | "success" | "warning" | "info";
}

const tints: Record<NonNullable<SummaryCardProps["tint"]>, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning-foreground",
  info: "bg-info/15 text-info",
};

export function SummaryCard({
  label,
  value,
  delta,
  icon: Icon,
  tint = "primary",
}: SummaryCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group rounded-xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-elegant"
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className={cn("grid h-9 w-9 place-items-center rounded-lg", tints[tint])}>
          <Icon className="h-4.5 w-4.5" size={18} strokeWidth={2.25} />
        </div>
      </div>
      <div className="mt-4 flex items-end gap-2">
        <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
        {delta && (
          <span
            className={cn(
              "mb-1 inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium",
              delta.positive
                ? "bg-success/15 text-success"
                : "bg-destructive/12 text-destructive",
            )}
          >
            {delta.positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {delta.value}
          </span>
        )}
      </div>
    </motion.div>
  );
}
