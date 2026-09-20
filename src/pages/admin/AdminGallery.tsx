import { useEffect, useState } from "react";
import { AdminEntityManager } from "@/components/admin/AdminEntityManager";
import { GalleryForm } from "@/components/admin/forms/GalleryForm";
import { useToast } from "@/components/ui/ToastProvider";
import { getTournamentById } from "@/utils/helpers";
import * as api from "@/services/api";
import type { GalleryItem, Tournament } from "@/types";

export function AdminGallery() {
  const toast = useToast();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    Promise.all([api.getGallery(), api.getTournaments()]).then(([g, t]) => {
      setItems(g);
      setTournaments(t);
    });
  }, []);

  const handleAdd = async (data: Record<string, unknown>) => {
    await api.addGalleryItem(data as Omit<GalleryItem, "id">);
    setItems(await api.getGallery());
    toast.toast("Gallery item added", "success");
  };

  const handleEdit = async (id: string, data: Record<string, unknown>) => {
    // Gallery edit not supported in API, treat as no-op or delete+add
    toast.toast("Gallery editing not implemented", "info");
    console.log(id, data);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this gallery item?")) return;
    await api.deleteGalleryItem(id);
    setItems(await api.getGallery());
    toast.toast("Gallery item deleted", "success");
  };

  return (
    <AdminEntityManager
      title="Gallery"
      items={items}
      columns={[
        { header: "Title", render: (g) => g.title },
        { header: "Category", render: (g) => g.category },
        { header: "Tournament", render: (g) => getTournamentById(g.tournamentId)?.name ?? "-" },
      ]}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      renderForm={({ initial, onSubmit, onCancel }) => (
        <GalleryForm
          initial={initial}
          tournaments={tournaments}
          onSubmit={(data) => onSubmit(data as Record<string, unknown>)}
          onCancel={onCancel}
        />
      )}
    />
  );
}
