import * as localStore from "@/data/store";
import {
  computeBattingStats,
  computeBowlingStats,
  computePointsTable,
} from "@/utils/helpers";
import type {
  Activity,
  GalleryItem,
  Match,
  NewsArticle,
  Player,
  PlayerBattingStats,
  PlayerBowlingStats,
  PlayerFieldingStats,
  PointsTableEntry,
  Team,
  Tournament,
  TournamentRecord,
  TournamentTeam,
  User,
  Venue,
} from "@/types";

const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
    ? "https://live-cricket-1.onrender.com/api"
    : "http://localhost:4000/api");
const API_BASE = RAW_API_URL.replace(/\/+$/, "");
const TOKEN_KEY = "scl_token";
const USER_KEY = "scl_user";

const DEFAULT_ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "admin@scl.local";
const DEFAULT_ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "Admin@123";

// --- Auth Utilities ---

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function login(
  email: string = DEFAULT_ADMIN_EMAIL,
  password: string = DEFAULT_ADMIN_PASSWORD
): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || "Login failed");
  }
  setAuth(json.data.token, json.data.user);
  return json.data;
}

export async function ensureAdminToken(): Promise<string> {
  const existing = getStoredToken();
  return existing || "";
}

// --- Generic Request Helper with Fallback ---

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  fallback: () => T | Promise<T>
): Promise<T> {
  try {
    let token = getStoredToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // If making a mutation, ensure we have an admin/editor token
    if (options.method && options.method !== "GET" && !token) {
      token = await ensureAdminToken();
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // If 401 returned (e.g. token expired), attempt one re-authentication retry
    if (res.status === 401) {
      clearAuth();
      const newToken = await ensureAdminToken();
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
        res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
      }
    }

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.warn(`[API] ${options.method || "GET"} ${endpoint} responded with ${res.status}: ${errBody}`);
      return await fallback();
    }

    const json = await res.json();
    return json.data !== undefined ? json.data : await fallback();
  } catch (err) {
    console.warn(`[API] Network error calling ${endpoint}, using local fallback:`, err);
    return await fallback();
  }
}

// --- Query Functions ---

export async function getTournaments(): Promise<Tournament[]> {
  return apiFetch("/tournaments", {}, () => localStore.tournaments);
}

export async function getTournamentById(id: string): Promise<Tournament | undefined> {
  return apiFetch(`/tournaments/${id}`, {}, () =>
    localStore.tournaments.find((t) => t.id === id)
  );
}

export async function getTeams(): Promise<Team[]> {
  return apiFetch("/teams", {}, () => localStore.teams);
}

export async function getTeamById(id: string): Promise<Team | undefined> {
  return apiFetch(`/teams/${id}`, {}, () =>
    localStore.teams.find((t) => t.id === id)
  );
}

export async function getPlayers(): Promise<Player[]> {
  return apiFetch("/players", {}, () => localStore.players);
}

export async function getPlayerById(id: string): Promise<Player | undefined> {
  return apiFetch(`/players/${id}`, {}, () =>
    localStore.players.find((p) => p.id === id)
  );
}

export async function getPlayersByTeam(teamId: string): Promise<Player[]> {
  return apiFetch(`/teams/${teamId}/players`, {}, () =>
    localStore.players.filter((p) => p.teamId === teamId)
  );
}

export async function getVenues(): Promise<Venue[]> {
  return apiFetch("/venues", {}, () => localStore.venues);
}

export async function getVenueById(id: string): Promise<Venue | undefined> {
  return apiFetch(`/venues/${id}`, {}, () =>
    localStore.venues.find((v) => v.id === id)
  );
}

export async function getMatches(): Promise<Match[]> {
  return apiFetch("/matches", {}, () => localStore.matches);
}

export async function getMatchById(id: string): Promise<Match | undefined> {
  return apiFetch(`/matches/${id}`, {}, () =>
    localStore.matches.find((m) => m.id === id)
  );
}

export async function getMatchesByTournament(tournamentId: string): Promise<Match[]> {
  return apiFetch(`/matches?tournamentId=${encodeURIComponent(tournamentId)}`, {}, () =>
    localStore.matches.filter((m) => m.tournamentId === tournamentId)
  );
}

export async function getNews(): Promise<NewsArticle[]> {
  return apiFetch("/news", {}, () => localStore.news);
}

export async function getNewsById(id: string): Promise<NewsArticle | undefined> {
  return apiFetch(`/news/${id}`, {}, () =>
    localStore.news.find((n) => n.id === id)
  );
}

export async function getGallery(): Promise<GalleryItem[]> {
  return apiFetch("/gallery", {}, () => localStore.gallery);
}

