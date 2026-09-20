import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { GalleryCategory, GalleryItem, Tournament } from "@/types";

interface GalleryFormProps {
  initial?: Partial<GalleryItem>;
  tournaments: Tournament[];
  onSubmit: (data: Omit<GalleryItem, "id">) => void;
  onCancel: () => void;
}

const categories: GalleryCategory[] = ["Match", "Team", "Trophy", "Ground", "Moment"];

export function GalleryForm({ initial = {}, tournaments, onSubmit, onCancel }: GalleryFormProps) {
  const [form, setForm] = useState({
    title: initial.title ?? "",
    category: initial.category ?? "Moment",
    tournamentId: initial.tournamentId ?? "",
    imageUrl: initial.imageUrl ?? "/gallery/placeholder.jpg",
  });

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form as Omit<GalleryItem, "id">);
      }}
      className="admin-form"
    >
      <Input label="Title" value={form.title} onChange={(e) => update("title", e.target.value)} required />
      <div className="form-row">
        <Select
          label="Category"
          value={form.category}
          options={categories.map((c) => ({ value: c, label: c }))}
          onChange={(e) => update("category", e.target.value)}
        />
        <Select
          label="Tournament"
          value={form.tournamentId}
          options={[{ value: "", label: "None" }, ...tournaments.map((t) => ({ value: t.id, label: t.name }))]}
          onChange={(e) => update("tournamentId", e.target.value)}
        />
      </div>
      <Input label="Image URL" value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} />
      <div className="form-actions">
        <Button type="submit">Save</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
