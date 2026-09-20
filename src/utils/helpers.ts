import type { Player, PlayerBattingStats, PlayerBowlingStats, PointsTableEntry, Team, Tournament, TournamentTeam, Venue } from "@/types";
import { players, teams, venues, matches, tournaments } from "@/data/store";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m);
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export function formatOvers(overs: number) {
  const full = Math.floor(overs);
  const balls = Math.round((overs - full) * 10);
  return `${full}.${balls}`;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = Math.abs(hash % 360);
  return `hsl(${c} 65% 35%)`;
}

export function generateLogo(name: string) {
  const initials = getInitials(name);
  const color = stringToColor(name);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'>
    <rect width='128' height='128' fill='${color}'/>
    <text x='64' y='74' font-family='Arial, sans-serif' font-size='44' font-weight='bold' fill='white' text-anchor='middle'>${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getTeamById(id?: string): Team | undefined {
  return teams.find((t) => t.id === id);
}

export function getPlayerById(id?: string): Player | undefined {
  return players.find((p) => p.id === id);
}

export function getVenueById(id?: string): Venue | undefined {
  return venues.find((v) => v.id === id);
}

export function getTournamentById(id?: string): Tournament | undefined {
  return tournaments.find((t) => t.id === id);
}

export function statusLabel(status: string) {
  switch (status) {
    case "ongoing":
      return "Ongoing";
    case "completed":
      return "Completed";
    case "upcoming":
      return "Upcoming";
    case "registration_open":
      return "Registration Open";
    case "live":
      return "Live";
    default:
      return status;
  }
}

export function computeBattingStats(tournamentId?: string): PlayerBattingStats[] {
  const map = new Map<string, PlayerBattingStats>();
  const relevant = tournamentId ? matches.filter((m) => m.tournamentId === tournamentId) : matches;
  relevant.forEach((match) => {
    match.innings?.forEach((inn) => {
      inn.batting.forEach((entry) => {
        const key = `${tournamentId ?? "all"}-${entry.playerId}`;
        let stats = map.get(key);
        if (!stats) {
          const player = getPlayerById(entry.playerId);
          stats = {
            playerId: entry.playerId,
            tournamentId: tournamentId ?? match.tournamentId,
            matches: 0,
            innings: 0,
            notOuts: 0,
            runs: 0,
            balls: 0,
            highestScore: 0,
            highestScoreNotOut: false,
            average: 0,
            strikeRate: 0,
            fours: 0,
            sixes: 0,
            ducks: 0,
            fifties: 0,
            hundreds: 0,
          };
          if (player) stats.tournamentId = tournamentId ?? match.tournamentId;
          map.set(key, stats);
        }
        stats.innings += 1;
        stats.runs += entry.runs;
        stats.balls += entry.balls;
        stats.fours += entry.fours;
        stats.sixes += entry.sixes;
        const isNotOut = !entry.dismissal || entry.dismissal.toLowerCase().includes("not out");
        if (isNotOut) stats.notOuts += 1;
        if (entry.runs === 0) stats.ducks += 1;
        if (entry.runs >= 50 && entry.runs < 100) stats.fifties += 1;
        if (entry.runs >= 100) stats.hundreds += 1;
        const numericHS = entry.runs;
        if (
          numericHS > stats.highestScore ||
          (numericHS === stats.highestScore && isNotOut && !stats.highestScoreNotOut)
        ) {
          stats.highestScore = numericHS;
          stats.highestScoreNotOut = isNotOut;
        }
      });
    });
  });

  const matchCountByPlayer = new Map<string, Set<string>>();
  relevant.forEach((match) => {
    match.innings?.forEach((inn) => {
      inn.batting.forEach((entry) => {
        const key = `${tournamentId ?? "all"}-${entry.playerId}`;
        if (!matchCountByPlayer.has(key)) matchCountByPlayer.set(key, new Set());
        matchCountByPlayer.get(key)!.add(match.id);
      });
    });
  });

  const result: PlayerBattingStats[] = [];
  map.forEach((stats) => {
    const key = `${tournamentId ?? "all"}-${stats.playerId}`;
    stats.matches = matchCountByPlayer.get(key)?.size ?? 0;
    const dismissals = stats.innings - stats.notOuts;
    stats.average = dismissals > 0 ? Number((stats.runs / dismissals).toFixed(2)) : stats.runs;
    stats.strikeRate = stats.balls > 0 ? Number(((stats.runs / stats.balls) * 100).toFixed(2)) : 0;
    result.push(stats);
  });
  return result;
}

export function computeBowlingStats(tournamentId?: string): PlayerBowlingStats[] {
  const map = new Map<string, PlayerBowlingStats>();
  const relevant = tournamentId ? matches.filter((m) => m.tournamentId === tournamentId) : matches;
  relevant.forEach((match) => {
    match.innings?.forEach((inn) => {
      inn.bowling.forEach((entry) => {
        const key = `${tournamentId ?? "all"}-${entry.playerId}`;
        let stats = map.get(key);
        if (!stats) {
          stats = {
            playerId: entry.playerId,
            tournamentId: tournamentId ?? match.tournamentId,
            matches: 0,
            innings: 0,
            overs: 0,
            balls: 0,
            maidens: 0,
            runs: 0,
            wickets: 0,
            bestFigures: "0/0",
            economy: 0,
            average: 0,
            strikeRate: 0,
            fourWickets: 0,
            fiveWickets: 0,
          };
          map.set(key, stats);
        }
        stats.innings += 1;
        stats.overs += entry.overs;
        stats.maidens += entry.maidens;
        stats.runs += entry.runs;
        stats.wickets += entry.wickets;
        const full = Math.floor(entry.overs);
        const balls = Math.round((entry.overs - full) * 10);
        stats.balls += full * 6 + balls;
        if (entry.wickets >= 4) stats.fourWickets += 1;
        if (entry.wickets >= 5) stats.fiveWickets += 1;
        const figs = `${entry.wickets}/${entry.runs}`;
        const currentBestWkts = parseInt(stats.bestFigures.split("/")[0], 10) || 0;
        const currentBestRuns = parseInt(stats.bestFigures.split("/")[1], 10) || 0;
        if (
          entry.wickets > currentBestWkts ||
          (entry.wickets === currentBestWkts && entry.runs < currentBestRuns)
        ) {
          stats.bestFigures = figs;
        }
      });
    });
  });

  const matchCountByPlayer = new Map<string, Set<string>>();
  relevant.forEach((match) => {
    match.innings?.forEach((inn) => {
      inn.bowling.forEach((entry) => {
        const key = `${tournamentId ?? "all"}-${entry.playerId}`;
        if (!matchCountByPlayer.has(key)) matchCountByPlayer.set(key, new Set());
        matchCountByPlayer.get(key)!.add(match.id);
      });
    });
  });

  const result: PlayerBowlingStats[] = [];
  map.forEach((stats) => {
    const key = `${tournamentId ?? "all"}-${stats.playerId}`;
    stats.matches = matchCountByPlayer.get(key)?.size ?? 0;
    stats.economy = stats.overs > 0 ? Number((stats.runs / stats.overs).toFixed(2)) : 0;
    stats.average = stats.wickets > 0 ? Number((stats.runs / stats.wickets).toFixed(2)) : 0;
    stats.strikeRate = stats.wickets > 0 ? Number((stats.balls / stats.wickets).toFixed(2)) : 0;
    result.push(stats);
  });
  return result;
}

export function computePointsTable(tournamentId: string, entries: TournamentTeam[]): PointsTableEntry[] {
  const relevant = entries.filter((e) => e.tournamentId === tournamentId);
  return relevant
    .map((e) => ({
      tournamentId: e.tournamentId,
      position: 0,
      teamId: e.teamId,
      played: e.matchesPlayed,
      won: e.wins,
      lost: e.losses,
      nr: e.noResult,
      points: e.points,
      nrr: e.nrr,
    }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.nrr - a.nrr;
    })
    .map((e, i) => ({ ...e, position: i + 1 }));
}
