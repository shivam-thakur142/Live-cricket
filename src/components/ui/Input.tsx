import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/helpers";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, ...props }: InputProps) {
  return (
    <div className="form-field">
      {label && <label className="form-label">{label}</label>}
      <input className={cn("form-input", className)} {...props} />
    </div>
  );
}
