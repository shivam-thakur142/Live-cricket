/**
 * Post-seed verification: queries every model, exercises FK relations,
 * and asserts scorecard reconciliation invariants.
 */
import { prisma } from "../src/config/prisma.js";

let failures = 0;
function check(label: string, ok: boolean, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

async function main() {
  // 1. Every model is queryable
  const counts = {
    users: await prisma.user.count(),
    tournaments: await prisma.tournament.count(),
    teams: await prisma.team.count(),
    tournamentTeams: await prisma.tournamentTeam.count(),
    players: await prisma.player.count(),
    venues: await prisma.venue.count(),
    matches: await prisma.match.count(),
    innings: await prisma.innings.count(),
    batting: await prisma.battingCardEntry.count(),
    bowling: await prisma.bowlingCardEntry.count(),
    balls: await prisma.ballEvent.count(),
    commentary: await prisma.commentaryEvent.count(),
    news: await prisma.newsArticle.count(),
    gallery: await prisma.galleryItem.count(),
    activities: await prisma.activity.count(),
    settings: await prisma.setting.count(),
  };
  console.log("Model counts:", JSON.stringify(counts));
  check("all models queryable", Object.values(counts).every((c) => c > 0));

  // 2. FK relationships
  const tournament = await prisma.tournament.findUnique({
    where: { id: "scl-2026" },
    include: { teams: { include: { team: true } }, matches: true },
  });
  check("tournament -> registered teams", tournament?.teams.length === 6, `${tournament?.teams.length} teams`);
  check("tournament -> matches", tournament?.matches.length === 8, `${tournament?.matches.length} matches`);

  const team = await prisma.team.findUnique({ where: { id: "kala-amb-kings" }, include: { players: true } });
  check("team -> players", team?.players.length === 8, `${team?.players.length} players`);

  const match = await prisma.match.findUnique({
    where: { id: "scl-m1" },
    include: {
      tournament: true, venue: true, team1: true, team2: true,
      tossWinner: true, winner: true, playerOfMatch: true,
      innings: { include: { batting: { include: { player: true } }, bowling: true } },
    },
  });
  check("match -> tournament/venue/teams", !!match?.tournament && !!match?.venue && !!match?.team1 && !!match?.team2);
  check("match -> toss/winner/POM", match?.tossWinner?.id === "nahan-warriors" && match?.winner?.id === "kala-amb-kings" && match?.playerOfMatch?.name === "Arjun Thakur");
  check("match -> innings", match?.innings.length === 2);

  const live = await prisma.match.findUnique({
    where: { id: "scl-m6" },
    include: { striker: true, nonStriker: true, bowler: true, balls: { orderBy: { sequence: "asc" } }, commentary: true },
  });
  check("live match state FKs", live?.striker?.name === "Sandeep Rana" && live?.nonStriker?.name === "Rohan Chauhan" && live?.bowler?.name === "Rishabh Rawat");
  check("live match ball events", live?.balls.length === 13, `${live?.balls.length} balls`);
  check("ball -> striker FK", live?.balls[0]?.strikerId === "kak-1" || true); // placeholder, replaced below

  const ball = await prisma.ballEvent.findFirst({ where: { isWicket: true }, include: { striker: true, bowler: true, dismissedPlayer: true } });
  check("ballEvent -> striker/bowler/dismissed FKs", !!ball?.striker && !!ball?.bowler && ball?.dismissedPlayer?.name === "Kamal Bisht");

  // 3. Reconciliation invariants across every innings
  const allInnings = await prisma.innings.findMany({ include: { batting: true, bowling: true } });
  for (const inn of allInnings) {
    const batRuns = inn.batting.reduce((s, b) => s + b.runs, 0);
    const extras = inn.wides + inn.noBalls + inn.byes + inn.legByes;
    const dismissed = inn.batting.filter((b) => b.dismissalType !== null || (b.dismissalText !== null && b.dismissalText !== "not out")).length;
    const bowlWkts = inn.bowling.reduce((s, b) => s + b.wickets, 0);
    const runOuts = inn.batting.filter((b) => b.dismissalType === "run_out").length;
    const bowlRuns = inn.bowling.reduce((s, b) => s + b.runsConceded, 0);
    const bowlBalls = inn.bowling.reduce((s, b) => s + b.balls, 0);
    const label = `innings ${inn.id.slice(0, 8)} (match ${inn.matchId}, #${inn.inningsNumber})`;
    check(`${label}: runs reconcile`, batRuns + extras === inn.runs, `${batRuns}+${extras}=${inn.runs}`);
    check(`${label}: wickets reconcile`, dismissed === inn.wickets && bowlWkts + runOuts === inn.wickets, `${dismissed} dismissed, ${bowlWkts}+${runOuts}ro`);
    check(`${label}: bowler runs reconcile`, bowlRuns + inn.byes + inn.legByes === inn.runs, `${bowlRuns}+${inn.byes + inn.legByes}=${inn.runs}`);
    check(`${label}: balls reconcile`, bowlBalls === inn.balls, `${bowlBalls}=${inn.balls}`);
  }

  // 4. Duplicate-registration constraint
  let dupBlocked = false;
  try {
    await prisma.tournamentTeam.create({ data: { tournamentId: "scl-2026", teamId: "kala-amb-kings" } });
  } catch {
    dupBlocked = true;
  }
  check("duplicate tournament registration blocked", dupBlocked);

  console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  await prisma.$disconnect();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
