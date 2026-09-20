-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'editor', 'viewer');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('upcoming', 'registration_open', 'ongoing', 'completed');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('upcoming', 'live', 'completed');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'viewer',
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "season" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "overs" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "status" "TournamentStatus" NOT NULL DEFAULT 'upcoming',
    "description" TEXT NOT NULL DEFAULT '',
    "logoUrl" TEXT,
    "currentStage" TEXT,
    "pointsWin" INTEGER NOT NULL DEFAULT 2,
    "pointsNoResult" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "logoUrl" TEXT,
    "captainId" TEXT,
    "captainName" TEXT,
    "coach" TEXT,
    "foundedYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentTeam" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT,
    "teamId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "jerseyNumber" INTEGER,
    "battingStyle" TEXT,
    "bowlingStyle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "pitchInfo" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "matchNumber" INTEGER NOT NULL,
    "stage" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "time" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "team1Id" TEXT NOT NULL,
    "team2Id" TEXT NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'upcoming',
    "tossWinnerId" TEXT,
    "electedTo" TEXT,
    "resultText" TEXT,
    "winnerTeamId" TEXT,
    "playerOfMatchId" TEXT,
    "target" INTEGER,
    "currentInnings" INTEGER NOT NULL DEFAULT 0,
    "strikerId" TEXT,
    "nonStrikerId" TEXT,
    "bowlerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Innings" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "inningsNumber" INTEGER NOT NULL,
    "battingTeamId" TEXT NOT NULL,
    "bowlingTeamId" TEXT NOT NULL,
    "runs" INTEGER NOT NULL DEFAULT 0,
    "wickets" INTEGER NOT NULL DEFAULT 0,
    "balls" INTEGER NOT NULL DEFAULT 0,
    "totalOvers" DOUBLE PRECISION NOT NULL,
    "wides" INTEGER NOT NULL DEFAULT 0,
    "noBalls" INTEGER NOT NULL DEFAULT 0,
    "byes" INTEGER NOT NULL DEFAULT 0,
    "legByes" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "endedByAllOut" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Innings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattingCardEntry" (
    "id" TEXT NOT NULL,
    "inningsId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "battingOrder" INTEGER NOT NULL,
    "runs" INTEGER NOT NULL DEFAULT 0,
    "balls" INTEGER NOT NULL DEFAULT 0,
    "fours" INTEGER NOT NULL DEFAULT 0,
    "sixes" INTEGER NOT NULL DEFAULT 0,
    "dismissalType" TEXT,
    "dismissalText" TEXT,
    "fielderId" TEXT,
    "bowlerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BattingCardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BowlingCardEntry" (
    "id" TEXT NOT NULL,
    "inningsId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "balls" INTEGER NOT NULL DEFAULT 0,
    "maidens" INTEGER NOT NULL DEFAULT 0,
    "runsConceded" INTEGER NOT NULL DEFAULT 0,
    "wickets" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BowlingCardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BallEvent" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "inningsId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "overNumber" INTEGER NOT NULL,
    "ballInOver" INTEGER NOT NULL,
    "runs" INTEGER NOT NULL DEFAULT 0,
    "isWide" BOOLEAN NOT NULL DEFAULT false,
    "isNoBall" BOOLEAN NOT NULL DEFAULT false,
    "byeRuns" INTEGER NOT NULL DEFAULT 0,
    "legByeRuns" INTEGER NOT NULL DEFAULT 0,
    "isWicket" BOOLEAN NOT NULL DEFAULT false,
    "wicketType" TEXT,
    "dismissedPlayerId" TEXT,
    "fielderId" TEXT,
    "strikerId" TEXT NOT NULL,
    "nonStrikerId" TEXT NOT NULL,
    "bowlerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BallEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentaryEvent" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "inningsId" TEXT NOT NULL,
    "over" INTEGER NOT NULL,
    "ball" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "runs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentaryEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "tournamentId" TEXT,
    "imageUrl" TEXT,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "author" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "tournamentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentTeam_tournamentId_teamId_key" ON "TournamentTeam"("tournamentId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_tournamentId_matchNumber_key" ON "Match"("tournamentId", "matchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Innings_matchId_inningsNumber_key" ON "Innings"("matchId", "inningsNumber");

-- CreateIndex
CREATE UNIQUE INDEX "BattingCardEntry_inningsId_playerId_key" ON "BattingCardEntry"("inningsId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "BowlingCardEntry_inningsId_playerId_key" ON "BowlingCardEntry"("inningsId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "BallEvent_inningsId_sequence_key" ON "BallEvent"("inningsId", "sequence");

-- AddForeignKey
ALTER TABLE "TournamentTeam" ADD CONSTRAINT "TournamentTeam_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentTeam" ADD CONSTRAINT "TournamentTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_team1Id_fkey" FOREIGN KEY ("team1Id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_team2Id_fkey" FOREIGN KEY ("team2Id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Innings" ADD CONSTRAINT "Innings_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Innings" ADD CONSTRAINT "Innings_battingTeamId_fkey" FOREIGN KEY ("battingTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattingCardEntry" ADD CONSTRAINT "BattingCardEntry_inningsId_fkey" FOREIGN KEY ("inningsId") REFERENCES "Innings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattingCardEntry" ADD CONSTRAINT "BattingCardEntry_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BowlingCardEntry" ADD CONSTRAINT "BowlingCardEntry_inningsId_fkey" FOREIGN KEY ("inningsId") REFERENCES "Innings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BowlingCardEntry" ADD CONSTRAINT "BowlingCardEntry_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BallEvent" ADD CONSTRAINT "BallEvent_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BallEvent" ADD CONSTRAINT "BallEvent_inningsId_fkey" FOREIGN KEY ("inningsId") REFERENCES "Innings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentaryEvent" ADD CONSTRAINT "CommentaryEvent_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentaryEvent" ADD CONSTRAINT "CommentaryEvent_inningsId_fkey" FOREIGN KEY ("inningsId") REFERENCES "Innings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsArticle" ADD CONSTRAINT "NewsArticle_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
