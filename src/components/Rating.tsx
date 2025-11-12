import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

export const Rating = ({ 
  rating, 
  maxRating = 5, 
  size = "md",
  showValue = false,
  className 
}: RatingProps) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const fillPercentage = Math.min(Math.max(rating - index, 0), 1);
        return (
          <div key={index} className="relative">
            <Star className={cn(sizeClasses[size], "text-muted-foreground")} />
            <div 
              className="absolute inset-0 overflow-hidden" 
              style={{ width: `${fillPercentage * 100}%` }}
            >
              <Star className={cn(sizeClasses[size], "fill-yellow-400 text-yellow-400")} />
            </div>
          </div>
        );
      })}
      {showValue && (
        <span className="text-sm font-medium ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
