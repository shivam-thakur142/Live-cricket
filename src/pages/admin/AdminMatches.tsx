import { useEffect, useState } from "react";
import { AdminEntityManager } from "@/components/admin/AdminEntityManager";
import { MatchForm } from "@/components/admin/forms/MatchForm";
import { useToast } from "@/components/ui/ToastProvider";
import { getTeamById, getVenueById, getTournamentById } from "@/utils/helpers";
import * as api from "@/services/api";
import type { Match, Team, Tournament, Venue } from "@/types";

export function AdminMatches() {
  const toast = useToast();
  const [items, setItems] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    Promise.all([api.getMatches(), api.getTournaments(), api.getTeams(), api.getVenues()]).then(
      ([m, tr, te, v]) => {
        setItems(m);
        setTournaments(tr);
        setTeams(te);
        setVenues(v);
      }
    );
  }, []);

  const handleAdd = async (data: Record<string, unknown>) => {
    await api.addMatch(data as Omit<Match, "id">);
    setItems(await api.getMatches());
    toast.toast("Match created", "success");
  };

  const handleEdit = async (id: string, data: Record<string, unknown>) => {
    await api.updateMatch(id, data as Partial<Match>);
    setItems(await api.getMatches());
    toast.toast("Match updated", "success");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this match?")) return;
    await api.deleteMatch(id);
    setItems(await api.getMatches());
    toast.toast("Match deleted", "success");
  };

  return (
    <AdminEntityManager
      title="Matches"
      items={items}
      columns={[
        { header: "Tournament", render: (m) => getTournamentById(m.tournamentId)?.name ?? "-" },
        { header: "Match", render: (m) => `Match ${m.matchNumber}` },
        { header: "Teams", render: (m) => `${getTeamById(m.team1Id)?.shortName} vs ${getTeamById(m.team2Id)?.shortName}` },
        { header: "Venue", render: (m) => getVenueById(m.venueId)?.name ?? "-" },
        { header: "Date", render: (m) => m.date },
        { header: "Status", render: (m) => m.status },
      ]}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      renderForm={({ initial, onSubmit, onCancel }) => (
        <MatchForm
          initial={initial}
          tournaments={tournaments}
          teams={teams}
          venues={venues}
          onSubmit={(data) => onSubmit(data as Record<string, unknown>)}
          onCancel={onCancel}
        />
      )}
    />
  );
}
