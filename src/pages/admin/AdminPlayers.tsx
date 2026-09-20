import { useEffect, useState } from "react";
import { AdminEntityManager } from "@/components/admin/AdminEntityManager";
import { PlayerForm } from "@/components/admin/forms/PlayerForm";
import { useToast } from "@/components/ui/ToastProvider";
import { getTeamById } from "@/utils/helpers";
import * as api from "@/services/api";
import type { Player, Team } from "@/types";

export function AdminPlayers() {
  const toast = useToast();
  const [items, setItems] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    Promise.all([api.getPlayers(), api.getTeams()]).then(([p, t]) => {
      setItems(p);
      setTeams(t);
    });
  }, []);

  const handleAdd = async (data: Record<string, unknown>) => {
    await api.addPlayer(data as Omit<Player, "id">);
    setItems(await api.getPlayers());
    toast.toast("Player created", "success");
  };

  const handleEdit = async (id: string, data: Record<string, unknown>) => {
    await api.updatePlayer(id, data as Partial<Player>);
    setItems(await api.getPlayers());
    toast.toast("Player updated", "success");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this player?")) return;
    await api.deletePlayer(id);
    setItems(await api.getPlayers());
    toast.toast("Player deleted", "success");
  };

  return (
    <AdminEntityManager
      title="Players"
      items={items}
      columns={[
        { header: "Name", render: (p) => p.name },
        { header: "Team", render: (p) => getTeamById(p.teamId)?.name ?? "-" },
        { header: "Role", render: (p) => p.role },
        { header: "Jersey", render: (p) => p.jerseyNumber ?? "-" },
      ]}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      renderForm={({ initial, onSubmit, onCancel }) => (
        <PlayerForm
          initial={initial}
          teams={teams}
          onSubmit={(data) => onSubmit(data as Record<string, unknown>)}
          onCancel={onCancel}
        />
      )}
    />
  );
}
