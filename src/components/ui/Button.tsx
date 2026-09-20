import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/helpers";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "btn",
        `btn-${variant}`,
        `btn-${size}`,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
