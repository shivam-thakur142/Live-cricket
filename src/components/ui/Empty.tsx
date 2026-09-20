import { Inbox } from "lucide-react";

interface EmptyProps {
  message?: string;
}

export function Empty({ message = "No data available." }: EmptyProps) {
  return (
    <div className="empty">
      <Inbox size={40} />
      <p>{message}</p>
    </div>
  );
}
