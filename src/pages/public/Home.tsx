import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Calendar, TrendingUp, Newspaper, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { Empty } from "@/components/ui/Empty";
import { LiveIndicator } from "@/components/shared/LiveIndicator";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { PointsTableView } from "@/components/shared/PointsTableView";
import {
  formatDate,
  formatTime,
  getPlayerById,
  getTeamById,
  statusLabel,
} from "@/utils/helpers";
import * as api from "@/services/api";
import type { Match, NewsArticle, PlayerBattingStats, PlayerBowlingStats, PointsTableEntry, Tournament } from "@/types";

export function Home() {
  const [loading, setLoading] = useState(true);
  const [featuredTournament, setFeaturedTournament] = useState<Tournament | undefined>();
  const [liveMatch, setLiveMatch] = useState<Match | undefined>();
  const [upcoming, setUpcoming] = useState<Match[]>([]);
  const [results, setResults] = useState<Match[]>([]);
  const [points, setPoints] = useState<PointsTableEntry[]>([]);
  const [topBatsman, setTopBatsman] = useState<PlayerBattingStats | undefined>();
  const [topBowler, setTopBowler] = useState<PlayerBowlingStats | undefined>();
  const [news, setNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    async function load() {
      const [tournaments, allMatches, pointsData, batting, bowling, newsData] = await Promise.all([
        api.getTournaments(),
        api.getMatches(),
        api.getPointsTable("scl-2026"),
        api.getBattingStats("scl-2026"),
        api.getBowlingStats("scl-2026"),
        api.getNews(),
      ]);
      setFeaturedTournament(tournaments.find((t) => t.id === "scl-2026") ?? tournaments[0]);
      setLiveMatch(allMatches.find((m) => m.status === "live"));
      setUpcoming(allMatches.filter((m) => m.status === "upcoming").slice(0, 3));
      setResults(allMatches.filter((m) => m.status === "completed").slice(0, 3));
      setPoints(pointsData.slice(0, 5));
      setTopBatsman(batting.sort((a, b) => b.runs - a.runs)[0]);
      setTopBowler(bowling.sort((a, b) => b.wickets - a.wickets)[0]);
      setNews(newsData.slice(0, 3));
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="home">
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-brand">
            <div className="hero-icon">
              <Trophy size={40} />
            </div>
            <div>
              <p className="hero-short">SCL</p>
              <h1 className="hero-title">Sirmour Cricket League</h1>
            </div>
          </div>
          <p className="hero-desc">
            The premier platform for local cricket tournaments in Sirmour district. Follow live
            scores, points tables, player stats, and tournament updates all in one place.
          </p>
          {featuredTournament && (
            <div className="hero-tournament">
              <span>Current tournament:</span>
              <strong>{featuredTournament.name}</strong>
              <span className="hero-stage">{featuredTournament.currentStage} Stage</span>
            </div>
          )}
          <div className="hero-actions">
            <Link to="/tournaments/scl-2026">
              <Button size="lg">View Tournament</Button>
            </Link>
            <Link to="/live-matches">
              <Button variant="outline" size="lg">Live Matches</Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container page-sections">
        {liveMatch && <LiveMatchSection match={liveMatch} />}

        <section className="section">
          <div className="section-header">
            <h2><Calendar size={22} /> Upcoming Matches</h2>
            <Link to="/matches" className="section-link">View all <ArrowRight size={16} /></Link>
          </div>
          {upcoming.length === 0 ? (
            <Empty message="No upcoming matches." />
          ) : (
            <div className="grid grid-3">
              {upcoming.map((match) => (
                <MiniMatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-header">
            <h2><Trophy size={22} /> Recent Results</h2>
            <Link to="/matches?filter=completed" className="section-link">View all <ArrowRight size={16} /></Link>
          </div>
          {results.length === 0 ? (
            <Empty message="No completed matches yet." />
          ) : (
            <div className="grid grid-3">
              {results.map((match) => (
                <MiniMatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </section>

        <div className="grid grid-2">
          <section className="section">
            <div className="section-header">
              <h2><TrendingUp size={22} /> Points Table</h2>
              <Link to="/points-table" className="section-link">Full table <ArrowRight size={16} /></Link>
            </div>
            <Card padding="none">
              <PointsTableView entries={points} compact />
            </Card>
          </section>

          <section className="section">
            <div className="section-header">
              <h2><TrendingUp size={22} /> Top Performers</h2>
            </div>
            <div className="grid grid-2">
              {topBatsman && <PerformerCard title="Top Run Scorer" playerId={topBatsman.playerId} value={`${topBatsman.runs} runs`} />}
              {topBowler && <PerformerCard title="Top Wicket Taker" playerId={topBowler.playerId} value={`${topBowler.wickets} wickets`} />}
            </div>
          </section>
        </div>

        <section className="section">
          <div className="section-header">
            <h2><Newspaper size={22} /> Latest News</h2>
            <Link to="/news" className="section-link">All news <ArrowRight size={16} /></Link>
          </div>
          <div className="grid grid-3">
            {news.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function LiveMatchSection({ match }: { match: Match }) {
  const team1 = getTeamById(match.team1Id);
  const team2 = getTeamById(match.team2Id);
  const innings1 = match.innings?.[0];
  const innings2 = match.innings?.[1];

  return (
    <section className="live-section">
      <div className="live-section-header">
        <LiveIndicator />
        <span className="live-label">Live Match</span>
      </div>
      <Card className="live-card" padding="lg">
        <div className="live-card-inner">
          <div className="live-team">
            <TeamLogo name={team1?.name ?? ""} size={64} />
            <div>
              <h3>{team1?.name}</h3>
              {innings1 && (
                <p className="live-score">
                  {innings1.runs}/{innings1.wickets} <span>({formatOvers(innings1.overs)})</span>
                </p>
              )}
            </div>
          </div>
          <div className="live-center">
            <span className="live-vs">VS</span>
            {match.target && <p className="live-target">Target {match.target}</p>}
            <Link to={`/matches/${match.id}`}>
              <Button>Watch Live</Button>
            </Link>
          </div>
          <div className="live-team">
            <TeamLogo name={team2?.name ?? ""} size={64} />
            <div>
              <h3>{team2?.name}</h3>
              {innings2 && (
                <p className="live-score">
                  {innings2.runs}/{innings2.wickets} <span>({formatOvers(innings2.overs)})</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}

function MiniMatchCard({ match }: { match: Match }) {
  const team1 = getTeamById(match.team1Id);
  const team2 = getTeamById(match.team2Id);
  const innings1 = match.innings?.[0];
  const innings2 = match.innings?.[1];
  return (
    <Card className="mini-match-card">
      <div className="mini-match-meta">
        <span>{statusLabel(match.status)}</span>
        <span>Match {match.matchNumber}</span>
      </div>
      <div className="mini-match-teams">
        <div className="mini-team">
          <TeamLogo name={team1?.name ?? ""} size={36} />
          <span>{team1?.shortName}</span>
          {innings1 && <strong>{innings1.runs}/{innings1.wickets}</strong>}
        </div>
        <span className="mini-vs">VS</span>
        <div className="mini-team">
          <TeamLogo name={team2?.name ?? ""} size={36} />
          <span>{team2?.shortName}</span>
          {innings2 && <strong>{innings2.runs}/{innings2.wickets}</strong>}
        </div>
      </div>
      <div className="mini-match-footer">
        {formatDate(match.date)} &middot; {formatTime(match.time)}
      </div>
      {match.resultText && <p className="mini-result">{match.resultText}</p>}
      <Link to={`/matches/${match.id}`} className="mini-link">Details</Link>
    </Card>
  );
}

function PerformerCard({ title, playerId, value }: { title: string; playerId: string; value: string }) {
  const player = getPlayerById(playerId);
  const team = player ? getTeamById(player.teamId) : undefined;
  return (
    <Card className="performer-card">
      <h4>{title}</h4>
      <div className="performer-player">
        <TeamLogo name={player?.name ?? ""} size={40} />
        <div>
          <p className="performer-name">{player?.name}</p>
          <p className="performer-team">{team?.name}</p>
        </div>
      </div>
      <p className="performer-value">{value}</p>
    </Card>
  );
}

function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <Card className="news-card">
      <span className="news-category">{article.category}</span>
      <h4>{article.title}</h4>
      <p className="news-excerpt">{article.excerpt}</p>
      <div className="news-footer">
        <span>{formatDate(article.date)}</span>
        <Link to={`/news/${article.id}`}>Read more</Link>
      </div>
    </Card>
  );
}

function formatOvers(overs: number) {
  const full = Math.floor(overs);
  const balls = Math.round((overs - full) * 10);
  return `${full}.${balls}`;
}
