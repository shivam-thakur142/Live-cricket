import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Calendar, Trophy, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Loading } from "@/components/ui/Loading";
import { Empty } from "@/components/ui/Empty";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { LiveIndicator } from "@/components/shared/LiveIndicator";
import { Table, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import {
  formatDate,
  formatTime,
  getTeamById,
  getVenueById,
  getTournamentById,
  getPlayerById,
  statusLabel,
} from "@/utils/helpers";
import * as api from "@/services/api";
import type { Match, Player } from "@/types";

const tabs = [
  { id: "summary", label: "Summary" },
  { id: "scorecard", label: "Scorecard" },
  { id: "commentary", label: "Commentary" },
  { id: "playingxi", label: "Playing XI" },
];

export function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState<Match | undefined>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    if (!id) return;
    Promise.all([api.getMatchById(id), api.getPlayers()]).then(([m, p]) => {
      setMatch(m);
      setPlayers(p);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <Loading />;
  if (!match) return <Empty message="Match not found." />;

  const team1 = getTeamById(match.team1Id);
  const team2 = getTeamById(match.team2Id);
  const venue = getVenueById(match.venueId);
  const tournament = getTournamentById(match.tournamentId);
  const innings1 = match.innings?.[0];
  const innings2 = match.innings?.[1];

  return (
    <div className="container page">
      <Link to="/matches" className="back-link">
        <ArrowLeft size={18} /> Back to matches
      </Link>

      <div className="match-detail-header">
        <div>
          <div className="match-detail-meta">
            {match.status === "live" ? <LiveIndicator /> : <Badge>{statusLabel(match.status)}</Badge>}
            <span>{tournament?.name}</span>
            <span>Match {match.matchNumber}</span>
            <span>{match.stage}</span>
          </div>
          <h1>{team1?.name} vs {team2?.name}</h1>
          <p><MapPin size={16} /> {venue?.name} &middot; <Calendar size={16} /> {formatDate(match.date)} at {formatTime(match.time)}</p>
        </div>
      </div>

      <Card className="match-scoreboard">
        <div className="scoreboard-teams">
          <div className="scoreboard-team">
            <TeamLogo name={team1?.name ?? ""} size={72} />
            <div>
              <h2>{team1?.shortName}</h2>
              {innings1 ? (
                <p className="scoreboard-score">{innings1.runs}/{innings1.wickets} <span>({formatOvers(innings1.overs)})</span></p>
              ) : (
                <p className="scoreboard-score">-</p>
              )}
            </div>
          </div>
          <div className="scoreboard-center">
            <span className="scoreboard-vs">VS</span>
            {match.resultText && <p className="scoreboard-result">{match.resultText}</p>}
            {match.status === "live" && match.target && <p className="scoreboard-target">Target {match.target}</p>}
          </div>
          <div className="scoreboard-team">
            <TeamLogo name={team2?.name ?? ""} size={72} />
            <div>
              <h2>{team2?.shortName}</h2>
              {innings2 ? (
                <p className="scoreboard-score">{innings2.runs}/{innings2.wickets} <span>({formatOvers(innings2.overs)})</span></p>
              ) : (
                <p className="scoreboard-score">-</p>
              )}
            </div>
          </div>
        </div>
        {match.playerOfMatchId && (
          <div className="pom">
            <Trophy size={18} /> Player of the Match: <strong>{getPlayerById(match.playerOfMatchId)?.name}</strong>
          </div>
        )}
      </Card>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="tab-content">
        {activeTab === "summary" && <SummaryTab match={match} />}
        {activeTab === "scorecard" && <ScorecardTab match={match} />}
        {activeTab === "commentary" && <CommentaryTab match={match} />}
        {activeTab === "playingxi" && <PlayingXITab team1Id={match.team1Id} team2Id={match.team2Id} players={players} />}
      </div>
    </div>
  );
}

function SummaryTab({ match }: { match: Match }) {
  const team1 = getTeamById(match.team1Id);
  const team2 = getTeamById(match.team2Id);
  const innings1 = match.innings?.[0];
  const innings2 = match.innings?.[1];
  return (
    <div className="grid grid-2">
      <Card>
        <h3>Toss</h3>
        <p>{getTeamById(match.tossWinnerId)?.name} won the toss and elected to {match.electedTo === "bat" ? "bat first" : "field first"}.</p>
      </Card>
      <Card>
        <h3>Result</h3>
        <p>{match.resultText ?? "Match yet to begin."}</p>
      </Card>
      {innings1 && (
        <Card>
          <h3>{team1?.name} Innings</h3>
          <p className="big-score">{innings1.runs}/{innings1.wickets} <span>({formatOvers(innings1.overs)} ov)</span></p>
          <p>Extras: {innings1.extras.total} (W {innings1.extras.wides}, NB {innings1.extras.noBalls}, B {innings1.extras.byes}, LB {innings1.extras.legByes})</p>
        </Card>
      )}
      {innings2 && (
        <Card>
          <h3>{team2?.name} Innings</h3>
          <p className="big-score">{innings2.runs}/{innings2.wickets} <span>({formatOvers(innings2.overs)} ov)</span></p>
          <p>Extras: {innings2.extras.total} (W {innings2.extras.wides}, NB {innings2.extras.noBalls}, B {innings2.extras.byes}, LB {innings2.extras.legByes})</p>
        </Card>
      )}
    </div>
  );
}

function ScorecardTab({ match }: { match: Match }) {
  if (!match.innings || match.innings.length === 0) return <Empty message="Scorecard not available." />;
  return (
    <div className="scorecard">
      {match.innings.map((inn) => {
        const team = getTeamById(inn.teamId);
        return (
          <Card key={inn.teamId} className="innings-card">
            <h3>{team?.name} &mdash; {inn.runs}/{inn.wickets} ({formatOvers(inn.overs)} ov)</h3>
            <div className="table-scroll">
              <table className="table">
                <thead className="table-head">
                  <tr>
                    <th>Batter</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th>
                  </tr>
                </thead>
                <tbody>
                  {inn.batting.map((b) => (
                    <tr key={b.playerId}>
                      <td>{b.playerName}<br /><small>{b.dismissal}</small></td>
                      <td>{b.runs}</td><td>{b.balls}</td><td>{b.fours}</td><td>{b.sixes}</td><td>{b.strikeRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="extras-line">Extras: {inn.extras.total} (W {inn.extras.wides}, NB {inn.extras.noBalls}, B {inn.extras.byes}, LB {inn.extras.legByes})</p>
            <div className="table-scroll">
              <table className="table">
                <thead className="table-head">
                  <tr>
                    <th>Bowler</th><th>O</th><th>M</th><th>R</th><th>W</th><th>Econ</th>
                  </tr>
                </thead>
                <tbody>
                  {inn.bowling.map((b) => (
                    <tr key={b.playerId}>
                      <td>{b.playerName}</td>
                      <td>{formatOvers(b.overs)}</td><td>{b.maidens}</td><td>{b.runs}</td><td>{b.wickets}</td><td>{b.economy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function CommentaryTab({ match }: { match: Match }) {
  if (!match.commentary || match.commentary.length === 0) return <Empty message="Commentary not available." />;
  return (
    <Card className="commentary">
      {match.commentary.map((event) => (
        <div key={event.id} className={`commentary-event commentary-${event.type}`}>
          <span className="commentary-over">{event.over}.{event.ball}</span>
          <span className="commentary-text">{event.text}</span>
          {event.runs !== undefined && event.runs > 0 && <span className="commentary-runs">{event.runs}</span>}
        </div>
      ))}
    </Card>
  );
}

function PlayingXITab({ team1Id, team2Id, players }: { team1Id: string; team2Id: string; players: Player[] }) {
  const team1 = getTeamById(team1Id);
  const team2 = getTeamById(team2Id);
  const squad1 = players.filter((p) => p.teamId === team1Id);
  const squad2 = players.filter((p) => p.teamId === team2Id);

  return (
    <div className="grid grid-2">
      <Card>
        <h3>{team1?.name}</h3>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell header>Player</TableCell>
              <TableCell header>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {squad1.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <Card>
        <h3>{team2?.name}</h3>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell header>Player</TableCell>
              <TableCell header>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {squad2.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function formatOvers(overs: number) {
  const full = Math.floor(overs);
  const balls = Math.round((overs - full) * 10);
  return `${full}.${balls}`;
}
