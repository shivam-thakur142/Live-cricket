import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Player, PlayerRole, Team } from "@/types";

interface PlayerFormProps {
  initial?: Partial<Player>;
  teams: Team[];
  onSubmit: (data: Omit<Player, "id">) => void;
  onCancel: () => void;
}

const roles: PlayerRole[] = ["Batsman", "Bowler", "All-rounder", "Wicket-keeper"];

export function PlayerForm({ initial = {}, teams, onSubmit, onCancel }: PlayerFormProps) {
  const [form, setForm] = useState({
    name: initial.name ?? "",
    teamId: initial.teamId ?? (teams[0]?.id ?? ""),
    role: initial.role ?? "Batsman",
    jerseyNumber: initial.jerseyNumber ?? 1,
    battingStyle: initial.battingStyle ?? "Right-hand bat",
    bowlingStyle: initial.bowlingStyle ?? "",
  });

  const update = (key: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form as Omit<Player, "id">);
      }}
      className="admin-form"
    >
      <Input label="Player Name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
      <Select
        label="Team"
        value={form.teamId}
        options={teams.map((t) => ({ value: t.id, label: t.name }))}
        onChange={(e) => update("teamId", e.target.value)}
      />
      <div className="form-row">
        <Select
          label="Role"
          value={form.role}
          options={roles.map((r) => ({ value: r, label: r }))}
          onChange={(e) => update("role", e.target.value)}
        />
        <Input label="Jersey Number" type="number" value={form.jerseyNumber} onChange={(e) => update("jerseyNumber", Number(e.target.value))} />
      </div>
      <Input label="Batting Style" value={form.battingStyle} onChange={(e) => update("battingStyle", e.target.value)} />
      <Input label="Bowling Style" value={form.bowlingStyle} onChange={(e) => update("bowlingStyle", e.target.value)} />
      <div className="form-actions">
        <Button type="submit">Save</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
