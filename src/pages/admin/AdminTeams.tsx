import { useEffect, useState } from "react";
import { AdminEntityManager } from "@/components/admin/AdminEntityManager";
import { TeamForm } from "@/components/admin/forms/TeamForm";
import { useToast } from "@/components/ui/ToastProvider";
import * as api from "@/services/api";
import type { Team } from "@/types";

export function AdminTeams() {
  const toast = useToast();
  const [items, setItems] = useState<Team[]>([]);

  useEffect(() => {
    api.getTeams().then(setItems);
  }, []);

  const handleAdd = async (data: Record<string, unknown>) => {
    await api.addTeam(data as Omit<Team, "id">);
    setItems(await api.getTeams());
    toast.toast("Team created", "success");
  };

  const handleEdit = async (id: string, data: Record<string, unknown>) => {
    await api.updateTeam(id, data as Partial<Team>);
    setItems(await api.getTeams());
    toast.toast("Team updated", "success");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this team?")) return;
    await api.deleteTeam(id);
    setItems(await api.getTeams());
    toast.toast("Team deleted", "success");
  };

  return (
    <AdminEntityManager
      title="Teams"
      items={items}
      columns={[
        { header: "Name", render: (t) => t.name },
        { header: "Short", render: (t) => t.shortName },
        { header: "Captain", render: (t) => t.captainName ?? "-" },
        { header: "Coach", render: (t) => t.coach ?? "-" },
      ]}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      renderForm={({ initial, onSubmit, onCancel }) => (
        <TeamForm
          initial={initial}
          onSubmit={(data) => onSubmit(data as Record<string, unknown>)}
          onCancel={onCancel}
        />
      )}
    />
  );
}
