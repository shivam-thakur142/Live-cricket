import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { Empty } from "@/components/ui/Empty";
import { FilterBar } from "@/components/shared/FilterBar";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { getTeamById } from "@/utils/helpers";
import * as api from "@/services/api";
import type { Match, Player, Team, Tournament } from "@/types";

export function Players() {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [tournamentFilter, setTournamentFilter] = useState("all");

  useEffect(() => {
    Promise.all([api.getPlayers(), api.getTeams(), api.getTournaments(), api.getMatches()]).then(
      ([p, t, tour, m]) => {
        setPlayers(p);
        setTeams(t);
        setTournaments(tour);
        setMatches(m);
        setLoading(false);
      }
    );
  }, []);

  const teamIdsInTournament = useMemo(() => {
    if (tournamentFilter === "all") return new Set(teams.map((t) => t.id));
    return new Set(matches.filter((m) => m.tournamentId === tournamentFilter).flatMap((m) => [m.team1Id, m.team2Id]));
  }, [tournamentFilter, matches, teams]);

  const filtered = useMemo(() => {
    return players.filter((p) => {
      const searchOk = p.name.toLowerCase().includes(search.toLowerCase());
      const teamOk = teamFilter === "all" || p.teamId === teamFilter;
      const roleOk = roleFilter === "all" || p.role === roleFilter;
      const tournamentOk = teamIdsInTournament.has(p.teamId);
      return searchOk && teamOk && roleOk && tournamentOk;
    });
  }, [players, search, teamFilter, roleFilter, teamIdsInTournament]);

  if (loading) return <Loading />;

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Players</h1>
        <p>Search and discover players across tournaments.</p>
      </div>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search players..."
        filters={[
          {
            label: "Team",
            value: teamFilter,
            options: [{ value: "all", label: "All Teams" }, ...teams.map((t) => ({ value: t.id, label: t.name }))],
            onChange: setTeamFilter,
          },
          {
            label: "Role",
            value: roleFilter,
            options: [
              { value: "all", label: "All Roles" },
              { value: "Batsman", label: "Batsman" },
              { value: "Bowler", label: "Bowler" },
              { value: "All-rounder", label: "All-rounder" },
              { value: "Wicket-keeper", label: "Wicket-keeper" },
            ],
            onChange: setRoleFilter,
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
        <Empty message="No players found." />
      ) : (
        <div className="grid grid-4 player-grid">
          {filtered.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlayerCard({ player }: { player: Player }) {
  const team = getTeamById(player.teamId);
  return (
    <Card className="player-card">
      <TeamLogo name={player.name} size={56} />
      <h4>{player.name}</h4>
      <p>{team?.name}</p>
      <span className="player-role">{player.role}</span>
      <div className="player-mini-stats">
        <span>{player.battingStyle}</span>
        {player.bowlingStyle && <span>{player.bowlingStyle}</span>}
      </div>
      <Link to={`/players/${player.id}`} className="card-link">View Profile</Link>
    </Card>
  );
}
