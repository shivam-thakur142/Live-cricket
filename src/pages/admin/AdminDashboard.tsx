import { useEffect, useState } from "react";
import { Trophy, Users, CalendarDays, Activity } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import * as api from "@/services/api";
import type { Activity as ActivityType } from "@/types";

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ tournaments: 0, active: 0, teams: 0, players: 0, matches: 0, live: 0 });
  const [activities, setActivities] = useState<ActivityType[]>([]);

  useEffect(() => {
    Promise.all([
      api.getTournaments(),
      api.getTeams(),
      api.getPlayers(),
      api.getMatches(),
      api.getActivities(),
    ]).then(([tournaments, teams, players, matches, acts]) => {
      setCounts({
        tournaments: tournaments.length,
        active: tournaments.filter((t) => t.status === "ongoing").length,
        teams: teams.length,
        players: players.length,
        matches: matches.length,
        live: matches.filter((m) => m.status === "live").length,
      });
      setActivities(acts);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <h1>Dashboard</h1>
      <p className="page-subtitle">Overview of the SCL platform.</p>
      <div className="admin-stats-grid">
        <StatCard icon={Trophy} label="Total Tournaments" value={counts.tournaments} />
        <StatCard icon={Activity} label="Active Tournaments" value={counts.active} />
        <StatCard icon={Users} label="Teams" value={counts.teams} />
        <StatCard icon={Users} label="Players" value={counts.players} />
        <StatCard icon={CalendarDays} label="Matches" value={counts.matches} />
        <StatCard icon={Activity} label="Live Matches" value={counts.live} />
      </div>

      <div className="admin-section">
        <h2>Recent Activity</h2>
        <Card>
          {activities.length === 0 ? (
            <p>No recent activity.</p>
          ) : (
            <ul className="activity-list">
              {activities.map((a) => (
                <li key={a.id}>
                  <span>{a.description}</span>
                  <small>{new Date(a.timestamp).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: number }) {
  return (
    <Card className="admin-stat-card">
      <Icon size={28} />
      <div>
        <p className="stat-card-value">{value}</p>
        <p className="stat-card-label">{label}</p>
      </div>
    </Card>
  );
}
