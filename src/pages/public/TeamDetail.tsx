import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Trophy, Users, Calendar } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { Empty } from "@/components/ui/Empty";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { MatchCard } from "@/components/shared/MatchCard";
import { getTeamById, getPlayerById } from "@/utils/helpers";
import * as api from "@/services/api";
import type { Match, Player, Team } from "@/types";

export function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<Team | undefined>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([api.getTeamById(id), api.getPlayers(), api.getMatches()]).then(([t, p, m]) => {
      setTeam(t);
      setPlayers(p.filter((player) => player.teamId === id));
      setMatches(m.filter((match) => match.team1Id === id || match.team2Id === id));
      setLoading(false);
    });
  }, [id]);

  const results = useMemo(() => matches.filter((m) => m.status === "completed"), [matches]);

  if (loading) return <Loading />;
  if (!team) return <Empty message="Team not found." />;

  return (
    <div className="container page">
      <Link to="/teams" className="back-link"><ArrowLeft size={18} /> Back to teams</Link>

      <div className="team-hero">
        <TeamLogo name={team.name} size={96} />
        <div>
          <h1>{team.name}</h1>
          <p>{team.shortName} &middot; Captain {team.captainName ?? "TBA"} &middot; Coach {team.coach ?? "TBA"}</p>
        </div>
      </div>

      <div className="grid grid-2">
        <Card>
          <h3><Users size={18} /> Squad</h3>
          <div className="table-scroll">
            <table className="table">
              <thead className="table-head">
                <tr><th>Player</th><th>Role</th><th>Jersey</th></tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id}>
                    <td>{player.name}</td>
                    <td>{player.role}</td>
                    <td>#{player.jerseyNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h3><Trophy size={18} /> Recent Results</h3>
          {results.length === 0 ? (
            <Empty message="No completed matches." />
          ) : (
            <div className="team-results">
              {results.slice(0, 3).map((match) => (
                <ResultRow key={match.id} match={match} teamId={team.id} />
              ))}
            </div>
          )}
        </Card>
      </div>

      <section className="section">
        <h3><Calendar size={18} /> Fixtures</h3>
        {matches.length === 0 ? (
          <Empty message="No fixtures." />
        ) : (
          <div className="grid grid-2">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ResultRow({ match, teamId }: { match: Match; teamId: string }) {
  const opponentId = match.team1Id === teamId ? match.team2Id : match.team1Id;
  const opponent = getTeamById(opponentId);
  const isWinner = match.resultText?.toLowerCase().includes(getTeamById(teamId)?.name.toLowerCase() ?? "");
  const pom = match.playerOfMatchId ? getPlayerById(match.playerOfMatchId) : undefined;
  return (
    <div className={`result-row ${isWinner ? "win" : "loss"}`}>
      <span>vs {opponent?.shortName}</span>
      <span>{match.resultText}</span>
      {pom && <small>POM: {pom.name}</small>}
    </div>
  );
}
