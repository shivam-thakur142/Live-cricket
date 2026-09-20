import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { Empty } from "@/components/ui/Empty";
import { formatDate, getTournamentById } from "@/utils/helpers";
import * as api from "@/services/api";
import type { NewsArticle } from "@/types";

export function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<NewsArticle | undefined>();

  useEffect(() => {
    if (!id) return;
    api.getNewsById(id).then((a) => {
      setArticle(a);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <Loading />;
  if (!article) return <Empty message="Article not found." />;

  const tournament = getTournamentById(article.tournamentId);

  return (
    <div className="container page narrow">
      <Link to="/news" className="back-link"><ArrowLeft size={18} /> Back to news</Link>
      <Card className="article-card">
        <span className="news-category">{article.category}</span>
        <h1>{article.title}</h1>
        <div className="article-meta">
          <span><Calendar size={16} /> {formatDate(article.date)}</span>
          <span><User size={16} /> {article.author ?? "SCL Desk"}</span>
          {tournament && <span>{tournament.name}</span>}
        </div>
        <div className="article-image placeholder" />
        <div className="article-content">
          {article.content.split("\n\n").map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>
      </Card>
    </div>
  );
}
