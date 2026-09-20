import { generateLogo, cn } from "@/utils/helpers";

interface LogoProps {
  name: string;
  url?: string;
  size?: number;
  className?: string;
}

export function Logo({ name, url, size = 48, className }: LogoProps) {
  return (
    <img
      src={url || generateLogo(name)}
      alt={name}
      className={cn("logo", className)}
      width={size}
      height={size}
    />
  );
}