export async function getUsers(): Promise<User[]> {
  return apiFetch("/users", {}, () => localStore.users);
}

export async function getActivities(): Promise<Activity[]> {
  return apiFetch("/activities", {}, () => localStore.activities);
}

export async function getPointsTable(tournamentId: string): Promise<PointsTableEntry[]> {
  return computePointsTable(tournamentId, localStore.tournamentTeams);
}

export async function getBattingStats(tournamentId?: string): Promise<PlayerBattingStats[]> {
  return computeBattingStats(tournamentId);
}

export async function getBowlingStats(tournamentId?: string): Promise<PlayerBowlingStats[]> {
  return computeBowlingStats(tournamentId);
}

export async function getFieldingStats(tournamentId?: string): Promise<PlayerFieldingStats[]> {
  if (!tournamentId) return localStore.fieldingStats;
  return localStore.fieldingStats.filter((f) => f.tournamentId === tournamentId);
}

export async function getRecords(tournamentId?: string): Promise<TournamentRecord[]> {
  if (!tournamentId) return localStore.tournamentRecords;
  return localStore.tournamentRecords.filter((r) => r.tournamentId === tournamentId);
}

// --- Admin Mutations ---

export async function addTournament(data: Omit<Tournament, "id">): Promise<Tournament> {
  return apiFetch(
    "/tournaments",
    { method: "POST", body: JSON.stringify(data) },
    () => {
      const id = `t-${localStore.tournaments.length + 1}`;
      const tournament: Tournament = { ...data, id };
      localStore.tournaments.push(tournament);
      return tournament;
    }
  );
}

export async function updateTournament(
  id: string,
  data: Partial<Tournament>
): Promise<Tournament | undefined> {
  return apiFetch(
    `/tournaments/${id}`,
    { method: "PATCH", body: JSON.stringify(data) },
    () => {
      const idx = localStore.tournaments.findIndex((t) => t.id === id);
      if (idx === -1) return undefined;
      localStore.tournaments[idx] = { ...localStore.tournaments[idx], ...data };
      return localStore.tournaments[idx];
    }
  );
}

export async function deleteTournament(id: string): Promise<boolean> {
  return apiFetch(
    `/tournaments/${id}`,
    { method: "DELETE" },
    () => {
      const idx = localStore.tournaments.findIndex((t) => t.id === id);
      if (idx === -1) return false;
      localStore.tournaments.splice(idx, 1);
      return true;
    }
  );
}

export async function addTeam(data: Omit<Team, "id">): Promise<Team> {
  return apiFetch(
    "/teams",
    { method: "POST", body: JSON.stringify(data) },
    () => {
      const id = `team-${localStore.teams.length + 1}`;
      const team: Team = { ...data, id };
      localStore.teams.push(team);
      return team;
    }
  );
}

export async function updateTeam(id: string, data: Partial<Team>): Promise<Team | undefined> {
  return apiFetch(
    `/teams/${id}`,
    { method: "PATCH", body: JSON.stringify(data) },
    () => {
      const idx = localStore.teams.findIndex((t) => t.id === id);
      if (idx === -1) return undefined;
      localStore.teams[idx] = { ...localStore.teams[idx], ...data };
      return localStore.teams[idx];
    }
  );
}

export async function deleteTeam(id: string): Promise<boolean> {
  return apiFetch(
    `/teams/${id}`,
    { method: "DELETE" },
    () => {
      const idx = localStore.teams.findIndex((t) => t.id === id);
      if (idx === -1) return false;
      localStore.teams.splice(idx, 1);
      return true;
    }
  );
}

export async function addPlayer(data: Omit<Player, "id">): Promise<Player> {
  return apiFetch(
    "/players",
    { method: "POST", body: JSON.stringify(data) },
    () => {
      const id = `p-${localStore.players.length + 1}`;
      const player: Player = { ...data, id };
      localStore.players.push(player);
      return player;
    }
  );
}

export async function updatePlayer(id: string, data: Partial<Player>): Promise<Player | undefined> {
  return apiFetch(
    `/players/${id}`,
    { method: "PATCH", body: JSON.stringify(data) },
    () => {
      const idx = localStore.players.findIndex((p) => p.id === id);
      if (idx === -1) return undefined;
      localStore.players[idx] = { ...localStore.players[idx], ...data };
      return localStore.players[idx];
    }
  );
}

export async function deletePlayer(id: string): Promise<boolean> {
  return apiFetch(
    `/players/${id}`,
    { method: "DELETE" },
    () => {
      const idx = localStore.players.findIndex((p) => p.id === id);
      if (idx === -1) return false;
      localStore.players.splice(idx, 1);
      return true;
    }
  );
}

