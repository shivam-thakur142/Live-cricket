import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { Empty } from "@/components/ui/Empty";
import { FilterBar } from "@/components/shared/FilterBar";
import { formatDate } from "@/utils/helpers";
import * as api from "@/services/api";
import type { NewsArticle, Tournament } from "@/types";

export function News() {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [category, setCategory] = useState("all");
  const [tournamentFilter, setTournamentFilter] = useState("all");

  useEffect(() => {
    Promise.all([api.getNews(), api.getTournaments()]).then(([n, t]) => {
      setArticles(n);
      setTournaments(t);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const catOk = category === "all" || a.category === category;
      const tourOk = tournamentFilter === "all" || a.tournamentId === tournamentFilter;
      return catOk && tourOk;
    });
  }, [articles, category, tournamentFilter]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  if (loading) return <Loading />;

  return (
    <div className="container page">
      <div className="page-header">
        <h1>News</h1>
        <p>Latest updates, match reports, and announcements.</p>
      </div>
      <FilterBar
        filters={[
          {
            label: "Category",
            value: category,
            options: [
              { value: "all", label: "All Categories" },
              { value: "Match Report", label: "Match Report" },
              { value: "Announcement", label: "Announcement" },
              { value: "Tournament News", label: "Tournament News" },
              { value: "Team News", label: "Team News" },
              { value: "Player News", label: "Player News" },
            ],
            onChange: setCategory,
          },
          {
            label: "Tournament",
            value: tournamentFilter,
            options: [{ value: "all", label: "All Tournaments" }, ...tournaments.map((t) => ({ value: t.id, label: t.name }))],
            onChange: setTournamentFilter,
          },
        ]}
      />
      {filtered.length === 0 ? (
        <Empty message="No articles found." />
      ) : (
        <>
          {featured && <FeaturedArticle article={featured} />}
          <div className="grid grid-3">
            {rest.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FeaturedArticle({ article }: { article: NewsArticle }) {
  return (
    <Card className="featured-article">
      <div className="featured-image placeholder" />
      <div className="featured-body">
        <span className="news-category">{article.category}</span>
        <h2>{article.title}</h2>
        <p>{article.excerpt}</p>
        <div className="featured-footer">
          <span>{formatDate(article.date)}</span>
          <Link to={`/news/${article.id}`}>Read article</Link>
        </div>
      </div>
    </Card>
  );
}

function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <Card className="news-card">
      <span className="news-category">{article.category}</span>
      <h4>{article.title}</h4>
      <p className="news-excerpt">{article.excerpt}</p>
      <div className="news-footer">
        <span>{formatDate(article.date)}</span>
        <Link to={`/news/${article.id}`}>Read more</Link>
      </div>
    </Card>
  );
}
