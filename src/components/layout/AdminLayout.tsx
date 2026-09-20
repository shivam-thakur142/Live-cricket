import { useEffect, useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { Trophy, LayoutDashboard, Users, User, CalendarDays, MapPin, Newspaper, Image, Shield, Settings, Menu, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/helpers";
import { ensureAdminToken, getStoredUser } from "@/services/api";

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/tournaments", label: "Tournaments", icon: Trophy },
  { to: "/admin/teams", label: "Teams", icon: Users },
  { to: "/admin/players", label: "Players", icon: User },
  { to: "/admin/matches", label: "Matches", icon: CalendarDays },
  { to: "/admin/venues", label: "Venues", icon: MapPin },
  { to: "/admin/news", label: "News", icon: Newspaper },
  { to: "/admin/gallery", label: "Gallery", icon: Image },
  { to: "/admin/users", label: "Users", icon: Shield },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(getStoredUser());

  useEffect(() => {
    void ensureAdminToken().then(() => {
      setCurrentUser(getStoredUser());
    });
  }, []);

  return (
    <div className="admin-layout">
      <aside className={cn("admin-sidebar", sidebarOpen && "admin-sidebar-open")}>
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-brand">
            <Trophy size={22} />
            <span>SCL Admin</span>
          </Link>
          <button
            className="admin-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            type="button"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="admin-nav">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/admin"}
              className={({ isActive }) => cn("admin-nav-link", isActive && "admin-nav-link-active")}
              onClick={() => setSidebarOpen(false)}
            >
              <link.icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-menu-toggle"
            onClick={() => setSidebarOpen(true)}
            type="button"
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>
          <div className="admin-topbar-title">Admin Panel</div>
          <div className="flex items-center gap-3">
            {currentUser && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={13} />
                <span>{currentUser.name} ({currentUser.role})</span>
              </span>
            )}
            <Link to="/" className="admin-back-link">Back to site</Link>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
