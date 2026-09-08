import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  count,
  size = 16,
  className,
}: {
  value: number;
  count?: number;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)} aria-label={`Рейтинг ${value.toFixed(1)} из 5`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= Math.round(value) ? "fill-accent text-accent" : "fill-muted text-muted"}
          />
        ))}
      </div>
      {typeof count === "number" && <span className="text-xs text-muted-foreground">({count})</span>}
    </div>
  );
}
