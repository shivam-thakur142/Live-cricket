import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { TeamLogo } from "./TeamLogo";
import { LiveIndicator } from "./LiveIndicator";
import { formatDate, formatTime, getTeamById, getVenueById, statusLabel } from "@/utils/helpers";
import type { Match } from "@/types";

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
  const team1 = getTeamById(match.team1Id);
  const team2 = getTeamById(match.team2Id);
  const venue = getVenueById(match.venueId);

  const innings1 = match.innings?.[0];
  const innings2 = match.innings?.[1];

  return (
    <Card className="match-card" padding="md">
      <div className="match-card-header">
        <div className="match-meta">
          {match.status === "live" && <LiveIndicator />}
          {match.status !== "live" && (
            <Badge variant={match.status === "completed" ? "default" : "info"}>
              {statusLabel(match.status)}
            </Badge>
          )}
          <span className="match-stage">{match.stage}</span>
          <span className="match-number">Match {match.matchNumber}</span>
        </div>
        <div className="match-date">
          {formatDate(match.date)} &middot; {formatTime(match.time)}
        </div>
      </div>

      <div className="match-card-teams">
        <div className="match-team">
          <TeamLogo name={team1?.name ?? ""} size={48} />
          <div className="match-team-info">
            <span className="match-team-name">{team1?.name}</span>
            {innings1 && (
              <span className="match-team-score">
                {innings1.runs}/{innings1.wickets} ({formatOvers(innings1.overs)})
              </span>
            )}
          </div>
        </div>
        <span className="match-vs">VS</span>
        <div className="match-team">
          <TeamLogo name={team2?.name ?? ""} size={48} />
          <div className="match-team-info">
            <span className="match-team-name">{team2?.name}</span>
            {innings2 && (
              <span className="match-team-score">
                {innings2.runs}/{innings2.wickets} ({formatOvers(innings2.overs)})
              </span>
            )}
            {match.status === "live" && match.target && (
              <span className="match-target">Target {match.target}</span>
            )}
          </div>
        </div>
      </div>

      <div className="match-card-footer">
        <span>{venue?.name}</span>
        {match.resultText && <span className="match-result">{match.resultText}</span>}
      </div>

      <Link to={`/matches/${match.id}`} className="match-card-link">
        View details
      </Link>
    </Card>
  );
}

function formatOvers(overs: number) {
  const full = Math.floor(overs);
  const balls = Math.round((overs - full) * 10);
  return `${full}.${balls}`;
}
