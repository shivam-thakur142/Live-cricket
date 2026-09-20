import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
