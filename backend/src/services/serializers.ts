import type { Activity, GalleryItem, NewsArticle, Player, Setting, Team, Tournament, User, Venue } from "@prisma/client";

/**
 * Serializers map Prisma rows to the exact shapes the existing frontend
 * expects (see src/types/index.ts on the frontend). Optional fields are
 * omitted when null so the frontend's `??` fallbacks behave as designed.
 */

type Json = Record<string, unknown>;

/** Recursively removes null values (frontend optionals are `field?: T`, not `field: T | null`). */
export function stripNulls<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => stripNulls(v)) as T;
  }
  if (value !== null && typeof value === "object" && !(value instanceof Date)) {
    const out: Json = {};
    for (const [k, v] of Object.entries(value as Json)) {
      if (v !== null) out[k] = stripNulls(v);
    }
    return out as T;
  }
  return value;
}

export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function serializeTournament(t: Tournament) {
  return stripNulls({
    id: t.id,
    name: t.name,
    shortName: t.shortName,
    season: t.season,
    format: t.format,
    overs: t.overs,
    location: t.location,
    startDate: toDateString(t.startDate),
    endDate: toDateString(t.endDate),
    status: t.status,
    description: t.description,
    logoUrl: t.logoUrl,
    currentStage: t.currentStage,
    pointsWin: t.pointsWin,
    pointsNoResult: t.pointsNoResult,
  });
}

export function serializeTeam(t: Team) {
  return stripNulls({
    id: t.id,
    name: t.name,
    shortName: t.shortName,
    logoUrl: t.logoUrl,
    captainId: t.captainId,
    captainName: t.captainName,
    coach: t.coach,
    foundedYear: t.foundedYear,
  });
}

export function serializePlayer(p: Player) {
  return stripNulls({
    id: p.id,
    name: p.name,
    photoUrl: p.photoUrl,
    teamId: p.teamId,
    role: p.role,
    jerseyNumber: p.jerseyNumber,
    battingStyle: p.battingStyle,
    bowlingStyle: p.bowlingStyle,
  });
}

export function serializeVenue(v: Venue & { _count?: { matches: number } }) {
  return stripNulls({
    id: v.id,
    name: v.name,
    location: v.location,
    address: v.address,
    capacity: v.capacity,
    pitchInfo: v.pitchInfo,
    matchesHosted: v._count?.matches ?? 0,
    imageUrl: v.imageUrl,
  });
}

/** Never includes passwordHash. */
export function serializeUser(u: User) {
  return stripNulls({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatarUrl: u.avatarUrl,
  });
}

export function serializeActivity(a: Activity) {
  return stripNulls({
    id: a.id,
    type: a.type,
    description: a.description,
    timestamp: a.createdAt.toISOString(),
    user: a.userName,
  });
}

export function serializeNews(n: NewsArticle) {
  return stripNulls({
    id: n.id,
    title: n.title,
    category: n.category,
    date: toDateString(n.date),
    tournamentId: n.tournamentId,
    imageUrl: n.imageUrl,
    excerpt: n.excerpt,
    content: n.content,
    author: n.author,
  });
}

export function serializeGallery(g: GalleryItem) {
  return stripNulls({
    id: g.id,
    title: g.title,
    category: g.category,
    imageUrl: g.imageUrl,
    tournamentId: g.tournamentId,
  });
}

export function settingsToObject(rows: Setting[]) {
  const out: Record<string, string> = {};
  for (const row of rows) out[row.key] = row.value;
  return out;
}
