import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { Empty } from "@/components/ui/Empty";
import { FilterBar } from "@/components/shared/FilterBar";
import type { Venue } from "@/types";
import * as api from "@/services/api";

export function Venues() {
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.getVenues().then((data) => {
      setVenues(data);
      setLoading(false);
    });
  }, []);

  const filtered = venues.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.location.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Venues</h1>
        <p>Local cricket grounds hosting SCL tournaments.</p>
      </div>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search venues..."
      />
      {filtered.length === 0 ? (
        <Empty message="No venues found." />
      ) : (
        <div className="grid grid-2">
          {filtered.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      )}
    </div>
  );
}

function VenueCard({ venue }: { venue: Venue }) {
  return (
    <Card className="venue-card">
      <div className="venue-image placeholder">
        <MapPin size={48} />
      </div>
      <div className="venue-body">
        <h3>{venue.name}</h3>
        <p><MapPin size={16} /> {venue.location}</p>
        <p><Users size={16} /> Capacity {venue.capacity.toLocaleString()} &middot; {venue.matchesHosted} matches hosted</p>
        <p className="venue-pitch">{venue.pitchInfo}</p>
        <Link to={`/venues/${venue.id}`} className="card-link">View Details</Link>
      </div>
    </Card>
  );
}
