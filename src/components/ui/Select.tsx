import type { SelectHTMLAttributes } from "react";
import { cn } from "@/utils/helpers";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="form-field">
      {label && <label className="form-label">{label}</label>}
      <select className={cn("form-select", className)} {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