export async function addMatch(data: Omit<Match, "id">): Promise<Match> {
  return apiFetch(
    "/matches",
    { method: "POST", body: JSON.stringify(data) },
    () => {
      const id = `m-${localStore.matches.length + 1}`;
      const match: Match = { ...data, id };
      localStore.matches.push(match);
      return match;
    }
  );
}

export async function updateMatch(id: string, data: Partial<Match>): Promise<Match | undefined> {
  return apiFetch(
    `/matches/${id}`,
    { method: "PATCH", body: JSON.stringify(data) },
    () => {
      const idx = localStore.matches.findIndex((m) => m.id === id);
      if (idx === -1) return undefined;
      localStore.matches[idx] = { ...localStore.matches[idx], ...data };
      return localStore.matches[idx];
    }
  );
}

export async function deleteMatch(id: string): Promise<boolean> {
  return apiFetch(
    `/matches/${id}`,
    { method: "DELETE" },
    () => {
      const idx = localStore.matches.findIndex((m) => m.id === id);
      if (idx === -1) return false;
      localStore.matches.splice(idx, 1);
      return true;
    }
  );
}

export async function addVenue(data: Omit<Venue, "id">): Promise<Venue> {
  return apiFetch(
    "/venues",
    { method: "POST", body: JSON.stringify(data) },
    () => {
      const id = `v-${localStore.venues.length + 1}`;
      const venue: Venue = { ...data, id };
      localStore.venues.push(venue);
      return venue;
    }
  );
}

export async function updateVenue(id: string, data: Partial<Venue>): Promise<Venue | undefined> {
  return apiFetch(
    `/venues/${id}`,
    { method: "PATCH", body: JSON.stringify(data) },
    () => {
      const idx = localStore.venues.findIndex((v) => v.id === id);
      if (idx === -1) return undefined;
      localStore.venues[idx] = { ...localStore.venues[idx], ...data };
      return localStore.venues[idx];
    }
  );
}

export async function deleteVenue(id: string): Promise<boolean> {
  return apiFetch(
    `/venues/${id}`,
    { method: "DELETE" },
    () => {
      const idx = localStore.venues.findIndex((v) => v.id === id);
      if (idx === -1) return false;
      localStore.venues.splice(idx, 1);
      return true;
    }
  );
}

export async function addNews(data: Omit<NewsArticle, "id">): Promise<NewsArticle> {
  return apiFetch(
    "/news",
    { method: "POST", body: JSON.stringify(data) },
    () => {
      const id = `news-${localStore.news.length + 1}`;
      const article: NewsArticle = { ...data, id };
      localStore.news.push(article);
      return article;
    }
  );
}

export async function updateNews(
  id: string,
  data: Partial<NewsArticle>
): Promise<NewsArticle | undefined> {
  return apiFetch(
    `/news/${id}`,
    { method: "PATCH", body: JSON.stringify(data) },
    () => {
      const idx = localStore.news.findIndex((n) => n.id === id);
      if (idx === -1) return undefined;
      localStore.news[idx] = { ...localStore.news[idx], ...data };
      return localStore.news[idx];
    }
  );
}

export async function deleteNews(id: string): Promise<boolean> {
  return apiFetch(
    `/news/${id}`,
    { method: "DELETE" },
    () => {
      const idx = localStore.news.findIndex((n) => n.id === id);
      if (idx === -1) return false;
      localStore.news.splice(idx, 1);
      return true;
    }
  );
}

export async function addGalleryItem(data: Omit<GalleryItem, "id">): Promise<GalleryItem> {
  return apiFetch(
    "/gallery",
    { method: "POST", body: JSON.stringify(data) },
    () => {
      const id = `g-${localStore.gallery.length + 1}`;
      const item: GalleryItem = { ...data, id };
      localStore.gallery.push(item);
      return item;
    }
  );
}

export async function deleteGalleryItem(id: string): Promise<boolean> {
  return apiFetch(
    `/gallery/${id}`,
    { method: "DELETE" },
    () => {
      const idx = localStore.gallery.findIndex((g) => g.id === id);
      if (idx === -1) return false;
      localStore.gallery.splice(idx, 1);
      return true;
    }
  );
}

export async function addTournamentTeam(
  data: Omit<TournamentTeam, "id">
): Promise<TournamentTeam> {
  return apiFetch(
    `/tournaments/${data.tournamentId}/teams/${data.teamId}`,
    { method: "POST" },
    () => {
      const id = `tt-${localStore.tournamentTeams.length + 1}`;
      const entry: TournamentTeam = { ...data, id };
      localStore.tournamentTeams.push(entry);
      return entry;
    }
  );
}
