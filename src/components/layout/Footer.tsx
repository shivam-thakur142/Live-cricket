import { Link } from "react-router-dom";
import { Trophy, Mail, MapPin, Phone } from "lucide-react";

const links = [
  { to: "/tournaments", label: "Tournaments" },
  { to: "/matches", label: "Matches" },
  { to: "/teams", label: "Teams" },
  { to: "/stats", label: "Stats" },
  { to: "/records", label: "Records" },
  { to: "/venues", label: "Venues" },
  { to: "/news", label: "News" },
  { to: "/gallery", label: "Gallery" },
  { to: "/admin", label: "Admin" },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="footer-brand-header">
            <Trophy size={24} />
            <span>Sirmour Cricket League</span>
          </div>
          <p className="footer-desc">
            The home of competitive local cricket in Sirmour district. Bringing
            together talent, passion, and community spirit.
          </p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            {links.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <ul>
            <li>
              <MapPin size={16} /> Sirmour, Himachal Pradesh
            </li>
            <li>
              <Mail size={16} /> info@sirmourcricketleague.local
            </li>
            <li>
              <Phone size={16} /> +91 98765 43210
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Sirmour Cricket League. All rights reserved.</p>
      </div>
    </footer>
  );
}
