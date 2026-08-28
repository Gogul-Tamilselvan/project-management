import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`
          ${size === "lg" ? "sm:max-w-2xl" : "sm:max-w-lg"}
          flex max-h-[90vh] flex-col gap-0 p-0 rounded-lg
        `}
      >
        <DialogHeader className="shrink-0 px-6 py-4">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div
          className="flex-1 overflow-y-auto px-6 py-4 
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-transparent
          [&::-webkit-scrollbar-thumb]:rounded-full
          hover:[&::-webkit-scrollbar-thumb]:bg-gray-300
        "
        >
          {children}
        </div>
        {footer && (
          <DialogFooter className="shrink-0 gap-2  px-6 py-4 sm:gap-2">{footer}</DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
