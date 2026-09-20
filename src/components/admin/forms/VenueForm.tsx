import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Venue } from "@/types";

interface VenueFormProps {
  initial?: Partial<Venue>;
  onSubmit: (data: Omit<Venue, "id">) => void;
  onCancel: () => void;
}

export function VenueForm({ initial = {}, onSubmit, onCancel }: VenueFormProps) {
  const [form, setForm] = useState({
    name: initial.name ?? "",
    location: initial.location ?? "",
    address: initial.address ?? "",
    capacity: initial.capacity ?? 1000,
    pitchInfo: initial.pitchInfo ?? "",
    matchesHosted: initial.matchesHosted ?? 0,
  });

  const update = (key: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form as Omit<Venue, "id">);
      }}
      className="admin-form"
    >
      <Input label="Venue Name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
      <Input label="Location" value={form.location} onChange={(e) => update("location", e.target.value)} required />
      <Input label="Address" value={form.address} onChange={(e) => update("address", e.target.value)} />
      <div className="form-row">
        <Input label="Capacity" type="number" value={form.capacity} onChange={(e) => update("capacity", Number(e.target.value))} />
        <Input label="Matches Hosted" type="number" value={form.matchesHosted} onChange={(e) => update("matchesHosted", Number(e.target.value))} />
      </div>
      <div className="form-field">
        <label className="form-label">Pitch Information</label>
        <textarea
          className="form-textarea"
          value={form.pitchInfo}
          onChange={(e) => update("pitchInfo", e.target.value)}
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
