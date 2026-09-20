import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Tournament, TournamentStatus } from "@/types";

interface TournamentFormProps {
  initial?: Partial<Tournament>;
  onSubmit: (data: Omit<Tournament, "id">) => void;
  onCancel: () => void;
}

const statuses: TournamentStatus[] = ["upcoming", "registration_open", "ongoing", "completed"];

export function TournamentForm({ initial = {}, onSubmit, onCancel }: TournamentFormProps) {
  const [form, setForm] = useState({
    name: initial.name ?? "",
    season: initial.season ?? "",
    format: initial.format ?? "T20",
    overs: initial.overs ?? 20,
    location: initial.location ?? "",
    startDate: initial.startDate ?? "",
    endDate: initial.endDate ?? "",
    status: initial.status ?? "upcoming",
    description: initial.description ?? "",
  });

  const update = (key: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form as Omit<Tournament, "id">);
      }}
      className="admin-form"
    >
      <Input label="Name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
      <Input label="Season" value={form.season} onChange={(e) => update("season", e.target.value)} required />
      <div className="form-row">
        <Input label="Format" value={form.format} onChange={(e) => update("format", e.target.value)} required />
        <Input label="Overs" type="number" value={form.overs} onChange={(e) => update("overs", Number(e.target.value))} required />
      </div>
      <Input label="Location" value={form.location} onChange={(e) => update("location", e.target.value)} required />
      <div className="form-row">
        <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} required />
        <Input label="End Date" type="date" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} required />
      </div>
      <Select
        label="Status"
        value={form.status}
        options={statuses.map((s) => ({ value: s, label: s.replace("_", " ") }))}
        onChange={(e) => update("status", e.target.value)}
      />
      <div className="form-field">
        <label className="form-label">Description</label>
        <textarea
          className="form-textarea"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
        />
      </div>
      <div className="form-actions">
        <Button type="submit">Save</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
