import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Loading } from "@/components/ui/Loading";
import { Empty } from "@/components/ui/Empty";
import { FilterBar } from "@/components/shared/FilterBar";
import { StatsTable } from "@/components/shared/StatsTable";
import { Table, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { getTeamById, getPlayerById } from "@/utils/helpers";
import { TeamLogo } from "@/components/shared/TeamLogo";
import * as api from "@/services/api";
import type {
  PlayerBattingStats,
  PlayerBowlingStats,
  PlayerFieldingStats,
  Tournament,
} from "@/types";

const tabs = [
  { id: "batting", label: "Batting" },
  { id: "bowling", label: "Bowling" },
  { id: "fielding", label: "Fielding" },
];

export function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("batting");
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState("all");
  const [batting, setBatting] = useState<PlayerBattingStats[]>([]);
  const [bowling, setBowling] = useState<PlayerBowlingStats[]>([]);
  const [fielding, setFielding] = useState<PlayerFieldingStats[]>([]);

  useEffect(() => {
    Promise.all([api.getTournaments(), api.getBattingStats(), api.getBowlingStats(), api.getFieldingStats()]).then(
      ([t, b, bw, f]) => {
        setTournaments(t);
        setBatting(b);
        setBowling(bw);
        setFielding(f);
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    const tid = selectedTournament === "all" ? undefined : selectedTournament;
    setLoading(true);
    Promise.all([api.getBattingStats(tid), api.getBowlingStats(tid), api.getFieldingStats(tid)]).then(
      ([b, bw, f]) => {
        setBatting(b);
        setBowling(bw);
        setFielding(f);
        setLoading(false);
      }
    );
  }, [selectedTournament]);

  if (loading) return <Loading />;

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Statistics</h1>
        <p>Leaderboards and performance rankings across tournaments.</p>
      </div>
      <FilterBar
        filters={[
          {
            label: "Tournament",
            value: selectedTournament,
            options: [{ value: "all", label: "All Tournaments" }, ...tournaments.map((t) => ({ value: t.id, label: t.name }))],
            onChange: setSelectedTournament,
          },
        ]}
      />
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      <div className="tab-content">
        {activeTab === "batting" && <BattingLeaderboards batting={batting} />}
        {activeTab === "bowling" && <BowlingLeaderboards bowling={bowling} />}
        {activeTab === "fielding" && <FieldingLeaderboards fielding={fielding} />}
      </div>
    </div>
  );
}

function BattingLeaderboards({ batting }: { batting: PlayerBattingStats[] }) {
  if (batting.length === 0) return <Empty message="No batting stats available." />;
  return (
    <div className="stats-leaderboards">
      <Card>
        <h3>Most Runs</h3>
        <StatsTable data={batting.sort((a, b) => b.runs - a.runs).slice(0, 10)} getPlayerId={(r) => r.playerId} columns={[
          { key: "runs", header: "Runs", render: (r) => r.runs },
          { key: "inn", header: "Inns", render: (r) => r.innings },
          { key: "avg", header: "Avg", render: (r) => r.average },
          { key: "sr", header: "SR", render: (r) => r.strikeRate },
        ]} />
      </Card>
      <Card>
        <h3>Highest Score</h3>
        <StatsTable data={batting.sort((a, b) => b.highestScore - a.highestScore).slice(0, 10)} getPlayerId={(r) => r.playerId} columns={[
          { key: "hs", header: "HS", render: (r) => `${r.highestScore}${r.highestScoreNotOut ? "*" : ""}` },
          { key: "runs", header: "Runs", render: (r) => r.runs },
          { key: "avg", header: "Avg", render: (r) => r.average },
        ]} />
      </Card>
      <Card>
        <h3>Best Strike Rate</h3>
        <StatsTable data={batting.filter((r) => r.balls >= 10).sort((a, b) => b.strikeRate - a.strikeRate).slice(0, 10)} getPlayerId={(r) => r.playerId} columns={[
          { key: "sr", header: "SR", render: (r) => r.strikeRate },
          { key: "runs", header: "Runs", render: (r) => r.runs },
          { key: "balls", header: "Balls", render: (r) => r.balls },
        ]} />
      </Card>
      <Card>
        <h3>Most Sixes</h3>
        <StatsTable data={batting.sort((a, b) => b.sixes - a.sixes).slice(0, 10)} getPlayerId={(r) => r.playerId} columns={[
          { key: "sixes", header: "6s", render: (r) => r.sixes },
          { key: "fours", header: "4s", render: (r) => r.fours },
          { key: "runs", header: "Runs", render: (r) => r.runs },
        ]} />
      </Card>
    </div>
  );
}

function BowlingLeaderboards({ bowling }: { bowling: PlayerBowlingStats[] }) {
  if (bowling.length === 0) return <Empty message="No bowling stats available." />;
  return (
    <div className="stats-leaderboards">
      <Card>
        <h3>Most Wickets</h3>
        <StatsTable data={bowling.sort((a, b) => b.wickets - a.wickets).slice(0, 10)} getPlayerId={(r) => r.playerId} columns={[
          { key: "wkts", header: "Wkts", render: (r) => r.wickets },
          { key: "econ", header: "Econ", render: (r) => r.economy },
          { key: "avg", header: "Avg", render: (r) => r.average },
          { key: "best", header: "Best", render: (r) => r.bestFigures },
        ]} />
      </Card>
      <Card>
        <h3>Best Economy</h3>
        <StatsTable data={bowling.filter((r) => r.overs >= 2).sort((a, b) => a.economy - b.economy).slice(0, 10)} getPlayerId={(r) => r.playerId} columns={[
          { key: "econ", header: "Econ", render: (r) => r.economy },
          { key: "overs", header: "Overs", render: (r) => r.overs },
          { key: "runs", header: "Runs", render: (r) => r.runs },
        ]} />
      </Card>
      <Card>
        <h3>Best Bowling</h3>
        <StatsTable data={bowling.sort((a, b) => {
          const aw = a.wickets;
          const bw = b.wickets;
          if (bw !== aw) return bw - aw;
          return a.runs - b.runs;
        }).slice(0, 10)} getPlayerId={(r) => r.playerId} columns={[
          { key: "best", header: "Figures", render: (r) => r.bestFigures },
          { key: "wkts", header: "Wkts", render: (r) => r.wickets },
          { key: "econ", header: "Econ", render: (r) => r.economy },
        ]} />
      </Card>
    </div>
  );
}

function FieldingLeaderboards({ fielding }: { fielding: PlayerFieldingStats[] }) {
  if (fielding.length === 0) return <Empty message="No fielding stats available." />;
  return (
    <Card>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell header>Rank</TableCell>
            <TableCell header>Player</TableCell>
            <TableCell header>Team</TableCell>
            <TableCell header>Catches</TableCell>
            <TableCell header>Run Outs</TableCell>
            <TableCell header>Stumpings</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fielding.sort((a, b) => (b.catches + b.runOuts + b.stumpings) - (a.catches + a.runOuts + a.stumpings)).map((f, idx) => {
            const player = getPlayerById(f.playerId);
            const team = player ? getTeamById(player.teamId) : undefined;
            return (
              <TableRow key={f.playerId}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{player?.name}</TableCell>
                <TableCell>
                  <div className="table-team">
                    <TeamLogo name={team?.name ?? ""} size={28} />
                    <span>{team?.shortName}</span>
                  </div>
                </TableCell>
                <TableCell>{f.catches}</TableCell>
                <TableCell>{f.runOuts}</TableCell>
                <TableCell>{f.stumpings}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
