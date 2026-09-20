import { useEffect, useState } from "react";
import { Award } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { Empty } from "@/components/ui/Empty";
import { FilterBar } from "@/components/shared/FilterBar";
import { formatDate } from "@/utils/helpers";
import * as api from "@/services/api";
import type { Tournament, TournamentRecord } from "@/types";

export function RecordsPage() {
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState("all");
  const [records, setRecords] = useState<TournamentRecord[]>([]);

  useEffect(() => {
    Promise.all([api.getTournaments(), api.getRecords()]).then(([t, r]) => {
      setTournaments(t);
      setRecords(r);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const tid = selected === "all" ? undefined : selected;
    api.getRecords(tid).then(setRecords);
  }, [selected]);

  if (loading) return <Loading />;

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Records</h1>
        <p>Notable tournament records and milestones.</p>
      </div>
      <FilterBar
        filters={[
          {
            label: "Tournament",
            value: selected,
            options: [{ value: "all", label: "All Tournaments" }, ...tournaments.map((t) => ({ value: t.id, label: t.name }))],
            onChange: setSelected,
          },
        ]}
      />
      {records.length === 0 ? (
        <Empty message="No records found." />
      ) : (
        <div className="grid grid-3">
          {records.map((record) => (
            <Card key={record.id} className="record-card">
              <Award size={32} />
              <h4>{record.category}</h4>
              <p className="record-value">{record.value}</p>
              <p className="record-holder">{record.holderName}</p>
              {record.date && <span className="record-date">{formatDate(record.date)}</span>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
