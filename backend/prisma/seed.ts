/**
 * SCL development seed.
 *
 * Mirrors the frontend's original mock dataset (Sirmour Cricket League 2026),
 * with the mock's internal inconsistencies repaired so that:
 *   sum(batting runs) + extras            = innings runs
 *   count(dismissed batters)              = innings wickets
 *   sum(bowling wickets) + run outs       = innings wickets
 *   sum(bowling runs) + byes + leg byes   = innings runs
 *   sum(bowling legal balls)              = innings legal balls
 *
 * IDs reuse the frontend's slug scheme ("scl-2026", "kala-amb-kings", "kak-1")
 * because the frontend hardcodes the "scl-2026" tournament id.
 *
 * Calculated data (points, NRR, stats, partnerships, FoW, records) is NOT
 * seeded — it is derived from the rows created here.
 *
 * Idempotent: wipes existing rows (data only, never the schema) and re-creates.
 */
import bcrypt from "bcryptjs";
import { prisma } from "../src/config/prisma.js";
import { env } from "../src/config/env.js";

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

const TEAMS = [
  { id: "kala-amb-kings", name: "Kala Amb Kings", shortName: "KAK", prefix: "kak", captainName: "Arjun Thakur", coach: "Rohit Verma", foundedYear: 2018 },
  { id: "nahan-warriors", name: "Nahan Warriors", shortName: "NAW", prefix: "naw", captainName: "Priyank Negi", coach: "Sanjay Rana", foundedYear: 2019 },
  { id: "paonta-strikers", name: "Paonta Strikers", shortName: "PAS", prefix: "pas", captainName: "Rahul Rana", coach: "Amit Kumar", foundedYear: 2017 },
  { id: "rajgarh-royals", name: "Rajgarh Royals", shortName: "RJR", prefix: "rjr", captainName: "Dev Thakur", coach: "Vikas Bhatt", foundedYear: 2020 },
  { id: "sirmour-super-kings", name: "Sirmour Super Kings", shortName: "SSK", prefix: "ssk", captainName: "Ajay Rana", coach: "Mohit Singh", foundedYear: 2016 },
  { id: "renuka-tigers", name: "Renuka Tigers", shortName: "RTR", prefix: "rtr", captainName: "Kamal Bisht", coach: "Deepak Rawat", foundedYear: 2021 },
] as const;

const SQUADS: Record<string, string[]> = {
  "kala-amb-kings": ["Arjun Thakur", "Rohit Sharma", "Vikram Singh", "Mohit Rana", "Karan Bhatt", "Siddharth Chauhan", "Deepak Kumar", "Aman Negi"],
  "nahan-warriors": ["Priyank Negi", "Harsh Rana", "Sachin Verma", "Ankit Rawat", "Nikhil Chauhan", "Gaurav Bisht", "Rajesh Panwar", "Mohan Bhatt"],
  "paonta-strikers": ["Rahul Rana", "Sumit Rawat", "Abhishek Chauhan", "Virendra Singh", "Tejas Bhatt", "Lokesh Panwar", "Nitin Rana", "Kunal Thakur"],
  "rajgarh-royals": ["Dev Thakur", "Aryan Rana", "Himanshu Bisht", "Shubham Chauhan", "Tarun Negi", "Yash Panwar", "Rishabh Rawat", "Manoj Kumar"],
  "sirmour-super-kings": ["Ajay Rana", "Vishal Thakur", "Pradeep Singh", "Neeraj Bhatt", "Saurabh Chauhan", "Lalit Panwar", "Jatin Rawat", "Harish Negi"],
  "renuka-tigers": ["Kamal Bisht", "Naveen Kumar", "Sandeep Rana", "Rohan Chauhan", "Akash Panwar", "Pankaj Thakur", "Varun Negi", "Mukesh Bhatt"],
};

const ROLE_DISTRIBUTION = ["Batsman", "Batsman", "Batsman", "Bowler", "Bowler", "All-rounder", "All-rounder", "Wicket-keeper"];
const BATTING_STYLES = ["Right-hand bat", "Left-hand bat"];
const BOWLING_STYLES = ["Right-arm medium", "Right-arm offbreak", "Left-arm orthodox", "Right-arm legbreak"];

const VENUES = [
  { id: "dharampur-stadium", name: "Dharampur Cricket Stadium", location: "Dharampur, Nahan", address: "Dharampur Road, Nahan, Sirmour, Himachal Pradesh 173001", capacity: 3500, pitchInfo: "Balanced pitch with good bounce; spinners get help in second innings." },
  { id: "paonta-sports-ground", name: "Paonta Sahib Sports Ground", location: "Paonta Sahib", address: "Near Yamuna River, Paonta Sahib, Himachal Pradesh 173025", capacity: 2200, pitchInfo: "Batting-friendly surface with short boundaries." },
  { id: "kala-amb-school-ground", name: "Kala Amb Public School Ground", location: "Kala Amb", address: "Public School Road, Kala Amb, Himachal Pradesh 173030", capacity: 1500, pitchInfo: "Slow, low-bounce track suited to spin bowling." },
  { id: "rajgarh-academy", name: "Rajgarh Cricket Academy Ground", location: "Rajgarh", address: "Rajgarh Cricket Academy, Rajgarh, Himachal Pradesh 173101", capacity: 1800, pitchInfo: "Seaming conditions early on; evens out under lights." },
];

const TOURNAMENTS = [
  { id: "scl-2026", name: "Sirmour Cricket League 2026", shortName: "SCL 2026", season: "2026", format: "T20", overs: 20, location: "Sirmour District, Himachal Pradesh", startDate: "2026-01-15", endDate: "2026-02-20", status: "ongoing" as const, description: "The premier T20 cricket tournament of Sirmour district featuring the best local talent across six competitive teams.", currentStage: "League" },
  { id: "nahan-t10-2026", name: "Nahan T10 Cup 2026", shortName: "NTC 2026", season: "2026", format: "T10", overs: 10, location: "Nahan, Himachal Pradesh", startDate: "2026-03-05", endDate: "2026-03-15", status: "registration_open" as const, description: "A fast-paced T10 competition in Nahan with explosive action and community spirit." },
  { id: "paonta-championship-2026", name: "Paonta Cricket Championship 2026", shortName: "PCC 2026", season: "2026", format: "T20", overs: 20, location: "Paonta Sahib, Himachal Pradesh", startDate: "2026-04-10", endDate: "2026-04-25", status: "upcoming" as const, description: "Paonta Sahib's premier cricket championship bringing together clubs from across the region." },
];

