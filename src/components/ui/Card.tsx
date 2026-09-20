import type { ReactNode } from "react";
import { cn } from "@/utils/helpers";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({ children, className, padding = "md" }: CardProps) {
  return (
    <div className={cn("card", `card-padding-${padding}`, className)}>
      {children}
    </div>
  );
}
