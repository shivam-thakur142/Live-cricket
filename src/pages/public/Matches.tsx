import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MatchCard } from "@/components/shared/MatchCard";
import { FilterBar } from "@/components/shared/FilterBar";
import { Loading } from "@/components/ui/Loading";
import { Empty } from "@/components/ui/Empty";
import * as api from "@/services/api";
import type { Match, Tournament } from "@/types";

export function Matches() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("filter") || "all");
  const [tournamentFilter, setTournamentFilter] = useState("all");

  useEffect(() => {
    Promise.all([api.getMatches(), api.getTournaments()]).then(([m, t]) => {
      setMatches(m);
      setTournaments(t);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      const statusOk = statusFilter === "all" || m.status === statusFilter;
      const tournamentOk = tournamentFilter === "all" || m.tournamentId === tournamentFilter;
      return statusOk && tournamentOk;
    });
  }, [matches, statusFilter, tournamentFilter]);

  if (loading) return <Loading />;

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Matches</h1>
        <p>Explore upcoming, live, and completed matches across all tournaments.</p>
      </div>

      <FilterBar
        filters={[
          {
            label: "Status",
            value: statusFilter,
            options: [
              { value: "all", label: "All" },
              { value: "upcoming", label: "Upcoming" },
              { value: "live", label: "Live" },
              { value: "completed", label: "Completed" },
            ],
            onChange: setStatusFilter,
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
        <Empty message="No matches found." />
      ) : (
        <div className="grid grid-2">
          {filtered.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
