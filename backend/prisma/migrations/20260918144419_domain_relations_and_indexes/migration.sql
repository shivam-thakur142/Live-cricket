-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "Activity"("createdAt");

-- CreateIndex
CREATE INDEX "BallEvent_matchId_idx" ON "BallEvent"("matchId");

-- CreateIndex
CREATE INDEX "BattingCardEntry_playerId_idx" ON "BattingCardEntry"("playerId");

-- CreateIndex
CREATE INDEX "BowlingCardEntry_playerId_idx" ON "BowlingCardEntry"("playerId");

-- CreateIndex
CREATE INDEX "CommentaryEvent_matchId_idx" ON "CommentaryEvent"("matchId");

-- CreateIndex
CREATE INDEX "GalleryItem_tournamentId_idx" ON "GalleryItem"("tournamentId");

-- CreateIndex
CREATE INDEX "Innings_battingTeamId_idx" ON "Innings"("battingTeamId");

-- CreateIndex
CREATE INDEX "Match_tournamentId_idx" ON "Match"("tournamentId");

-- CreateIndex
CREATE INDEX "Match_venueId_idx" ON "Match"("venueId");

-- CreateIndex
CREATE INDEX "Match_team1Id_idx" ON "Match"("team1Id");

-- CreateIndex
CREATE INDEX "Match_team2Id_idx" ON "Match"("team2Id");

-- CreateIndex
CREATE INDEX "Match_status_idx" ON "Match"("status");

-- CreateIndex
CREATE INDEX "Match_date_idx" ON "Match"("date");

-- CreateIndex
CREATE INDEX "NewsArticle_tournamentId_idx" ON "NewsArticle"("tournamentId");

-- CreateIndex
CREATE INDEX "NewsArticle_date_idx" ON "NewsArticle"("date");

-- CreateIndex
CREATE INDEX "Player_teamId_idx" ON "Player"("teamId");

-- CreateIndex
CREATE INDEX "TournamentTeam_teamId_idx" ON "TournamentTeam"("teamId");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_tossWinnerId_fkey" FOREIGN KEY ("tossWinnerId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winnerTeamId_fkey" FOREIGN KEY ("winnerTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_playerOfMatchId_fkey" FOREIGN KEY ("playerOfMatchId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_strikerId_fkey" FOREIGN KEY ("strikerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_nonStrikerId_fkey" FOREIGN KEY ("nonStrikerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_bowlerId_fkey" FOREIGN KEY ("bowlerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Innings" ADD CONSTRAINT "Innings_bowlingTeamId_fkey" FOREIGN KEY ("bowlingTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattingCardEntry" ADD CONSTRAINT "BattingCardEntry_fielderId_fkey" FOREIGN KEY ("fielderId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattingCardEntry" ADD CONSTRAINT "BattingCardEntry_bowlerId_fkey" FOREIGN KEY ("bowlerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BallEvent" ADD CONSTRAINT "BallEvent_strikerId_fkey" FOREIGN KEY ("strikerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BallEvent" ADD CONSTRAINT "BallEvent_nonStrikerId_fkey" FOREIGN KEY ("nonStrikerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BallEvent" ADD CONSTRAINT "BallEvent_bowlerId_fkey" FOREIGN KEY ("bowlerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BallEvent" ADD CONSTRAINT "BallEvent_dismissedPlayerId_fkey" FOREIGN KEY ("dismissedPlayerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BallEvent" ADD CONSTRAINT "BallEvent_fielderId_fkey" FOREIGN KEY ("fielderId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
