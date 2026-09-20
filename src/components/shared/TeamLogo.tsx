import { Logo } from "./Logo";

interface TeamLogoProps {
  name: string;
  url?: string;
  size?: number;
}

export function TeamLogo({ name, url, size = 40 }: TeamLogoProps) {
  return <Logo name={name} url={url} size={size} className="team-logo" />;
}
