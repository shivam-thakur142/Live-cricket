import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { Empty } from "@/components/ui/Empty";
import { LiveIndicator } from "@/components/shared/LiveIndicator";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { getTeamById, getVenueById } from "@/utils/helpers";
import * as api from "@/services/api";
import type { Match } from "@/types";

export function LiveMatches() {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    api.getMatches().then((data) => {
      setMatches(data);
      setLoading(false);
    });
  }, []);

  const liveMatch = useMemo(() => matches.find((m) => m.status === "live"), [matches]);

  if (loading) return <Loading />;

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Live Matches</h1>
        <p>Real-time scoring from ongoing matches.</p>
      </div>
      {liveMatch ? <LiveViewer match={liveMatch} /> : <Empty message="No live matches right now. Check upcoming fixtures below." />}
      {!liveMatch && (
        <div className="live-upcoming">
          <h2>Upcoming Matches</h2>
          <div className="grid grid-3">
            {matches.filter((m) => m.status === "upcoming").slice(0, 3).map((m) => (
              <Card key={m.id} className="mini-match-card">
                <p>Match {m.matchNumber} &middot; {m.stage}</p>
                <p>{getTeamById(m.team1Id)?.name} vs {getTeamById(m.team2Id)?.name}</p>
                <Link to={`/matches/${m.id}`}>View match</Link>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LiveViewer({ match }: { match: Match }) {
  const team1 = getTeamById(match.team1Id);
  const team2 = getTeamById(match.team2Id);
  const venue = getVenueById(match.venueId);
  const innings1 = match.innings?.[0];
  const innings2 = match.innings?.[1];
  const battingInnings = innings2 ?? innings1;
  const battingTeam = battingInnings ? getTeamById(battingInnings.teamId) : undefined;

  const crr = useMemo(() => {
    if (!battingInnings) return 0;
    const balls = oversToBalls(battingInnings.overs);
    return balls > 0 ? Number(((battingInnings.runs / balls) * 6).toFixed(2)) : 0;
  }, [battingInnings]);

  const rrr = useMemo(() => {
    if (!battingInnings || !match.target) return 0;
    const totalBalls = battingInnings.totalOvers * 6;
    const bowled = oversToBalls(battingInnings.overs);
    const remaining = totalBalls - bowled;
    const needed = match.target - battingInnings.runs;
    return remaining > 0 ? Number(((needed / remaining) * 6).toFixed(2)) : 0;
  }, [battingInnings, match.target]);

  const currentOver = useMemo(() => {
    if (!match.recentBalls) return [];
    const lastOver = Math.max(...match.recentBalls.map((b) => b.over));
    return match.recentBalls.filter((b) => b.over === lastOver);
  }, [match.recentBalls]);

  return (
    <div className="live-viewer">
      <Card className="live-viewer-header">
        <div className="live-viewer-title">
          <LiveIndicator />
          <div>
            <h2>{team1?.name} vs {team2?.name}</h2>
            <p>Match {match.matchNumber} &middot; {match.stage} &middot; {venue?.name}</p>
          </div>
        </div>
      </Card>

      <Card className="live-scoreboard-large">
        <div className="live-score-main">
          <div className="live-score-team">
            <TeamLogo name={battingTeam?.name ?? ""} size={80} />
            <div>
              <h3>{battingTeam?.shortName}</h3>
              {battingInnings && (
                <p className="live-score-runs">{battingInnings.runs}/{battingInnings.wickets}</p>
              )}
              {battingInnings && (
                <p className="live-score-overs">{formatOvers(battingInnings.overs)} overs</p>
              )}
            </div>
          </div>
          <div className="live-score-info">
            {match.target && <p className="live-target">Target {match.target}</p>}
            <p>CRR {crr}</p>
            <p>RRR {rrr}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-2">
        <Card>
          <h3>Current Batters</h3>
          <div className="live-batters">
            <div className="live-batter">
              <span className="live-bat-marker">*</span>
              <span>{match.strikerName}</span>
            </div>
            <div className="live-batter">
              <span>{match.nonStrikerName}</span>
            </div>
          </div>
          <h4>Current Bowler</h4>
          <p>{match.bowlerName}</p>
        </Card>

        <Card>
          <h3>Recent Balls</h3>
          <div className="live-balls">
            {match.recentBalls?.slice(-6).map((ball, idx) => (
              <span key={idx} className={`live-ball ${ball.isWicket ? "wicket" : ball.runs === 4 || ball.runs === 6 ? "boundary" : ""}`}>
                {ball.isWicket ? "W" : ball.runs}
              </span>
            ))}
          </div>
          <h4>This Over</h4>
          <div className="live-balls">
            {currentOver.map((ball, idx) => (
              <span key={idx} className={`live-ball ${ball.isWicket ? "wicket" : ball.runs === 4 || ball.runs === 6 ? "boundary" : ""}`}>
                {ball.isWicket ? "W" : ball.runs}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <h3>Current Partnership</h3>
          {match.currentPartnership ? (
            <p className="live-partnership">
              {match.currentPartnership.runs} runs ({match.currentPartnership.balls} balls)
              <br />
              <small>{match.currentPartnership.batsman1Name} & {match.currentPartnership.batsman2Name}</small>
            </p>
          ) : (
            <Empty message="No partnership data." />
          )}
        </Card>

        <Card>
          <h3>Fall of Wickets</h3>
          {match.fallOfWickets && match.fallOfWickets.length > 0 ? (
            <div className="fall-wickets">
              {match.fallOfWickets.map((fw) => (
                <span key={fw.wicket}>{fw.wicket}-{fw.runs} ({formatOvers(fw.over)} ov)</span>
              ))}
            </div>
          ) : (
            <Empty message="No wickets yet." />
          )}
        </Card>
      </div>

      <div className="live-full-link">
        <Link to={`/matches/${match.id}`} className="card-link">Open full match centre</Link>
      </div>
    </div>
  );
}

function oversToBalls(overs: number) {
  const full = Math.floor(overs);
  const balls = Math.round((overs - full) * 10);
  return full * 6 + balls;
}

function formatOvers(overs: number) {
  const full = Math.floor(overs);
  const balls = Math.round((overs - full) * 10);
  return `${full}.${balls}`;
}
