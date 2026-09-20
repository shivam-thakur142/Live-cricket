import type { ReactNode } from "react";
import { cn } from "@/utils/helpers";

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="table-scroll">
      <table className={cn("table", className)}>{children}</table>
    </div>
  );
}

interface TableHeadProps {
  children: ReactNode;
}

export function TableHead({ children }: TableHeadProps) {
  return <thead className="table-head">{children}</thead>;
}

interface TableBodyProps {
  children: ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody>{children}</tbody>;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
}

export function TableRow({ children, className }: TableRowProps) {
  return <tr className={cn("table-row", className)}>{children}</tr>;
}

interface TableCellProps {
  children: ReactNode;
  header?: boolean;
  className?: string;
}

export function TableCell({ children, header, className }: TableCellProps) {
  if (header) {
    return <th className={cn("table-cell", "table-header-cell", className)}>{children}</th>;
  }
  return <td className={cn("table-cell", className)}>{children}</td>;
}