// ---------------------------------------------------------------------------
// Seed helpers
// ---------------------------------------------------------------------------

/** name -> player id ("Arjun Thakur" -> "kak-1") */
const playerIdByName = new Map<string, string>();
for (const team of TEAMS) {
  SQUADS[team.id].forEach((name, idx) => {
    playerIdByName.set(name, `${team.prefix}-${idx + 1}`);
  });
}
function pid(name: string): string {
  const id = playerIdByName.get(name);
  if (!id) throw new Error(`Unknown player name in seed: ${name}`);
  return id;
}

function decimalOversToBalls(overs: number): number {
  const full = Math.floor(overs);
  const balls = Math.round((overs - full) * 10);
  return full * 6 + balls;
}

interface SeedBat {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  dismissal?: string; // "c X b Y" | "b Y" | "run out" | "not out" | undefined (yet to bat)
}
interface SeedBowl {
  name: string;
  overs: number; // decimal notation
  maidens: number;
  runs: number;
  wickets: number;
}
interface SeedExtras {
  wides: number;
  noBalls: number;
  byes: number;
  legByes: number;
}
interface SeedBall {
  over: number;
  ball: number;
  runs: number;
  isWicket?: boolean;
  wicketType?: string;
  dismissedName?: string;
  fielderName?: string;
  bowlerName: string;
  strikerName: string;
  nonStrikerName: string;
}
interface SeedCommentary {
  over: number;
  ball: number;
  type: "run" | "boundary" | "wicket" | "dot" | "extra";
  text: string;
  runs?: number;
}

function parseDismissal(text?: string) {
  if (!text || text.toLowerCase() === "not out") {
    return { dismissalType: null, dismissalText: "not out", fielderId: null, bowlerId: null };
  }
  const caught = text.match(/^c (.+) b (.+)$/);
  if (caught) {
    return { dismissalType: "caught", dismissalText: text, fielderId: pid(caught[1]), bowlerId: pid(caught[2]) };
  }
  const bowled = text.match(/^b (.+)$/);
  if (bowled) {
    return { dismissalType: "bowled", dismissalText: text, fielderId: null, bowlerId: pid(bowled[1]) };
  }
  if (text.toLowerCase() === "run out") {
    return { dismissalType: "run_out", dismissalText: text, fielderId: null, bowlerId: null };
  }
  return { dismissalType: null, dismissalText: text, fielderId: null, bowlerId: null };
}

