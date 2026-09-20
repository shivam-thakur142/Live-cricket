import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { MainLayout } from "@/components/layout/MainLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Home } from "@/pages/public/Home";
import { Tournaments } from "@/pages/public/Tournaments";
import { TournamentDetail } from "@/pages/public/TournamentDetail";
import { Matches } from "@/pages/public/Matches";
import { MatchDetail } from "@/pages/public/MatchDetail";
import { LiveMatches } from "@/pages/public/LiveMatches";
import { Teams } from "@/pages/public/Teams";
import { TeamDetail } from "@/pages/public/TeamDetail";
import { Players } from "@/pages/public/Players";
import { PlayerDetail } from "@/pages/public/PlayerDetail";
import { PointsTablePage } from "@/pages/public/PointsTablePage";
import { StatsPage } from "@/pages/public/StatsPage";
import { RecordsPage } from "@/pages/public/RecordsPage";
import { Venues } from "@/pages/public/Venues";
import { VenueDetail } from "@/pages/public/VenueDetail";
import { News } from "@/pages/public/News";
import { NewsDetail } from "@/pages/public/NewsDetail";
import { Gallery } from "@/pages/public/Gallery";
import { NotFound } from "@/pages/public/NotFound";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminTournaments } from "@/pages/admin/AdminTournaments";
import { AdminTeams } from "@/pages/admin/AdminTeams";
import { AdminPlayers } from "@/pages/admin/AdminPlayers";
import { AdminMatches } from "@/pages/admin/AdminMatches";
import { AdminVenues } from "@/pages/admin/AdminVenues";
import { AdminNews } from "@/pages/admin/AdminNews";
import { AdminGallery } from "@/pages/admin/AdminGallery";
import { AdminUsers } from "@/pages/admin/AdminUsers";
import { AdminSettings } from "@/pages/admin/AdminSettings";

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="tournaments" element={<Tournaments />} />
            <Route path="tournaments/:id" element={<TournamentDetail />} />
            <Route path="matches" element={<Matches />} />
            <Route path="matches/:id" element={<MatchDetail />} />
            <Route path="live-matches" element={<LiveMatches />} />
            <Route path="teams" element={<Teams />} />
            <Route path="teams/:id" element={<TeamDetail />} />
            <Route path="players" element={<Players />} />
            <Route path="players/:id" element={<PlayerDetail />} />
            <Route path="points-table" element={<PointsTablePage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="records" element={<RecordsPage />} />
            <Route path="venues" element={<Venues />} />
            <Route path="venues/:id" element={<VenueDetail />} />
            <Route path="news" element={<News />} />
            <Route path="news/:id" element={<NewsDetail />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="tournaments" element={<AdminTournaments />} />
            <Route path="teams" element={<AdminTeams />} />
            <Route path="players" element={<AdminPlayers />} />
            <Route path="matches" element={<AdminMatches />} />
            <Route path="venues" element={<AdminVenues />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
