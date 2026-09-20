import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Team } from "@/types";

interface TeamFormProps {
  initial?: Partial<Team>;
  onSubmit: (data: Omit<Team, "id">) => void;
  onCancel: () => void;
}

export function TeamForm({ initial = {}, onSubmit, onCancel }: TeamFormProps) {
  const [form, setForm] = useState({
    name: initial.name ?? "",
    shortName: initial.shortName ?? "",
    captainName: initial.captainName ?? "",
    coach: initial.coach ?? "",
    foundedYear: initial.foundedYear ?? new Date().getFullYear(),
  });

  const update = (key: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form as Omit<Team, "id">);
      }}
      className="admin-form"
    >
      <Input label="Team Name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
      <Input label="Short Name" value={form.shortName} onChange={(e) => update("shortName", e.target.value)} required />
      <Input label="Captain Name" value={form.captainName} onChange={(e) => update("captainName", e.target.value)} />
      <Input label="Coach" value={form.coach} onChange={(e) => update("coach", e.target.value)} />
      <Input label="Founded Year" type="number" value={form.foundedYear} onChange={(e) => update("foundedYear", Number(e.target.value))} />
      <div className="form-actions">
        <Button type="submit">Save</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
