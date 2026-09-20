import { cn } from "@/utils/helpers";

interface BadgeProps {
  children: string | number;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "live";
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  return <span className={cn("badge", `badge-${variant}`)}>{children}</span>;
}
