import { useEffect, useState } from "react";
import { AdminEntityManager } from "@/components/admin/AdminEntityManager";
import { TournamentForm } from "@/components/admin/forms/TournamentForm";
import { useToast } from "@/components/ui/ToastProvider";
import { statusLabel } from "@/utils/helpers";
import * as api from "@/services/api";
import type { Tournament } from "@/types";

export function AdminTournaments() {
  const toast = useToast();
  const [items, setItems] = useState<Tournament[]>([]);

  useEffect(() => {
    api.getTournaments().then(setItems);
  }, []);

  const handleAdd = async (data: Record<string, unknown>) => {
    await api.addTournament(data as Omit<Tournament, "id">);
    setItems(await api.getTournaments());
    toast.toast("Tournament created", "success");
  };

  const handleEdit = async (id: string, data: Record<string, unknown>) => {
    await api.updateTournament(id, data as Partial<Tournament>);
    setItems(await api.getTournaments());
    toast.toast("Tournament updated", "success");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tournament?")) return;
    await api.deleteTournament(id);
    setItems(await api.getTournaments());
    toast.toast("Tournament deleted", "success");
  };

  return (
    <AdminEntityManager
      title="Tournaments"
      items={items}
      columns={[
        { header: "Name", render: (t) => t.name },
        { header: "Season", render: (t) => t.season },
        { header: "Format", render: (t) => `${t.format} (${t.overs})` },
        { header: "Location", render: (t) => t.location },
        { header: "Status", render: (t) => statusLabel(t.status) },
      ]}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      renderForm={({ initial, onSubmit, onCancel }) => (
        <TournamentForm
          initial={initial}
          onSubmit={(data) => onSubmit(data as Record<string, unknown>)}
          onCancel={onCancel}
        />
      )}
    />
  );
}
