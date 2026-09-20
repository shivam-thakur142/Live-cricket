import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { NewsArticle, NewsCategory, Tournament } from "@/types";

interface NewsFormProps {
  initial?: Partial<NewsArticle>;
  tournaments: Tournament[];
  onSubmit: (data: Omit<NewsArticle, "id">) => void;
  onCancel: () => void;
}

const categories: NewsCategory[] = ["Match Report", "Announcement", "Tournament News", "Team News", "Player News"];

export function NewsForm({ initial = {}, tournaments, onSubmit, onCancel }: NewsFormProps) {
  const [form, setForm] = useState({
    title: initial.title ?? "",
    category: initial.category ?? "Tournament News",
    tournamentId: initial.tournamentId ?? "",
    date: initial.date ?? "",
    excerpt: initial.excerpt ?? "",
    content: initial.content ?? "",
    author: initial.author ?? "",
  });

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form as Omit<NewsArticle, "id">);
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
      <Input label="Date" type="date" value={form.date} onChange={(e) => update("date", e.target.value)} required />
      <Input label="Author" value={form.author} onChange={(e) => update("author", e.target.value)} />
      <Input label="Excerpt" value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} />
      <div className="form-field">
        <label className="form-label">Content</label>
        <textarea
          className="form-textarea"
          value={form.content}
          onChange={(e) => update("content", e.target.value)}
          rows={6}
        />
      </div>
      <div className="form-actions">
        <Button type="submit">Save</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