async function createInnings(
  matchId: string,
  inningsNumber: number,
  battingTeamId: string,
  bowlingTeamId: string,
  totalOvers: number,
  batting: SeedBat[],
  bowling: SeedBowl[],
  extras: SeedExtras,
  opts: { isCompleted: boolean; endedByAllOut?: boolean; balls?: SeedBall[]; commentary?: SeedCommentary[] }
) {
  const runs = batting.reduce((s, b) => s + b.runs, 0) + extras.wides + extras.noBalls + extras.byes + extras.legByes;
  const wickets = batting.filter((b) => {
    const d = b.dismissal?.toLowerCase();
    return d !== undefined && d !== "not out";
  }).length;
  const legalBalls = bowling.reduce((s, b) => s + decimalOversToBalls(b.overs), 0);

  const innings = await prisma.innings.create({
    data: {
      matchId,
      inningsNumber,
      battingTeamId,
      bowlingTeamId,
      runs,
      wickets,
      balls: legalBalls,
      totalOvers,
      wides: extras.wides,
      noBalls: extras.noBalls,
      byes: extras.byes,
      legByes: extras.legByes,
      isCompleted: opts.isCompleted,
      endedByAllOut: opts.endedByAllOut ?? false,
    },
  });

  await prisma.battingCardEntry.createMany({
    data: batting.map((b, idx) => ({
      inningsId: innings.id,
      playerId: pid(b.name),
      battingOrder: idx + 1,
      runs: b.runs,
      balls: b.balls,
      fours: b.fours,
      sixes: b.sixes,
      ...parseDismissal(b.dismissal),
    })),
  });

  await prisma.bowlingCardEntry.createMany({
    data: bowling.map((b) => ({
      inningsId: innings.id,
      playerId: pid(b.name),
      balls: decimalOversToBalls(b.overs),
      maidens: b.maidens,
      runsConceded: b.runs,
      wickets: b.wickets,
    })),
  });

  if (opts.balls) {
    await prisma.ballEvent.createMany({
      data: opts.balls.map((b, idx) => ({
        matchId,
        inningsId: innings.id,
        sequence: idx + 1,
        overNumber: b.over,
        ballInOver: b.ball,
        runs: b.runs,
        isWicket: b.isWicket ?? false,
        wicketType: b.wicketType ?? null,
        dismissedPlayerId: b.dismissedName ? pid(b.dismissedName) : null,
        fielderId: b.fielderName ? pid(b.fielderName) : null,
        strikerId: pid(b.strikerName),
        nonStrikerId: pid(b.nonStrikerName),
        bowlerId: pid(b.bowlerName),
      })),
    });
  }

  if (opts.commentary) {
    await prisma.commentaryEvent.createMany({
      data: opts.commentary.map((c) => ({
        matchId,
        inningsId: innings.id,
        over: c.over,
        ball: c.ball,
        type: c.type,
        text: c.text,
        runs: c.runs ?? null,
      })),
    });
  }

  return innings;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("[seed] Starting idempotent seed (safe for production)...");

  // --- Users ---------------------------------------------------------------
  const adminEmail = env.effectiveAdminEmail;
  const adminPassword = env.effectiveAdminPassword;
  const [adminHash, editorHash, viewerHash] = await Promise.all([
    bcrypt.hash(adminPassword, 10),
    bcrypt.hash(env.SEED_EDITOR_PASSWORD, 10),
    bcrypt.hash(env.SEED_VIEWER_PASSWORD, 10),
  ]);

  const defaultUsers = [
    { id: "u1", name: "SCL Admin", email: adminEmail, passwordHash: adminHash, role: "admin" as const },
    { id: "u2", name: "Anita Rana", email: env.SEED_EDITOR_EMAIL.toLowerCase(), passwordHash: editorHash, role: "editor" as const },
    { id: "u3", name: "Vikas Bhatt", email: env.SEED_VIEWER_EMAIL.toLowerCase(), passwordHash: viewerHash, role: "viewer" as const },
  ];

  for (const u of defaultUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role, passwordHash: u.passwordHash, name: u.name },
      create: u,
    });
  }
  console.log(`[seed] Users ready: admin=${adminEmail} editor=${env.SEED_EDITOR_EMAIL} viewer=${env.SEED_VIEWER_EMAIL}`);

  // --- Settings ------------------------------------------------------------
  const defaultSettings = [
    { key: "siteName", value: "Sirmour Cricket League" },
    { key: "contactEmail", value: "info@sirmourcricketleague.local" },
    { key: "phone", value: "+91 98765 43210" },
  ];
  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // --- Tournaments / Teams / Players / Venues ------------------------------
  for (const t of TOURNAMENTS) {
    await prisma.tournament.upsert({
      where: { id: t.id },
      update: {
        name: t.name,
        shortName: t.shortName,
        season: t.season,
        format: t.format,
        overs: t.overs,
        location: t.location,
        startDate: new Date(t.startDate),
        endDate: new Date(t.endDate),
        status: t.status,
        description: t.description,
        currentStage: t.currentStage,
      },
      create: {
        ...t,
        startDate: new Date(t.startDate),
        endDate: new Date(t.endDate),
      },
    });
  }

  for (const team of TEAMS) {
    await prisma.team.upsert({
      where: { id: team.id },
      update: {
        name: team.name,
        shortName: team.shortName,
        captainId: `${team.prefix}-1`,
        captainName: team.captainName,
        coach: team.coach,
        foundedYear: team.foundedYear,
      },
      create: {
        id: team.id,
        name: team.name,
        shortName: team.shortName,
        captainId: `${team.prefix}-1`,
        captainName: team.captainName,
        coach: team.coach,
        foundedYear: team.foundedYear,
      },
    });
  }

  for (const team of TEAMS) {
    for (let idx = 0; idx < SQUADS[team.id].length; idx++) {
      const name = SQUADS[team.id][idx];
      const role = ROLE_DISTRIBUTION[idx];
      const playerId = `${team.prefix}-${idx + 1}`;
      await prisma.player.upsert({
        where: { id: playerId },
        update: {
          name,
          teamId: team.id,
          role,
          jerseyNumber: idx + 1,
          battingStyle: BATTING_STYLES[idx % BATTING_STYLES.length],
          bowlingStyle: role === "Batsman" || role === "Wicket-keeper" ? null : BOWLING_STYLES[(idx + team.id.length) % BOWLING_STYLES.length],
        },
        create: {
          id: playerId,
          name,
          teamId: team.id,
          role,
          jerseyNumber: idx + 1,
          battingStyle: BATTING_STYLES[idx % BATTING_STYLES.length],
          bowlingStyle: role === "Batsman" || role === "Wicket-keeper" ? null : BOWLING_STYLES[(idx + team.id.length) % BOWLING_STYLES.length],
        },
      });
    }
  }

  for (const v of VENUES) {
    await prisma.venue.upsert({
      where: { id: v.id },
      update: {
        name: v.name,
        location: v.location,
        address: v.address,
        capacity: v.capacity,
        pitchInfo: v.pitchInfo,
      },
      create: v,
    });
  }

  for (const t of TEAMS) {
    await prisma.tournamentTeam.upsert({
      where: { tournamentId_teamId: { tournamentId: "scl-2026", teamId: t.id } },
      update: {},
      create: { id: `tt-scl-${t.prefix}`, tournamentId: "scl-2026", teamId: t.id },
    });
  }

  // --- Completed matches ----------------------------------------------------
  // scl-m1: KAK 182/6 beat NAW 176/5 by 6 runs
  if (!(await prisma.match.findUnique({ where: { id: "scl-m1" } }))) {
    await prisma.match.create({
      data: {
        id: "scl-m1", tournamentId: "scl-2026", matchNumber: 1, stage: "League",
        date: new Date("2026-01-15"), time: "14:00", venueId: "dharampur-stadium",
        team1Id: "kala-amb-kings", team2Id: "nahan-warriors", status: "completed",
        tossWinnerId: "nahan-warriors", electedTo: "field",
        resultText: "Kala Amb Kings won by 6 runs", winnerTeamId: "kala-amb-kings",
        playerOfMatchId: pid("Arjun Thakur"),
      },
    });
    await createInnings("scl-m1", 1, "kala-amb-kings", "nahan-warriors", 20,
      [
        { name: "Arjun Thakur", runs: 58, balls: 41, fours: 5, sixes: 3, dismissal: "c Harsh Rana b Ankit Rawat" },
        { name: "Rohit Sharma", runs: 34, balls: 28, fours: 2, sixes: 1, dismissal: "b Nikhil Chauhan" },
        { name: "Vikram Singh", runs: 21, balls: 18, fours: 1, sixes: 1, dismissal: "run out" },
        { name: "Mohit Rana", runs: 15, balls: 12, fours: 1, sixes: 0, dismissal: "c Priyank Negi b Gaurav Bisht" },
        { name: "Karan Bhatt", runs: 28, balls: 16, fours: 1, sixes: 2, dismissal: "not out" },
        { name: "Siddharth Chauhan", runs: 14, balls: 9, fours: 1, sixes: 1, dismissal: "b Gaurav Bisht" },
        { name: "Deepak Kumar", runs: 8, balls: 5, fours: 0, sixes: 1, dismissal: "not out" },
        { name: "Aman Negi", runs: 0, balls: 1, fours: 0, sixes: 0, dismissal: "b Ankit Rawat" },
      ],
      [
        { name: "Ankit Rawat", overs: 4, maidens: 0, runs: 42, wickets: 2 },
        { name: "Nikhil Chauhan", overs: 4, maidens: 0, runs: 29, wickets: 1 },
        { name: "Gaurav Bisht", overs: 4, maidens: 0, runs: 31, wickets: 2 },
        { name: "Rajesh Panwar", overs: 4, maidens: 0, runs: 44, wickets: 0 },
        { name: "Mohan Bhatt", overs: 4, maidens: 0, runs: 36, wickets: 0 },
      ],
      { wides: 3, noBalls: 1, byes: 0, legByes: 0 },
      { isCompleted: true });
    await createInnings("scl-m1", 2, "nahan-warriors", "kala-amb-kings", 20,
      [
        { name: "Priyank Negi", runs: 44, balls: 33, fours: 3, sixes: 2, dismissal: "b Karan Bhatt" },
        { name: "Harsh Rana", runs: 22, balls: 19, fours: 2, sixes: 1, dismissal: "run out" },
        { name: "Sachin Verma", runs: 31, balls: 26, fours: 2, sixes: 1, dismissal: "c Aman Negi b Deepak Kumar" },
        { name: "Ankit Rawat", runs: 18, balls: 14, fours: 1, sixes: 1, dismissal: "b Arjun Thakur" },
        { name: "Nikhil Chauhan", runs: 12, balls: 10, fours: 1, sixes: 0, dismissal: "b Mohit Rana" },
        { name: "Gaurav Bisht", runs: 31, balls: 17, fours: 2, sixes: 2, dismissal: "not out" },
        { name: "Rajesh Panwar", runs: 9, balls: 7, fours: 0, sixes: 1, dismissal: "not out" },
      ],
      [
        { name: "Siddharth Chauhan", overs: 4, maidens: 0, runs: 41, wickets: 0 },
        { name: "Deepak Kumar", overs: 4, maidens: 0, runs: 28, wickets: 1 },
        { name: "Arjun Thakur", overs: 4, maidens: 0, runs: 35, wickets: 1 },
        { name: "Karan Bhatt", overs: 4, maidens: 0, runs: 38, wickets: 1 },
        { name: "Mohit Rana", overs: 4, maidens: 0, runs: 33, wickets: 1 },
      ],
      { wides: 6, noBalls: 2, byes: 0, legByes: 1 },
      { isCompleted: true });
  }

  // scl-m2: PAS 165/4 beat RJR 140/7 (18.4) by 25 runs
  if (!(await prisma.match.findUnique({ where: { id: "scl-m2" } }))) {
    await prisma.match.create({
      data: {
        id: "scl-m2", tournamentId: "scl-2026", matchNumber: 2, stage: "League",
        date: new Date("2026-01-16"), time: "10:00", venueId: "paonta-sports-ground",
        team1Id: "paonta-strikers", team2Id: "rajgarh-royals", status: "completed",
        tossWinnerId: "rajgarh-royals", electedTo: "field",
        resultText: "Paonta Strikers won by 25 runs", winnerTeamId: "paonta-strikers",
        playerOfMatchId: pid("Rahul Rana"),
      },
    });
    await createInnings("scl-m2", 1, "paonta-strikers", "rajgarh-royals", 20,
      [
        { name: "Rahul Rana", runs: 62, balls: 45, fours: 6, sixes: 2, dismissal: "b Tarun Negi" },
        { name: "Sumit Rawat", runs: 18, balls: 20, fours: 1, sixes: 0, dismissal: "c Dev Thakur b Rishabh Rawat" },
        { name: "Abhishek Chauhan", runs: 25, balls: 21, fours: 2, sixes: 1, dismissal: "run out" },
        { name: "Virendra Singh", runs: 14, balls: 11, fours: 1, sixes: 0, dismissal: "b Shubham Chauhan" },
        { name: "Tejas Bhatt", runs: 32, balls: 16, fours: 2, sixes: 2, dismissal: "not out" },
        { name: "Lokesh Panwar", runs: 7, balls: 5, fours: 0, sixes: 0, dismissal: "not out" },
      ],
      [
        { name: "Shubham Chauhan", overs: 4, maidens: 0, runs: 38, wickets: 1 },
        { name: "Tarun Negi", overs: 4, maidens: 0, runs: 29, wickets: 1 },
        { name: "Yash Panwar", overs: 4, maidens: 0, runs: 36, wickets: 0 },
        { name: "Rishabh Rawat", overs: 4, maidens: 0, runs: 31, wickets: 1 },
        { name: "Manoj Kumar", overs: 4, maidens: 0, runs: 30, wickets: 0 },
      ],
      { wides: 5, noBalls: 1, byes: 1, legByes: 0 },
      { isCompleted: true });
    await createInnings("scl-m2", 2, "rajgarh-royals", "paonta-strikers", 20,
      [
        { name: "Dev Thakur", runs: 27, balls: 22, fours: 2, sixes: 1, dismissal: "b Nitin Rana" },
        { name: "Aryan Rana", runs: 19, balls: 17, fours: 1, sixes: 1, dismissal: "c Kunal Thakur b Virendra Singh" },
        { name: "Himanshu Bisht", runs: 33, balls: 28, fours: 3, sixes: 1, dismissal: "run out" },
        { name: "Shubham Chauhan", runs: 11, balls: 9, fours: 0, sixes: 1, dismissal: "b Tejas Bhatt" },
        { name: "Tarun Negi", runs: 8, balls: 7, fours: 1, sixes: 0, dismissal: "b Nitin Rana" },
        { name: "Yash Panwar", runs: 14, balls: 12, fours: 1, sixes: 0, dismissal: "b Lokesh Panwar" },
        { name: "Rishabh Rawat", runs: 12, balls: 8, fours: 1, sixes: 1, dismissal: "b Virendra Singh" },
        { name: "Manoj Kumar", runs: 10, balls: 9, fours: 1, sixes: 0, dismissal: "not out" },
      ],
      [
        { name: "Virendra Singh", overs: 3.4, maidens: 0, runs: 27, wickets: 2 },
        { name: "Tejas Bhatt", overs: 4, maidens: 0, runs: 27, wickets: 1 },
        { name: "Lokesh Panwar", overs: 4, maidens: 0, runs: 33, wickets: 1 },
        { name: "Nitin Rana", overs: 4, maidens: 0, runs: 28, wickets: 2 },
        { name: "Kunal Thakur", overs: 3, maidens: 0, runs: 22, wickets: 0 },
      ],
      { wides: 3, noBalls: 0, byes: 1, legByes: 2 },
      { isCompleted: true, endedByAllOut: true });
  }

  // scl-m3: RTR 158/4 lost to SSK 159/4 (18.2) by 6 wickets
  if (!(await prisma.match.findUnique({ where: { id: "scl-m3" } }))) {
    await prisma.match.create({
      data: {
        id: "scl-m3", tournamentId: "scl-2026", matchNumber: 3, stage: "League",
        date: new Date("2026-01-17"), time: "14:00", venueId: "kala-amb-school-ground",
        team1Id: "sirmour-super-kings", team2Id: "renuka-tigers", status: "completed",
        tossWinnerId: "renuka-tigers", electedTo: "bat",
        resultText: "Sirmour Super Kings won by 6 wickets", winnerTeamId: "sirmour-super-kings",
        playerOfMatchId: pid("Ajay Rana"),
      },
    });
    await createInnings("scl-m3", 1, "renuka-tigers", "sirmour-super-kings", 20,
      [
        { name: "Kamal Bisht", runs: 36, balls: 29, fours: 3, sixes: 1, dismissal: "c Ajay Rana b Neeraj Bhatt" },
        { name: "Naveen Kumar", runs: 21, balls: 18, fours: 2, sixes: 1, dismissal: "run out" },
        { name: "Sandeep Rana", runs: 55, balls: 36, fours: 5, sixes: 2, dismissal: "b Saurabh Chauhan" },
        { name: "Rohan Chauhan", runs: 19, balls: 15, fours: 1, sixes: 1, dismissal: "b Pradeep Singh" },
        { name: "Akash Panwar", runs: 12, balls: 9, fours: 0, sixes: 1, dismissal: "not out" },
        { name: "Pankaj Thakur", runs: 8, balls: 6, fours: 1, sixes: 0, dismissal: "not out" },
      ],
      [
        { name: "Neeraj Bhatt", overs: 4, maidens: 0, runs: 36, wickets: 1 },
        { name: "Saurabh Chauhan", overs: 4, maidens: 0, runs: 29, wickets: 1 },
        { name: "Lalit Panwar", overs: 4, maidens: 0, runs: 32, wickets: 0 },
        { name: "Jatin Rawat", overs: 4, maidens: 0, runs: 30, wickets: 0 },
        { name: "Pradeep Singh", overs: 4, maidens: 0, runs: 28, wickets: 1 },
      ],
      { wides: 4, noBalls: 0, byes: 0, legByes: 3 },
      { isCompleted: true });
    await createInnings("scl-m3", 2, "sirmour-super-kings", "renuka-tigers", 20,
      [
        { name: "Ajay Rana", runs: 64, balls: 42, fours: 6, sixes: 3, dismissal: "not out" },
        { name: "Vishal Thakur", runs: 22, balls: 19, fours: 2, sixes: 1, dismissal: "c Kamal Bisht b Pankaj Thakur" },
        { name: "Pradeep Singh", runs: 31, balls: 24, fours: 2, sixes: 1, dismissal: "b Sandeep Rana" },
        { name: "Neeraj Bhatt", runs: 14, balls: 11, fours: 1, sixes: 0, dismissal: "run out" },
        { name: "Saurabh Chauhan", runs: 24, balls: 13, fours: 2, sixes: 1, dismissal: "not out" },
        { name: "Lalit Panwar", runs: 0, balls: 1, fours: 0, sixes: 0, dismissal: "b Pankaj Thakur" },
      ],
      [
        { name: "Akash Panwar", overs: 3.2, maidens: 0, runs: 31, wickets: 0 },
        { name: "Pankaj Thakur", overs: 4, maidens: 0, runs: 33, wickets: 2 },
        { name: "Sandeep Rana", overs: 4, maidens: 0, runs: 35, wickets: 1 },
        { name: "Rohan Chauhan", overs: 4, maidens: 0, runs: 38, wickets: 0 },
        { name: "Varun Negi", overs: 3, maidens: 0, runs: 21, wickets: 0 },
      ],
      { wides: 2, noBalls: 1, byes: 0, legByes: 1 },
      { isCompleted: true });
  }

  // scl-m4: KAK 150/5 lost to PAS 151/2 (16.4) by 7 wickets
  if (!(await prisma.match.findUnique({ where: { id: "scl-m4" } }))) {
    await prisma.match.create({
      data: {
        id: "scl-m4", tournamentId: "scl-2026", matchNumber: 4, stage: "League",
        date: new Date("2026-01-18"), time: "10:00", venueId: "dharampur-stadium",
        team1Id: "kala-amb-kings", team2Id: "paonta-strikers", status: "completed",
        tossWinnerId: "paonta-strikers", electedTo: "field",
        resultText: "Paonta Strikers won by 7 wickets", winnerTeamId: "paonta-strikers",
        playerOfMatchId: pid("Abhishek Chauhan"),
      },
    });
    await createInnings("scl-m4", 1, "kala-amb-kings", "paonta-strikers", 20,
      [
        { name: "Arjun Thakur", runs: 28, balls: 24, fours: 2, sixes: 1, dismissal: "b Lokesh Panwar" },
        { name: "Rohit Sharma", runs: 35, balls: 30, fours: 3, sixes: 1, dismissal: "c Rahul Rana b Nitin Rana" },
        { name: "Vikram Singh", runs: 19, balls: 16, fours: 1, sixes: 1, dismissal: "run out" },
        { name: "Mohit Rana", runs: 14, balls: 12, fours: 1, sixes: 0, dismissal: "b Virendra Singh" },
        { name: "Karan Bhatt", runs: 37, balls: 20, fours: 3, sixes: 2, dismissal: "not out" },
        { name: "Siddharth Chauhan", runs: 11, balls: 8, fours: 1, sixes: 0, dismissal: "b Lokesh Panwar" },
      ],
      [
        { name: "Virendra Singh", overs: 4, maidens: 0, runs: 32, wickets: 1 },
        { name: "Tejas Bhatt", overs: 4, maidens: 0, runs: 30, wickets: 0 },
        { name: "Lokesh Panwar", overs: 4, maidens: 0, runs: 30, wickets: 2 },
        { name: "Nitin Rana", overs: 4, maidens: 0, runs: 31, wickets: 1 },
        { name: "Kunal Thakur", overs: 4, maidens: 0, runs: 25, wickets: 0 },
      ],
      { wides: 3, noBalls: 1, byes: 0, legByes: 2 },
      { isCompleted: true });
    await createInnings("scl-m4", 2, "paonta-strikers", "kala-amb-kings", 20,
      [
        { name: "Rahul Rana", runs: 42, balls: 32, fours: 4, sixes: 1, dismissal: "b Karan Bhatt" },
        { name: "Sumit Rawat", runs: 25, balls: 21, fours: 2, sixes: 1, dismissal: "run out" },
        { name: "Abhishek Chauhan", runs: 63, balls: 33, fours: 6, sixes: 2, dismissal: "not out" },
        { name: "Virendra Singh", runs: 18, balls: 14, fours: 1, sixes: 1, dismissal: "not out" },
      ],
      [
        { name: "Siddharth Chauhan", overs: 3, maidens: 0, runs: 26, wickets: 0 },
        { name: "Deepak Kumar", overs: 4, maidens: 0, runs: 35, wickets: 0 },
        { name: "Arjun Thakur", overs: 3.1, maidens: 0, runs: 28, wickets: 0 },
        { name: "Karan Bhatt", overs: 4, maidens: 0, runs: 35, wickets: 1 },
        { name: "Mohit Rana", overs: 3, maidens: 0, runs: 26, wickets: 0 },
      ],
      { wides: 2, noBalls: 0, byes: 0, legByes: 1 },
      { isCompleted: true });
  }

  // scl-m5: SSK 190/3 beat NAW 188/5 by 2 runs
  if (!(await prisma.match.findUnique({ where: { id: "scl-m5" } }))) {
    await prisma.match.create({
      data: {
        id: "scl-m5", tournamentId: "scl-2026", matchNumber: 5, stage: "League",
        date: new Date("2026-01-19"), time: "14:00", venueId: "rajgarh-academy",
        team1Id: "nahan-warriors", team2Id: "sirmour-super-kings", status: "completed",
        tossWinnerId: "sirmour-super-kings", electedTo: "bat",
        resultText: "Sirmour Super Kings won by 2 runs", winnerTeamId: "sirmour-super-kings",
        playerOfMatchId: pid("Pradeep Singh"),
      },
    });
    await createInnings("scl-m5", 1, "sirmour-super-kings", "nahan-warriors", 20,
      [
        { name: "Ajay Rana", runs: 44, balls: 31, fours: 3, sixes: 2, dismissal: "c Priyank Negi b Ankit Rawat" },
        { name: "Vishal Thakur", runs: 29, balls: 22, fours: 2, sixes: 1, dismissal: "run out" },
        { name: "Pradeep Singh", runs: 75, balls: 44, fours: 5, sixes: 4, dismissal: "not out" },
        { name: "Neeraj Bhatt", runs: 22, balls: 16, fours: 1, sixes: 1, dismissal: "b Gaurav Bisht" },
        { name: "Saurabh Chauhan", runs: 12, balls: 8, fours: 0, sixes: 1, dismissal: "not out" },
      ],
      [
        { name: "Ankit Rawat", overs: 4, maidens: 0, runs: 42, wickets: 1 },
        { name: "Nikhil Chauhan", overs: 4, maidens: 0, runs: 38, wickets: 0 },
        { name: "Gaurav Bisht", overs: 4, maidens: 0, runs: 34, wickets: 1 },
        { name: "Rajesh Panwar", overs: 4, maidens: 0, runs: 38, wickets: 0 },
        { name: "Mohan Bhatt", overs: 4, maidens: 0, runs: 36, wickets: 0 },
      ],
      { wides: 5, noBalls: 1, byes: 0, legByes: 2 },
      { isCompleted: true });
    await createInnings("scl-m5", 2, "nahan-warriors", "sirmour-super-kings", 20,
      [
        { name: "Priyank Negi", runs: 72, balls: 40, fours: 6, sixes: 3, dismissal: "b Neeraj Bhatt" },
        { name: "Harsh Rana", runs: 31, balls: 24, fours: 3, sixes: 1, dismissal: "c Vishal Thakur b Saurabh Chauhan" },
        { name: "Sachin Verma", runs: 24, balls: 19, fours: 1, sixes: 1, dismissal: "run out" },
        { name: "Ankit Rawat", runs: 18, balls: 13, fours: 1, sixes: 1, dismissal: "b Pradeep Singh" },
        { name: "Nikhil Chauhan", runs: 22, balls: 15, fours: 1, sixes: 1, dismissal: "not out" },
        { name: "Gaurav Bisht", runs: 14, balls: 9, fours: 1, sixes: 0, dismissal: "run out" },
      ],
      [
        { name: "Neeraj Bhatt", overs: 4, maidens: 0, runs: 37, wickets: 1 },
        { name: "Saurabh Chauhan", overs: 4, maidens: 0, runs: 35, wickets: 1 },
        { name: "Lalit Panwar", overs: 4, maidens: 0, runs: 38, wickets: 0 },
        { name: "Pradeep Singh", overs: 4, maidens: 0, runs: 38, wickets: 1 },
        { name: "Jatin Rawat", overs: 4, maidens: 0, runs: 37, wickets: 0 },
      ],
      { wides: 4, noBalls: 0, byes: 1, legByes: 2 },
      { isCompleted: true });
  }

  // --- Live match: RJR 180/3 (20) vs RTR 145/4 (17.3), chasing 181 ----------
  if (!(await prisma.match.findUnique({ where: { id: "scl-m6" } }))) {
    await prisma.match.create({
      data: {
        id: "scl-m6", tournamentId: "scl-2026", matchNumber: 6, stage: "League",
        date: new Date("2026-01-20"), time: "14:00", venueId: "paonta-sports-ground",
        team1Id: "rajgarh-royals", team2Id: "renuka-tigers", status: "live",
        tossWinnerId: "rajgarh-royals", electedTo: "bat",
        target: 181, currentInnings: 2,
        strikerId: pid("Sandeep Rana"), nonStrikerId: pid("Rohan Chauhan"), bowlerId: pid("Rishabh Rawat"),
      },
    });
    await createInnings("scl-m6", 1, "rajgarh-royals", "renuka-tigers", 20,
      [
        { name: "Dev Thakur", runs: 63, balls: 38, fours: 5, sixes: 3, dismissal: "not out" },
        { name: "Aryan Rana", runs: 31, balls: 24, fours: 2, sixes: 1, dismissal: "b Akash Panwar" },
        { name: "Himanshu Bisht", runs: 42, balls: 29, fours: 3, sixes: 2, dismissal: "c Kamal Bisht b Sandeep Rana" },
        { name: "Shubham Chauhan", runs: 22, balls: 16, fours: 1, sixes: 1, dismissal: "run out" },
        { name: "Tarun Negi", runs: 15, balls: 11, fours: 1, sixes: 0, dismissal: "not out" },
      ],
      [
        { name: "Akash Panwar", overs: 4, maidens: 0, runs: 44, wickets: 1 },
        { name: "Sandeep Rana", overs: 4, maidens: 0, runs: 31, wickets: 1 },
        { name: "Pankaj Thakur", overs: 4, maidens: 0, runs: 42, wickets: 0 },
        { name: "Rohan Chauhan", overs: 4, maidens: 0, runs: 33, wickets: 0 },
        { name: "Varun Negi", overs: 4, maidens: 0, runs: 29, wickets: 0 },
      ],
      { wides: 4, noBalls: 2, byes: 0, legByes: 1 },
      { isCompleted: true });
    await createInnings("scl-m6", 2, "renuka-tigers", "rajgarh-royals", 20,
      [
        { name: "Kamal Bisht", runs: 36, balls: 29, fours: 3, sixes: 1, dismissal: "b Tarun Negi" },
        { name: "Naveen Kumar", runs: 18, balls: 15, fours: 2, sixes: 0, dismissal: "c Dev Thakur b Shubham Chauhan" },
        { name: "Sandeep Rana", runs: 52, balls: 36, fours: 4, sixes: 2, dismissal: "not out" },
        { name: "Pankaj Thakur", runs: 8, balls: 6, fours: 1, sixes: 0, dismissal: "b Himanshu Bisht" },
        { name: "Akash Panwar", runs: 5, balls: 4, fours: 0, sixes: 0, dismissal: "c Dev Thakur b Rishabh Rawat" },
        { name: "Rohan Chauhan", runs: 21, balls: 17, fours: 1, sixes: 1, dismissal: "not out" },
      ],
      [
        { name: "Shubham Chauhan", overs: 3.3, maidens: 0, runs: 27, wickets: 1 },
        { name: "Tarun Negi", overs: 4, maidens: 0, runs: 31, wickets: 1 },
        { name: "Yash Panwar", overs: 3, maidens: 0, runs: 28, wickets: 0 },
        { name: "Rishabh Rawat", overs: 4, maidens: 0, runs: 35, wickets: 1 },
        { name: "Himanshu Bisht", overs: 3, maidens: 0, runs: 22, wickets: 1 },
      ],
      { wides: 3, noBalls: 0, byes: 0, legByes: 2 },
      {
        isCompleted: false,
        balls: [
          { over: 6, ball: 2, runs: 0, isWicket: true, wicketType: "bowled", dismissedName: "Kamal Bisht", bowlerName: "Tarun Negi", strikerName: "Kamal Bisht", nonStrikerName: "Naveen Kumar" },
          { over: 10, ball: 4, runs: 0, isWicket: true, wicketType: "caught", dismissedName: "Naveen Kumar", fielderName: "Dev Thakur", bowlerName: "Shubham Chauhan", strikerName: "Naveen Kumar", nonStrikerName: "Sandeep Rana" },
          { over: 13, ball: 1, runs: 0, isWicket: true, wicketType: "bowled", dismissedName: "Pankaj Thakur", bowlerName: "Himanshu Bisht", strikerName: "Pankaj Thakur", nonStrikerName: "Sandeep Rana" },
          { over: 15, ball: 3, runs: 0, isWicket: true, wicketType: "caught", dismissedName: "Akash Panwar", fielderName: "Dev Thakur", bowlerName: "Rishabh Rawat", strikerName: "Akash Panwar", nonStrikerName: "Sandeep Rana" },
          { over: 17, ball: 1, runs: 1, bowlerName: "Shubham Chauhan", strikerName: "Sandeep Rana", nonStrikerName: "Rohan Chauhan" },
          { over: 17, ball: 2, runs: 4, bowlerName: "Shubham Chauhan", strikerName: "Sandeep Rana", nonStrikerName: "Rohan Chauhan" },
          { over: 17, ball: 3, runs: 0, bowlerName: "Shubham Chauhan", strikerName: "Sandeep Rana", nonStrikerName: "Rohan Chauhan" },
          { over: 17, ball: 4, runs: 2, bowlerName: "Shubham Chauhan", strikerName: "Sandeep Rana", nonStrikerName: "Rohan Chauhan" },
          { over: 17, ball: 5, runs: 1, bowlerName: "Shubham Chauhan", strikerName: "Sandeep Rana", nonStrikerName: "Rohan Chauhan" },
          { over: 17, ball: 6, runs: 0, bowlerName: "Shubham Chauhan", strikerName: "Sandeep Rana", nonStrikerName: "Rohan Chauhan" },
          { over: 18, ball: 1, runs: 0, bowlerName: "Rishabh Rawat", strikerName: "Sandeep Rana", nonStrikerName: "Rohan Chauhan" },
          { over: 18, ball: 2, runs: 0, bowlerName: "Rishabh Rawat", strikerName: "Sandeep Rana", nonStrikerName: "Rohan Chauhan" },
          { over: 18, ball: 3, runs: 4, bowlerName: "Rishabh Rawat", strikerName: "Sandeep Rana", nonStrikerName: "Rohan Chauhan" },
        ],
        commentary: [
          { over: 18, ball: 3, type: "boundary", text: "FOUR! Slapped through cover point.", runs: 4 },
          { over: 18, ball: 2, type: "dot", text: "Beaten outside off, good length.", runs: 0 },
          { over: 18, ball: 1, type: "dot", text: "Tapped to point, no run.", runs: 0 },
          { over: 17, ball: 6, type: "dot", text: "Yorker squeezed to mid-wicket.", runs: 0 },
          { over: 17, ball: 5, type: "run", text: "1 run, turned to square leg.", runs: 1 },
          { over: 17, ball: 4, type: "run", text: "2 runs, glanced fine.", runs: 2 },
          { over: 17, ball: 3, type: "dot", text: "Defended on off stump.", runs: 0 },
          { over: 17, ball: 2, type: "boundary", text: "FOUR! Short ball pulled through mid-wicket.", runs: 4 },
          { over: 17, ball: 1, type: "run", text: "1 run, driven to long-on.", runs: 1 },
        ],
      });
  }

  // --- Upcoming matches ------------------------------------------------------
  const upcomingMatches = [
    { id: "scl-m7", tournamentId: "scl-2026", matchNumber: 7, stage: "League", date: new Date("2026-01-21"), time: "10:00", venueId: "dharampur-stadium", team1Id: "kala-amb-kings", team2Id: "sirmour-super-kings", status: "upcoming" as const },
    { id: "scl-m8", tournamentId: "scl-2026", matchNumber: 8, stage: "League", date: new Date("2026-01-21"), time: "14:00", venueId: "paonta-sports-ground", team1Id: "nahan-warriors", team2Id: "paonta-strikers", status: "upcoming" as const },
    { id: "ntc-m1", tournamentId: "nahan-t10-2026", matchNumber: 1, stage: "League", date: new Date("2026-03-05"), time: "18:00", venueId: "dharampur-stadium", team1Id: "kala-amb-kings", team2Id: "nahan-warriors", status: "upcoming" as const },
    { id: "pcc-m1", tournamentId: "paonta-championship-2026", matchNumber: 1, stage: "League", date: new Date("2026-04-10"), time: "09:30", venueId: "paonta-sports-ground", team1Id: "paonta-strikers", team2Id: "rajgarh-royals", status: "upcoming" as const },
  ];
  for (const m of upcomingMatches) {
    if (!(await prisma.match.findUnique({ where: { id: m.id } }))) {
      await prisma.match.create({ data: m });
    }
  }

  // --- News ------------------------------------------------------------------
  const newsList = [
    { id: "news-1", title: "SCL 2026 Season Opener Draws Record Crowds", category: "Tournament News", date: new Date("2026-01-14"), tournamentId: "scl-2026", excerpt: "The Sirmour Cricket League 2026 kicked off at Dharampur Cricket Stadium with packed stands and thrilling action.", content: "The Sirmour Cricket League 2026 began with an electric atmosphere at Dharampur Cricket Stadium. Fans from across the district gathered to support their local teams. The opening ceremony featured cultural performances and the unveiling of the trophy. The first match saw Kala Amb Kings edge past Nahan Warriors in a nail-biting finish.", author: "SCL Media Team" },
    { id: "news-2", title: "Paonta Strikers Register Second Consecutive Win", category: "Match Report", date: new Date("2026-01-18"), tournamentId: "scl-2026", excerpt: "Abhishek Chauhan's unbeaten half-century powered Paonta Strikers to a comfortable seven-wicket victory.", content: "Paonta Strikers continued their dominant run in SCL 2026 with a clinical chase against Kala Amb Kings. Abhishek Chauhan remained unbeaten on 54, while the bowlers restricted the Kings to 150. The Strikers are now top of the table.", author: "Match Reporter" },
    { id: "news-3", title: "Registration Open for Nahan T10 Cup 2026", category: "Announcement", date: new Date("2026-01-10"), tournamentId: "nahan-t10-2026", excerpt: "Teams can now register for the fast-paced Nahan T10 Cup 2026. Limited slots available.", content: "The Nahan T10 Cup 2026 organizing committee has opened registrations. The tournament will be played from March 5 to March 15 across two venues in Nahan. Interested clubs are encouraged to register early as slots are limited.", author: "NTC Organizers" },
    { id: "news-4", title: "Sirmour Super Kings Name Ajay Rana as Captain", category: "Team News", date: new Date("2026-01-08"), tournamentId: "scl-2026", excerpt: "Experienced all-rounder Ajay Rana will lead Sirmour Super Kings in the 2026 campaign.", content: "Sirmour Super Kings have announced Ajay Rana as their captain for SCL 2026. Rana, known for his calm leadership and explosive batting, will look to guide the team to its maiden title.", author: "SSK Media" },
    { id: "news-5", title: "Arjun Thakur: Leading Run-Scorer After First Week", category: "Player News", date: new Date("2026-01-19"), tournamentId: "scl-2026", excerpt: "Kala Amb Kings opener Arjun Thakur sits at the top of the runs chart with 130 runs.", content: "After the first week of SCL 2026, Arjun Thakur leads the batting charts with 130 runs at an average of 65. His consistent performances have been vital for Kala Amb Kings.", author: "SCL Stats Desk" },
  ];
  for (const n of newsList) {
    if (!(await prisma.newsArticle.findUnique({ where: { id: n.id } }))) {
      await prisma.newsArticle.create({ data: n });
    }
  }

  // --- Gallery -----------------------------------------------------------------
  const galleryList = [
    { id: "g1", title: "Opening Ceremony", category: "Moment", imageUrl: "/gallery/opening.jpg", tournamentId: "scl-2026" },
    { id: "g2", title: "Trophy Unveiling", category: "Trophy", imageUrl: "/gallery/trophy.jpg", tournamentId: "scl-2026" },
    { id: "g3", title: "Kala Amb Kings Huddle", category: "Team", imageUrl: "/gallery/team1.jpg", tournamentId: "scl-2026" },
    { id: "g4", title: "Dharampur Stadium", category: "Ground", imageUrl: "/gallery/ground1.jpg", tournamentId: "scl-2026" },
    { id: "g5", title: "Match Winning Six", category: "Match", imageUrl: "/gallery/six.jpg", tournamentId: "scl-2026" },
    { id: "g6", title: "Crowd Celebration", category: "Moment", imageUrl: "/gallery/crowd.jpg", tournamentId: "scl-2026" },
  ];
  for (const g of galleryList) {
    if (!(await prisma.galleryItem.findUnique({ where: { id: g.id } }))) {
      await prisma.galleryItem.create({ data: g });
    }
  }

  // --- Activity ------------------------------------------------------------------
  const adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
  const editorUser = await prisma.user.findUnique({ where: { email: env.SEED_EDITOR_EMAIL.toLowerCase() } });
  const activityList = [
    { id: "a1", type: "tournament", description: "Created Sirmour Cricket League 2026", userId: adminUser?.id ?? null, userName: "Rahul Verma", entityType: "tournament", entityId: "scl-2026", createdAt: new Date("2026-01-10T10:00:00Z") },
    { id: "a2", type: "match", description: "Updated scorecard for Match 5", userId: editorUser?.id ?? null, userName: "Anita Rana", entityType: "match", entityId: "scl-m5", createdAt: new Date("2026-01-19T18:30:00Z") },
    { id: "a3", type: "team", description: "Added Rajgarh Royals squad", userId: adminUser?.id ?? null, userName: "Rahul Verma", entityType: "team", entityId: "rajgarh-royals", createdAt: new Date("2026-01-12T14:00:00Z") },
    { id: "a4", type: "news", description: "Published registration announcement for Nahan T10 Cup", userId: editorUser?.id ?? null, userName: "Anita Rana", entityType: "news", entityId: "news-3", createdAt: new Date("2026-01-10T09:00:00Z") },
  ];
  for (const a of activityList) {
    if (!(await prisma.activity.findUnique({ where: { id: a.id } }))) {
      await prisma.activity.create({ data: a });
    }
  }

  const counts = {
    users: await prisma.user.count(),
    tournaments: await prisma.tournament.count(),
    teams: await prisma.team.count(),
    players: await prisma.player.count(),
    venues: await prisma.venue.count(),
    tournamentTeams: await prisma.tournamentTeam.count(),
    matches: await prisma.match.count(),
    innings: await prisma.innings.count(),
    battingEntries: await prisma.battingCardEntry.count(),
    bowlingEntries: await prisma.bowlingCardEntry.count(),
    ballEvents: await prisma.ballEvent.count(),
    commentary: await prisma.commentaryEvent.count(),
    news: await prisma.newsArticle.count(),
    gallery: await prisma.galleryItem.count(),
    activities: await prisma.activity.count(),
    settings: await prisma.setting.count(),
  };
  console.log("[seed] Done:", JSON.stringify(counts, null, 2));
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
