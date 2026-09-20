import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Calendar, MapPin, Trophy, Users, Target, Award } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Loading } from "@/components/ui/Loading";
import { Empty } from "@/components/ui/Empty";
import { Logo } from "@/components/shared/Logo";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { MatchCard } from "@/components/shared/MatchCard";
import { PointsTableView } from "@/components/shared/PointsTableView";
import { StatsTable } from "@/components/shared/StatsTable";
import {
  formatDate,
  getTeamById,
  getPlayerById,
  statusLabel,
} from "@/utils/helpers";
import * as api from "@/services/api";
import type {
  Match,
  Player,
  PlayerBattingStats,
  PlayerBowlingStats,
  PointsTableEntry,
  Tournament,
  TournamentRecord,
} from "@/types";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "matches", label: "Matches" },
  { id: "teams", label: "Teams" },
  { id: "players", label: "Players" },
  { id: "points", label: "Points Table" },
  { id: "stats", label: "Stats" },
  { id: "records", label: "Records" },
];

export function TournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState<Tournament | undefined>();
  const [activeTab, setActiveTab] = useState("overview");
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [points, setPoints] = useState<PointsTableEntry[]>([]);
  const [batting, setBatting] = useState<PlayerBattingStats[]>([]);
  const [bowling, setBowling] = useState<PlayerBowlingStats[]>([]);
  const [records, setRecords] = useState<TournamentRecord[]>([]);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const [t, m, p, pt, b, bw, r] = await Promise.all([
        api.getTournamentById(id),
        api.getMatchesByTournament(id),
        api.getPlayers(),
        api.getPointsTable(id),
        api.getBattingStats(id),
        api.getBowlingStats(id),
        api.getRecords(id),
      ]);
      setTournament(t);
      setMatches(m);
      setPlayers(p);
      setPoints(pt);
      setBatting(b);
      setBowling(bw);
      setRecords(r);
      setLoading(false);
    }
    load();
  }, [id]);

  const teams = useMemo(() => {
    const teamIds = new Set<string>();
    matches.forEach((m) => {
      teamIds.add(m.team1Id);
      teamIds.add(m.team2Id);
    });
    return Array.from(teamIds).map((tid) => getTeamById(tid)).filter(Boolean);
  }, [matches]);

  if (loading) return <Loading />;
  if (!tournament) return <Empty message="Tournament not found." />;

  return (
    <div className="container page">
      <div className="tournament-hero">
        <Logo name={tournament.name} size={80} />
        <div className="tournament-hero-info">
          <h1>{tournament.name}</h1>
          <p>{tournament.format} &middot; {tournament.overs} overs &middot; {tournament.location}</p>
          <div className="tournament-hero-meta">
            <span><Calendar size={16} /> {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}</span>
            <span><MapPin size={16} /> {tournament.location}</span>
            <Badge variant={
              tournament.status === "ongoing" ? "success" :
              tournament.status === "registration_open" ? "warning" :
              tournament.status === "completed" ? "default" : "info"
            }>
              {statusLabel(tournament.status)}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="tab-content">
        {activeTab === "overview" && (
          <OverviewTab tournament={tournament} matches={matches} points={points} batting={batting} bowling={bowling} teams={teams as NonNullable<ReturnType<typeof getTeamById>>[]} />
        )}
        {activeTab === "matches" && (
          <MatchesTab matches={matches} />
        )}
        {activeTab === "teams" && (
          <TeamsTab teams={teams as NonNullable<ReturnType<typeof getTeamById>>[]} />
        )}
        {activeTab === "players" && (
          <PlayersTab players={players.filter((p) => teams.some((t) => t?.id === p.teamId))} />
        )}
        {activeTab === "points" && (
          <PointsTab points={points} />
        )}
        {activeTab === "stats" && (
          <StatsTab batting={batting} bowling={bowling} />
        )}
        {activeTab === "records" && (
          <RecordsTab records={records} />
        )}
      </div>
    </div>
  );
}

function OverviewTab({
  tournament,
  matches,
  points,
  batting,
  bowling,
  teams,
}: {
  tournament: Tournament;
  matches: Match[];
  points: PointsTableEntry[];
  batting: PlayerBattingStats[];
  bowling: PlayerBowlingStats[];
  teams: NonNullable<ReturnType<typeof getTeamById>>[];
}) {
  const upcoming = matches.filter((m) => m.status === "upcoming")[0];
  const lastResult = matches.filter((m) => m.status === "completed")[0];
  const topBat = batting.sort((a, b) => b.runs - a.runs)[0];
  const topBowl = bowling.sort((a, b) => b.wickets - a.wickets)[0];

  return (
    <div className="grid grid-2 overview-grid">
      <Card>
        <h3>Tournament Summary</h3>
        <p>{tournament.description}</p>
        <div className="overview-meta">
          <span><Trophy size={16} /> Current Stage: {tournament.currentStage ?? "TBA"}</span>
          <span><Users size={16} /> Teams: {teams.length}</span>
          <span><Target size={16} /> Matches: {matches.length}</span>
        </div>
      </Card>

      <Card>
        <h3>Upcoming Match</h3>
        {upcoming ? (
          <MiniMatch match={upcoming} />
        ) : (
          <Empty message="No upcoming matches." />
        )}
      </Card>

      <Card>
        <h3>Recent Result</h3>
        {lastResult ? (
          <MiniMatch match={lastResult} />
        ) : (
          <Empty message="No results yet." />
        )}
      </Card>

      <Card>
        <h3>Top Performers</h3>
        <div className="top-performers">
          {topBat && <PerformerRow label="Top Runs" playerId={topBat.playerId} value={`${topBat.runs} runs`} />}
          {topBowl && <PerformerRow label="Top Wickets" playerId={topBowl.playerId} value={`${topBowl.wickets} wickets`} />}
        </div>
      </Card>

      <Card className="span-2">
        <h3>Points Table Preview</h3>
        <PointsTableView entries={points.slice(0, 6)} compact />
      </Card>
    </div>
  );
}

