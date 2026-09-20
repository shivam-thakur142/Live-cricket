import { useEffect, useState } from "react";
import { AdminEntityManager } from "@/components/admin/AdminEntityManager";
import { VenueForm } from "@/components/admin/forms/VenueForm";
import { useToast } from "@/components/ui/ToastProvider";
import * as api from "@/services/api";
import type { Venue } from "@/types";

export function AdminVenues() {
  const toast = useToast();
  const [items, setItems] = useState<Venue[]>([]);

  useEffect(() => {
    api.getVenues().then(setItems);
  }, []);

  const handleAdd = async (data: Record<string, unknown>) => {
    await api.addVenue(data as Omit<Venue, "id">);
    setItems(await api.getVenues());
    toast.toast("Venue created", "success");
  };

  const handleEdit = async (id: string, data: Record<string, unknown>) => {
    await api.updateVenue(id, data as Partial<Venue>);
    setItems(await api.getVenues());
    toast.toast("Venue updated", "success");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this venue?")) return;
    await api.deleteVenue(id);
    setItems(await api.getVenues());
    toast.toast("Venue deleted", "success");
  };

  return (
    <AdminEntityManager
      title="Venues"
      items={items}
      columns={[
        { header: "Name", render: (v) => v.name },
        { header: "Location", render: (v) => v.location },
        { header: "Capacity", render: (v) => v.capacity },
        { header: "Matches Hosted", render: (v) => v.matchesHosted },
      ]}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      renderForm={({ initial, onSubmit, onCancel }) => (
        <VenueForm
          initial={initial}
          onSubmit={(data) => onSubmit(data as Record<string, unknown>)}
          onCancel={onCancel}
        />
      )}
    />
  );
}
