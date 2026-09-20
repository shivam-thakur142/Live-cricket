import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { Empty } from "@/components/ui/Empty";
import { FilterBar } from "@/components/shared/FilterBar";
import { TeamLogo } from "@/components/shared/TeamLogo";
import * as api from "@/services/api";
import type { Team } from "@/types";

export function Teams() {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.getTeams().then((data) => {
      setTeams(data);
      setLoading(false);
    });
  }, []);

  const filtered = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.shortName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Teams</h1>
        <p>Discover all teams competing across SCL tournaments.</p>
      </div>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search teams..."
      />
      {filtered.length === 0 ? (
        <Empty message="No teams found." />
      ) : (
        <div className="grid grid-3">
          {filtered.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}

function TeamCard({ team }: { team: Team }) {
  return (
    <Card className="team-card">
      <TeamLogo name={team.name} size={64} />
      <h3>{team.name}</h3>
      <p className="team-short">{team.shortName}</p>
      <p>Captain: {team.captainName ?? "TBA"}</p>
      <p>Coach: {team.coach ?? "TBA"}</p>
      <Link to={`/teams/${team.id}`} className="card-link">View Squad</Link>
    </Card>
  );
}
