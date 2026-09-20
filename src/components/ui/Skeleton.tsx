import { cn } from "@/utils/helpers";

interface SkeletonProps {
  className?: string;
  circle?: boolean;
}

export function Skeleton({ className, circle }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton", circle && "skeleton-circle", className)}
    />
  );
}