function MatchesTab({ matches }: { matches: Match[] }) {
  if (matches.length === 0) return <Empty message="No matches scheduled." />;
  return (
    <div className="grid grid-2">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}

function TeamsTab({ teams }: { teams: NonNullable<ReturnType<typeof getTeamById>>[] }) {
  return (
    <div className="grid grid-3">
      {teams.map((team) => (
        <Card key={team.id} className="team-card">
          <TeamLogo name={team.name} size={56} />
          <h4>{team.name}</h4>
          <p>Captain: {team.captainName ?? "TBA"}</p>
          <Link to={`/teams/${team.id}`} className="card-link">View Squad</Link>
        </Card>
      ))}
    </div>
  );
}

function PlayersTab({ players }: { players: Player[] }) {
  return (
    <div className="grid grid-4 player-grid">
      {players.map((player) => {
        const team = getTeamById(player.teamId);
        return (
          <Card key={player.id} className="player-card">
            <TeamLogo name={player.name} size={48} />
            <h4>{player.name}</h4>
            <p>{team?.name}</p>
            <span className="player-role">{player.role}</span>
            <Link to={`/players/${player.id}`} className="card-link">Profile</Link>
          </Card>
        );
      })}
    </div>
  );
}

function PointsTab({ points }: { points: PointsTableEntry[] }) {
  return (
    <Card padding="none">
      <PointsTableView entries={points} />
    </Card>
  );
}

function StatsTab({ batting, bowling }: { batting: PlayerBattingStats[]; bowling: PlayerBowlingStats[] }) {
  return (
    <div className="stats-tabs-content">
      <Card>
        <h3>Most Runs</h3>
        <StatsTable
          data={batting.sort((a, b) => b.runs - a.runs).slice(0, 10)}
          getPlayerId={(r) => r.playerId}
          columns={[
            { key: "runs", header: "Runs", render: (r) => r.runs },
            { key: "inn", header: "Inns", render: (r) => r.innings },
            { key: "avg", header: "Avg", render: (r) => r.average },
            { key: "sr", header: "SR", render: (r) => r.strikeRate },
          ]}
        />
      </Card>
      <Card>
        <h3>Most Wickets</h3>
        <StatsTable
          data={bowling.sort((a, b) => b.wickets - a.wickets).slice(0, 10)}
          getPlayerId={(r) => r.playerId}
          columns={[
            { key: "wickets", header: "Wkts", render: (r) => r.wickets },
            { key: "econ", header: "Econ", render: (r) => r.economy },
            { key: "avg", header: "Avg", render: (r) => r.average },
            { key: "best", header: "Best", render: (r) => r.bestFigures },
          ]}
        />
      </Card>
    </div>
  );
}

function RecordsTab({ records }: { records: TournamentRecord[] }) {
  if (records.length === 0) return <Empty message="No records available." />;
  return (
    <div className="grid grid-3">
      {records.map((record) => (
        <Card key={record.id} className="record-card">
          <Award size={28} />
          <h4>{record.category}</h4>
          <p className="record-value">{record.value}</p>
          <p className="record-holder">{record.holderName}</p>
          {record.date && <span className="record-date">{formatDate(record.date)}</span>}
        </Card>
      ))}
    </div>
  );
}

function MiniMatch({ match }: { match: Match }) {
  const team1 = getTeamById(match.team1Id);
  const team2 = getTeamById(match.team2Id);
  const innings1 = match.innings?.[0];
  const innings2 = match.innings?.[1];
  return (
    <div className="mini-match">
      <div className="mini-match-row">
        <TeamLogo name={team1?.name ?? ""} size={36} />
        <span>{team1?.shortName}</span>
        {innings1 && <strong>{innings1.runs}/{innings1.wickets}</strong>}
      </div>
      <div className="mini-match-row">
        <TeamLogo name={team2?.name ?? ""} size={36} />
        <span>{team2?.shortName}</span>
        {innings2 && <strong>{innings2.runs}/{innings2.wickets}</strong>}
      </div>
      {match.resultText && <p className="mini-match-result">{match.resultText}</p>}
      <Link to={`/matches/${match.id}`} className="card-link">Match details</Link>
    </div>
  );
}

function PerformerRow({ label, playerId, value }: { label: string; playerId: string; value: string }) {
  const player = getPlayerById(playerId);
  const team = player ? getTeamById(player.teamId) : undefined;
  return (
    <div className="performer-row">
      <div>
        <p className="performer-label">{label}</p>
        <p className="performer-name">{player?.name}</p>
        <p className="performer-team">{team?.name}</p>
      </div>
      <span className="performer-value">{value}</span>
    </div>
  );
}
