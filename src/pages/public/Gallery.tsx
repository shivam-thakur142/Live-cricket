import { useEffect, useMemo, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { Empty } from "@/components/ui/Empty";
import { FilterBar } from "@/components/shared/FilterBar";
import * as api from "@/services/api";
import type { GalleryItem, Tournament } from "@/types";

export function Gallery() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [category, setCategory] = useState("all");
  const [tournamentFilter, setTournamentFilter] = useState("all");

  useEffect(() => {
    Promise.all([api.getGallery(), api.getTournaments()]).then(([g, t]) => {
      setItems(g);
      setTournaments(t);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const catOk = category === "all" || i.category === category;
      const tourOk = tournamentFilter === "all" || i.tournamentId === tournamentFilter;
      return catOk && tourOk;
    });
  }, [items, category, tournamentFilter]);

  if (loading) return <Loading />;

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Gallery</h1>
        <p>Memorable moments from SCL tournaments.</p>
      </div>
      <FilterBar
        filters={[
          {
            label: "Category",
            value: category,
            options: [
              { value: "all", label: "All Categories" },
              { value: "Match", label: "Match" },
              { value: "Team", label: "Team" },
              { value: "Trophy", label: "Trophy" },
              { value: "Ground", label: "Ground" },
              { value: "Moment", label: "Moment" },
            ],
            onChange: setCategory,
          },
          {
            label: "Tournament",
            value: tournamentFilter,
            options: [{ value: "all", label: "All Tournaments" }, ...tournaments.map((t) => ({ value: t.id, label: t.name }))],
            onChange: setTournamentFilter,
          },
        ]}
      />
      {filtered.length === 0 ? (
        <Empty message="No gallery items found." />
      ) : (
        <div className="gallery-grid">
          {filtered.map((item) => (
            <Card key={item.id} className="gallery-item" padding="none">
              <div className="gallery-image placeholder">
                <ImageIcon size={40} />
              </div>
              <div className="gallery-caption">
                <h4>{item.title}</h4>
                <span>{item.category}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
