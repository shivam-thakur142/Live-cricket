import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { Empty } from "@/components/ui/Empty";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { Table, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { getTeamById, formatDate } from "@/utils/helpers";
import * as api from "@/services/api";
import type { Match, Player, PlayerBattingStats, PlayerBowlingStats } from "@/types";

export function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<Player | undefined>();
  const [matches, setMatches] = useState<Match[]>([]);
  const [batting, setBatting] = useState<PlayerBattingStats | undefined>();
  const [bowling, setBowling] = useState<PlayerBowlingStats | undefined>();

  useEffect(() => {
    if (!id) return;
    Promise.all([api.getPlayerById(id), api.getMatches(), api.getBattingStats(), api.getBowlingStats()]).then(
      ([p, m, bStats, bwStats]) => {
        setPlayer(p);
        setMatches(m);
        setBatting(bStats.find((s) => s.playerId === id));
        setBowling(bwStats.find((s) => s.playerId === id));
        setLoading(false);
      }
    );
  }, [id]);

  const history = useMemo(() => {
    return matches.filter((m) =>
      m.innings?.some(
        (inn) =>
          inn.batting.some((b) => b.playerId === id) ||
          inn.bowling.some((b) => b.playerId === id)
      )
    );
  }, [matches, id]);

  if (loading) return <Loading />;
  if (!player) return <Empty message="Player not found." />;

  const team = getTeamById(player.teamId);

  return (
    <div className="container page">
      <Link to="/players" className="back-link"><ArrowLeft size={18} /> Back to players</Link>

      <div className="player-hero">
        <TeamLogo name={player.name} size={96} />
        <div>
          <h1>{player.name}</h1>
          <p>{team?.name} &middot; {player.role}</p>
          <div className="player-tags">
            <span><User size={14} /> #{player.jerseyNumber}</span>
            <span>{player.battingStyle}</span>
            {player.bowlingStyle && <span>{player.bowlingStyle}</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <Card>
          <h3>Batting Stats</h3>
          {batting ? (
            <div className="stat-grid">
              <StatBox label="Matches" value={batting.matches} />
              <StatBox label="Innings" value={batting.innings} />
              <StatBox label="Runs" value={batting.runs} />
              <StatBox label="Average" value={batting.average} />
              <StatBox label="Strike Rate" value={batting.strikeRate} />
              <StatBox label="Highest" value={`${batting.highestScore}${batting.highestScoreNotOut ? "*" : ""}`} />
              <StatBox label="Fours" value={batting.fours} />
              <StatBox label="Sixes" value={batting.sixes} />
              <StatBox label="50s" value={batting.fifties} />
              <StatBox label="100s" value={batting.hundreds} />
            </div>
          ) : (
            <Empty message="No batting stats." />
          )}
        </Card>

        <Card>
          <h3>Bowling Stats</h3>
          {bowling ? (
            <div className="stat-grid">
              <StatBox label="Matches" value={bowling.matches} />
              <StatBox label="Innings" value={bowling.innings} />
              <StatBox label="Wickets" value={bowling.wickets} />
              <StatBox label="Runs" value={bowling.runs} />
              <StatBox label="Economy" value={bowling.economy} />
              <StatBox label="Average" value={bowling.average} />
              <StatBox label="Best" value={bowling.bestFigures} />
              <StatBox label="Overs" value={bowling.overs} />
              <StatBox label="Maidens" value={bowling.maidens} />
            </div>
          ) : (
            <Empty message="No bowling stats." />
          )}
        </Card>
      </div>

      <section className="section">
        <h3>Match History</h3>
        {history.length === 0 ? (
          <Empty message="No match history." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell header>Date</TableCell>
                <TableCell header>Match</TableCell>
                <TableCell header>Runs</TableCell>
                <TableCell header>Wickets</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((match) => {
                const battingEntry = match.innings?.flatMap((i) => i.batting).find((b) => b.playerId === id);
                const bowlingEntry = match.innings?.flatMap((i) => i.bowling).find((b) => b.playerId === id);
                return (
                  <TableRow key={match.id}>
                    <TableCell>{formatDate(match.date)}</TableCell>
                    <TableCell>
                      <Link to={`/matches/${match.id}`}>Match {match.matchNumber}</Link>
                    </TableCell>
                    <TableCell>{battingEntry ? `${battingEntry.runs} (${battingEntry.balls})` : "-"}</TableCell>
                    <TableCell>{bowlingEntry ? `${bowlingEntry.wickets}/${bowlingEntry.runs}` : "-"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat-box">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}
