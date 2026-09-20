import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { ballsToDecimalOvers } from "../utils/overs.js";
import { stripNulls, toDateString } from "./serializers.js";

/**
 * Builds the exact `Match` shape the frontend expects (src/types/index.ts),
 * including nested innings scorecards and live-match derived data
 * (recent balls, current partnership, fall of wickets, commentary).
 */

export const matchInclude = {
  innings: {
    orderBy: { inningsNumber: "asc" as const },
    include: {
      batting: { orderBy: { battingOrder: "asc" as const }, include: { player: true } },
      bowling: { include: { player: true } },
      ballEvents: { orderBy: { sequence: "asc" as const } },
    },
  },
  commentary: { orderBy: { createdAt: "desc" as const }, take: 50 },
  striker: true,
  nonStriker: true,
  bowler: true,
} satisfies Prisma.MatchInclude;

export type MatchWithIncludes = Prisma.MatchGetPayload<{ include: typeof matchInclude }>;

type BallEventRow = MatchWithIncludes["innings"][number]["ballEvents"][number];

function totalRunsOf(e: BallEventRow): number {
  return e.runs + e.byeRuns + e.legByeRuns + (e.isWide ? 1 : 0) + (e.isNoBall ? 1 : 0);
}

function isLegal(e: BallEventRow): boolean {
  return !e.isWide && !e.isNoBall;
}

function serializeInnings(inn: MatchWithIncludes["innings"][number]) {
  return {
    teamId: inn.battingTeamId,
    runs: inn.runs,
    wickets: inn.wickets,
    overs: ballsToDecimalOvers(inn.balls),
    totalOvers: inn.totalOvers,
    batting: inn.batting.map((b) => ({
      playerId: b.playerId,
      playerName: b.player.name,
      runs: b.runs,
      balls: b.balls,
      fours: b.fours,
      sixes: b.sixes,
      strikeRate: b.balls > 0 ? Number(((b.runs / b.balls) * 100).toFixed(2)) : 0,
      dismissal: b.dismissalText ?? "not out",
    })),
    bowling: inn.bowling.map((b) => ({
      playerId: b.playerId,
      playerName: b.player.name,
      overs: ballsToDecimalOvers(b.balls),
      maidens: b.maidens,
      runs: b.runsConceded,
      wickets: b.wickets,
      economy: b.balls > 0 ? Number((b.runsConceded / (b.balls / 6)).toFixed(2)) : 0,
    })),
    extras: {
      wides: inn.wides,
      noBalls: inn.noBalls,
      byes: inn.byes,
      legByes: inn.legByes,
      total: inn.wides + inn.noBalls + inn.byes + inn.legByes,
    },
  };
}

function serializeBall(e: BallEventRow) {
  return stripNulls({
    over: e.overNumber,
    ball: e.ballInOver,
    runs: e.runs,
    isWicket: e.isWicket,
    wicketText: e.isWicket ? (e.wicketType ?? "out") : undefined,
    isWide: e.isWide,
    isNoBall: e.isNoBall,
  });
}

/** Fall of wickets derived from wicket ball events, with cumulative score/over. */
function deriveFallOfWickets(events: BallEventRow[], playerNames: Map<string, string>) {
  const result: { wicket: number; runs: number; over: number; playerName: string }[] = [];
  let runs = 0;
  let legal = 0;
  for (const e of events) {
    runs += totalRunsOf(e);
    if (isLegal(e)) legal++;
    if (e.isWicket) {
      result.push({
        wicket: result.length + 1,
        runs,
        over: ballsToDecimalOvers(legal),
        playerName: e.dismissedPlayerId ? (playerNames.get(e.dismissedPlayerId) ?? "Unknown") : "Unknown",
      });
    }
  }
  return result;
}

/** Current partnership derived from ball events since the last wicket. */
function derivePartnership(
  events: BallEventRow[],
  strikerId: string | null,
  strikerName: string | undefined,
  nonStrikerId: string | null,
  nonStrikerName: string | undefined
) {
  if (events.length === 0 || !strikerId || !nonStrikerId) return undefined;
  let lastWicketIdx = -1;
  events.forEach((e, i) => {
    if (e.isWicket) lastWicketIdx = i;
  });
  const since = events.slice(lastWicketIdx + 1);
  if (since.length === 0) return undefined;
  return {
    runs: since.reduce((s, e) => s + totalRunsOf(e), 0),
    balls: since.filter(isLegal).length,
    batsman1Id: strikerId,
    batsman1Name: strikerName ?? "",
    batsman2Id: nonStrikerId,
    batsman2Name: nonStrikerName ?? "",
  };
}

export function serializeMatch(match: MatchWithIncludes, playerNames?: Map<string, string>) {
  const currentInnings = match.innings.find((i) => i.inningsNumber === match.currentInnings);
  const currentEvents = currentInnings?.ballEvents ?? [];

  return stripNulls({
    id: match.id,
    tournamentId: match.tournamentId,
    matchNumber: match.matchNumber,
    stage: match.stage,
    date: toDateString(match.date),
    time: match.time,
    venueId: match.venueId,
    team1Id: match.team1Id,
    team2Id: match.team2Id,
    status: match.status,
    tossWinnerId: match.tossWinnerId,
    electedTo: match.electedTo,
    resultText: match.resultText || undefined,
    winnerTeamId: match.winnerTeamId,
    playerOfMatchId: match.playerOfMatchId,
    target: match.target,
    innings: match.innings.length > 0 ? match.innings.map(serializeInnings) : undefined,
    recentBalls: currentEvents.length > 0 ? currentEvents.slice(-12).map(serializeBall) : undefined,
    strikerId: match.strikerId,
    strikerName: match.striker?.name,
    nonStrikerId: match.nonStrikerId,
    nonStrikerName: match.nonStriker?.name,
    bowlerId: match.bowlerId,
    bowlerName: match.bowler?.name,
    currentPartnership: derivePartnership(
      currentEvents,
      match.strikerId,
      match.striker?.name,
      match.nonStrikerId,
      match.nonStriker?.name
    ),
    fallOfWickets:
      currentEvents.length > 0 && playerNames ? deriveFallOfWickets(currentEvents, playerNames) : undefined,
    commentary:
      match.commentary.length > 0
        ? match.commentary.map((c) => ({
            id: c.id,
            over: c.over,
            ball: c.ball,
            type: c.type,
            text: c.text,
            runs: c.runs ?? undefined,
          }))
        : undefined,
  });
}

/** Fetches a match with all includes and serializes it. Returns null when missing. */
export async function getSerializedMatch(id: string) {
  const match = await prisma.match.findUnique({ where: { id }, include: matchInclude });
  if (!match) return null;
  const players = await prisma.player.findMany({ select: { id: true, name: true } });
  const names = new Map(players.map((p) => [p.id, p.name]));
  return serializeMatch(match, names);
}
