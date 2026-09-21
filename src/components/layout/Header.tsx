import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Trophy, Lock } from "lucide-react";
import { cn } from "@/utils/helpers";

const navLinks = [
  { to: "/tournaments", label: "Tournaments" },
  { to: "/matches", label: "Matches" },
  { to: "/teams", label: "Teams" },
  { to: "/players", label: "Players" },
  { to: "/points-table", label: "Points Table" },
  { to: "/stats", label: "Stats" },
  { to: "/records", label: "Records" },
  { to: "/venues", label: "Venues" },
  { to: "/news", label: "News" },
  { to: "/gallery", label: "Gallery" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <div className="brand-icon">
            <Trophy size={24} />
          </div>
          <div className="brand-text">
            <span className="brand-name">Sirmour Cricket League</span>
            <span className="brand-short">SCL</span>
          </div>
        </Link>

        <nav className={cn("nav", open && "nav-open")}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => cn("nav-link", isActive && "nav-link-active")}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/admin"
            className={({ isActive }) => cn("nav-link nav-link-admin inline-flex items-center gap-1.5", isActive && "nav-link-active")}
            onClick={() => setOpen(false)}
          >
            <Lock size={13} />
            <span>Admin</span>
          </NavLink>
        </nav>

        <button
          className="menu-toggle"
          onClick={() => setOpen(!open)}
          type="button"
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
