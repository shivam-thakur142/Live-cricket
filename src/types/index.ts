export type TournamentStatus =
  | "upcoming"
  | "registration_open"
  | "ongoing"
  | "completed";

export type MatchStatus = "upcoming" | "live" | "completed";

export type MatchStage =
  | "League"
  | "Group Stage"
  | "Qualifier"
  | "Eliminator"
  | "Quarter Final"
  | "Semi Final"
  | "Final";

export type PlayerRole =
  | "Batsman"
  | "Bowler"
  | "All-rounder"
  | "Wicket-keeper";

export type NewsCategory =
  | "Match Report"
  | "Announcement"
  | "Tournament News"
  | "Team News"
  | "Player News";

export type GalleryCategory =
  | "Match"
  | "Team"
  | "Trophy"
  | "Ground"
  | "Moment";

export type UserRole = "admin" | "editor" | "viewer";

export interface Tournament {
  id: string;
  name: string;
  shortName?: string;
  season: string;
  format: string;
  overs: number;
  location: string;
  startDate: string;
  endDate: string;
  status: TournamentStatus;
  description: string;
  logoUrl?: string;
  currentStage?: MatchStage | string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logoUrl?: string;
  captainId?: string;
  captainName?: string;
  coach?: string;
  foundedYear?: number;
}

export interface TournamentTeam {
  id: string;
  tournamentId: string;
  teamId: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  noResult: number;
  points: number;
  nrr: number;
}

export interface Player {
  id: string;
  name: string;
  photoUrl?: string;
  teamId: string;
  role: PlayerRole;
  jerseyNumber?: number;
  battingStyle?: string;
  bowlingStyle?: string;
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  address: string;
  capacity: number;
  pitchInfo: string;
  matchesHosted: number;
  imageUrl?: string;
}

export interface BattingLineup {
  playerId: string;
  playerName: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  dismissal: string;
}

export interface BowlingLineup {
  playerId: string;
  playerName: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
}

export interface Extras {
  wides: number;
  noBalls: number;
  byes: number;
  legByes: number;
  total: number;
}

export interface Innings {
  teamId: string;
  runs: number;
  wickets: number;
  overs: number;
  totalOvers: number;
  batting: BattingLineup[];
  bowling: BowlingLineup[];
  extras: Extras;
}

export interface Ball {
  over: number;
  ball: number;
  runs: number;
  isWicket: boolean;
  wicketText?: string;
  isWide: boolean;
  isNoBall: boolean;
}

export interface FallOfWicket {
  wicket: number;
  runs: number;
  over: number;
  playerName: string;
}

export interface Partnership {
  runs: number;
  balls: number;
  batsman1Id: string;
  batsman1Name: string;
  batsman2Id: string;
  batsman2Name: string;
}

export interface CommentaryEvent {
  id: string;
  over: number;
  ball: number;
  type: "run" | "boundary" | "wicket" | "dot" | "extra";
  text: string;
  runs?: number;
}

export interface Match {
  id: string;
  tournamentId: string;
  matchNumber: number;
  stage: MatchStage;
  date: string;
  time: string;
  venueId: string;
  team1Id: string;
  team2Id: string;
  status: MatchStatus;
  tossWinnerId?: string;
  electedTo?: "bat" | "field";
  resultText?: string;
  playerOfMatchId?: string;
  innings?: Innings[];
  recentBalls?: Ball[];
  strikerId?: string;
  strikerName?: string;
  nonStrikerId?: string;
  nonStrikerName?: string;
  bowlerId?: string;
  bowlerName?: string;
  target?: number;
  currentPartnership?: Partnership;
  fallOfWickets?: FallOfWicket[];
  commentary?: CommentaryEvent[];
}

export interface PointsTableEntry {
  tournamentId: string;
  position: number;
  teamId: string;
  played: number;
  won: number;
  lost: number;
  nr: number;
  points: number;
  nrr: number;
}

export interface PlayerBattingStats {
  playerId: string;
  tournamentId: string;
  matches: number;
  innings: number;
  notOuts: number;
  runs: number;
  balls: number;
  highestScore: number;
  highestScoreNotOut: boolean;
  average: number;
  strikeRate: number;
  fours: number;
  sixes: number;
  ducks: number;
  fifties: number;
  hundreds: number;
}

export interface PlayerBowlingStats {
  playerId: string;
  tournamentId: string;
  matches: number;
  innings: number;
  overs: number;
  balls: number;
  maidens: number;
  runs: number;
  wickets: number;
  bestFigures: string;
  economy: number;
  average: number;
  strikeRate: number;
  fourWickets: number;
  fiveWickets: number;
}

export interface PlayerFieldingStats {
  playerId: string;
  tournamentId: string;
  matches: number;
  catches: number;
  runOuts: number;
  stumpings: number;
}

export interface TournamentRecord {
  id: string;
  tournamentId?: string;
  category:
    | "Highest Team Score"
    | "Lowest Team Score"
    | "Highest Individual Score"
    | "Best Bowling Figures"
    | "Most Sixes in an Innings"
    | "Most Runs in a Tournament"
    | "Most Wickets in a Tournament"
    | "Fastest Fifty"
    | "Fastest Hundred";
  value: string;
  holderId?: string;
  holderName: string;
  holderType: "player" | "team";
  matchId?: string;
  date?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  category: NewsCategory;
  date: string;
  tournamentId?: string;
  imageUrl?: string;
  excerpt: string;
  content: string;
  author?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: GalleryCategory;
  imageUrl: string;
  tournamentId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user?: string;
}
