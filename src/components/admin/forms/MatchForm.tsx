import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Match, MatchStage, MatchStatus, Team, Tournament, Venue } from "@/types";

interface MatchFormProps {
  initial?: Partial<Match>;
  tournaments: Tournament[];
  teams: Team[];
  venues: Venue[];
  onSubmit: (data: Omit<Match, "id">) => void;
  onCancel: () => void;
}

const stages: MatchStage[] = ["League", "Group Stage", "Qualifier", "Eliminator", "Quarter Final", "Semi Final", "Final"];
const statuses: MatchStatus[] = ["upcoming", "live", "completed"];

export function MatchForm({ initial = {}, tournaments, teams, venues, onSubmit, onCancel }: MatchFormProps) {
  const [form, setForm] = useState({
    tournamentId: initial.tournamentId ?? (tournaments[0]?.id ?? ""),
    matchNumber: initial.matchNumber ?? 1,
    stage: initial.stage ?? "League",
    date: initial.date ?? "",
    time: initial.time ?? "",
    venueId: initial.venueId ?? (venues[0]?.id ?? ""),
    team1Id: initial.team1Id ?? (teams[0]?.id ?? ""),
    team2Id: initial.team2Id ?? (teams[1]?.id ?? ""),
    status: initial.status ?? "upcoming",
  });

  const update = (key: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form as Omit<Match, "id">);
      }}
      className="admin-form"
    >
      <Select
        label="Tournament"
        value={form.tournamentId}
        options={tournaments.map((t) => ({ value: t.id, label: t.name }))}
        onChange={(e) => update("tournamentId", e.target.value)}
      />
      <div className="form-row">
        <Input label="Match Number" type="number" value={form.matchNumber} onChange={(e) => update("matchNumber", Number(e.target.value))} required />
        <Select
          label="Stage"
          value={form.stage}
          options={stages.map((s) => ({ value: s, label: s }))}
          onChange={(e) => update("stage", e.target.value)}
        />
      </div>
      <div className="form-row">
        <Input label="Date" type="date" value={form.date} onChange={(e) => update("date", e.target.value)} required />
        <Input label="Time" type="time" value={form.time} onChange={(e) => update("time", e.target.value)} required />
      </div>
      <Select
        label="Venue"
        value={form.venueId}
        options={venues.map((v) => ({ value: v.id, label: v.name }))}
        onChange={(e) => update("venueId", e.target.value)}
      />
      <div className="form-row">
        <Select label="Team 1" value={form.team1Id} options={teams.map((t) => ({ value: t.id, label: t.name }))} onChange={(e) => update("team1Id", e.target.value)} />
        <Select label="Team 2" value={form.team2Id} options={teams.map((t) => ({ value: t.id, label: t.name }))} onChange={(e) => update("team2Id", e.target.value)} />
      </div>
      <Select
        label="Status"
        value={form.status}
        options={statuses.map((s) => ({ value: s, label: s }))}
        onChange={(e) => update("status", e.target.value)}
      />
      <div className="form-actions">
        <Button type="submit">Save</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
