import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { Empty } from "@/components/ui/Empty";
import { FilterBar } from "@/components/shared/FilterBar";
import { PointsTableView } from "@/components/shared/PointsTableView";
import * as api from "@/services/api";
import type { PointsTableEntry, Tournament } from "@/types";

export function PointsTablePage() {
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState("");
  const [points, setPoints] = useState<PointsTableEntry[]>([]);

  useEffect(() => {
    api.getTournaments().then((data) => {
      setTournaments(data);
      const defaultId = data.find((t) => t.status === "ongoing")?.id ?? data[0]?.id ?? "";
      setSelected(defaultId);
      if (defaultId) {
        api.getPointsTable(defaultId).then(setPoints);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    api.getPointsTable(selected).then((data) => {
      setPoints(data);
      setLoading(false);
    });
  }, [selected]);

  if (loading) return <Loading />;

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Points Table</h1>
        <p>Tournament standings and team rankings.</p>
      </div>
      <FilterBar
        filters={[
          {
            label: "Tournament",
            value: selected,
            options: tournaments.map((t) => ({ value: t.id, label: t.name })),
            onChange: setSelected,
          },
        ]}
      />
      {points.length === 0 ? (
        <Empty message="No points table data available." />
      ) : (
        <Card padding="none">
          <PointsTableView entries={points} />
        </Card>
      )}
    </div>
  );
}
