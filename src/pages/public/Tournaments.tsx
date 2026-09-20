import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Loading } from "@/components/ui/Loading";
import { Empty } from "@/components/ui/Empty";
import { Logo } from "@/components/shared/Logo";
import { FilterBar } from "@/components/shared/FilterBar";
import { formatDate, statusLabel } from "@/utils/helpers";
import * as api from "@/services/api";
import type { Tournament } from "@/types";

export function Tournaments() {
  const [loading, setLoading] = useState(true);
  const [all, setAll] = useState<Tournament[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.getTournaments().then((data) => {
      setAll(data);
      setLoading(false);
    });
  }, []);

  const filtered = filter === "all" ? all : all.filter((t) => t.status === filter);

  if (loading) return <Loading />;

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Tournaments</h1>
        <p>Browse current, upcoming, and past cricket tournaments on the SCL platform.</p>
      </div>

      <FilterBar
        filters={[
          {
            label: "Status",
            value: filter,
            options: [
              { value: "all", label: "All Statuses" },
              { value: "upcoming", label: "Upcoming" },
              { value: "registration_open", label: "Registration Open" },
              { value: "ongoing", label: "Ongoing" },
              { value: "completed", label: "Completed" },
            ],
            onChange: setFilter,
          },
        ]}
      />

      {filtered.length === 0 ? (
        <Empty message="No tournaments found." />
      ) : (
        <div className="grid grid-3 tournament-grid">
          {filtered.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      )}
    </div>
  );
}

function TournamentCard({ tournament }: { tournament: Tournament }) {
  return (
    <Card className="tournament-card" padding="none">
      <div className="tournament-card-header">
        <Logo name={tournament.name} size={64} />
        <div>
          <h3>{tournament.name}</h3>
          <p>{tournament.season} &middot; {tournament.format} &middot; {tournament.overs} overs</p>
        </div>
      </div>
      <div className="tournament-card-body">
        <div className="tournament-detail">
          <Calendar size={16} />
          <span>{formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}</span>
        </div>
        <div className="tournament-detail">
          <MapPin size={16} />
          <span>{tournament.location}</span>
        </div>
        <div className="tournament-detail">
          <Trophy size={16} />
          <span>Stage: {tournament.currentStage ?? "TBA"}</span>
        </div>
        <p className="tournament-desc">{tournament.description}</p>
      </div>
      <div className="tournament-card-footer">
        <Badge variant={
          tournament.status === "ongoing" ? "success" :
          tournament.status === "registration_open" ? "warning" :
          tournament.status === "completed" ? "default" : "info"
        }>
          {statusLabel(tournament.status)}
        </Badge>
        <Link to={`/tournaments/${tournament.id}`} className="tournament-link">
          View Details
        </Link>
      </div>
    </Card>
  );
}
