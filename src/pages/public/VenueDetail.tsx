import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Users, Calendar } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { Empty } from "@/components/ui/Empty";
import { MatchCard } from "@/components/shared/MatchCard";
import * as api from "@/services/api";
import type { Match, Venue } from "@/types";

export function VenueDetail() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [venue, setVenue] = useState<Venue | undefined>();
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([api.getVenueById(id), api.getMatches()]).then(([v, m]) => {
      setVenue(v);
      setMatches(m.filter((match) => match.venueId === id));
      setLoading(false);
    });
  }, [id]);

  if (loading) return <Loading />;
  if (!venue) return <Empty message="Venue not found." />;

  return (
    <div className="container page">
      <Link to="/venues" className="back-link"><ArrowLeft size={18} /> Back to venues</Link>

      <div className="venue-hero">
        <div className="venue-hero-image placeholder">
          <MapPin size={64} />
        </div>
        <div className="venue-hero-info">
          <h1>{venue.name}</h1>
          <p><MapPin size={18} /> {venue.address}</p>
          <div className="venue-hero-meta">
            <span><Users size={16} /> Capacity {venue.capacity.toLocaleString()}</span>
            <span><Calendar size={16} /> {venue.matchesHosted} matches hosted</span>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <Card>
          <h3>Pitch Information</h3>
          <p>{venue.pitchInfo}</p>
        </Card>
        <Card>
          <h3>Location</h3>
          <p>{venue.address}</p>
        </Card>
      </div>

      <section className="section">
        <h3>Matches at this venue</h3>
        {matches.length === 0 ? (
          <Empty message="No matches scheduled at this venue." />
        ) : (
          <div className="grid grid-2">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
