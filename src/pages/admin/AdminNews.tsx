import { useEffect, useState } from "react";
import { AdminEntityManager } from "@/components/admin/AdminEntityManager";
import { NewsForm } from "@/components/admin/forms/NewsForm";
import { useToast } from "@/components/ui/ToastProvider";
import { getTournamentById, formatDate } from "@/utils/helpers";
import * as api from "@/services/api";
import type { NewsArticle, Tournament } from "@/types";

export function AdminNews() {
  const toast = useToast();
  const [items, setItems] = useState<NewsArticle[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    Promise.all([api.getNews(), api.getTournaments()]).then(([n, t]) => {
      setItems(n);
      setTournaments(t);
    });
  }, []);

  const handleAdd = async (data: Record<string, unknown>) => {
    await api.addNews(data as Omit<NewsArticle, "id">);
    setItems(await api.getNews());
    toast.toast("News article created", "success");
  };

  const handleEdit = async (id: string, data: Record<string, unknown>) => {
    await api.updateNews(id, data as Partial<NewsArticle>);
    setItems(await api.getNews());
    toast.toast("News article updated", "success");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    await api.deleteNews(id);
    setItems(await api.getNews());
    toast.toast("News article deleted", "success");
  };

  return (
    <AdminEntityManager
      title="News"
      items={items}
      columns={[
        { header: "Title", render: (n) => n.title },
        { header: "Category", render: (n) => n.category },
        { header: "Tournament", render: (n) => getTournamentById(n.tournamentId)?.name ?? "-" },
        { header: "Date", render: (n) => formatDate(n.date) },
      ]}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      renderForm={({ initial, onSubmit, onCancel }) => (
        <NewsForm
          initial={initial}
          tournaments={tournaments}
          onSubmit={(data) => onSubmit(data as Record<string, unknown>)}
          onCancel={onCancel}
        />
      )}
    />
  );
}
