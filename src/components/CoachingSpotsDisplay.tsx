import { Users, AlertTriangle, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCoachingSpots } from "@/hooks/useCoachingSpots";
import { cn } from "@/lib/utils";

interface CoachingSpotsDisplayProps {
  variant?: "badge" | "banner" | "compact";
  className?: string;
}

export function CoachingSpotsDisplay({ variant = "badge", className }: CoachingSpotsDisplayProps) {
  const { availableSpots, totalSpots, isFull, loading } = useCoachingSpots();

  if (loading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-6 w-24 bg-muted rounded" />
      </div>
    );
  }

  // Urgency levels based on remaining spots
  const isLow = availableSpots <= 2 && !isFull;
  const isCritical = availableSpots === 1;

  if (variant === "badge") {
    if (isFull) {
      return (
        <Badge className={cn("bg-crimson/20 text-crimson border-crimson/30", className)}>
          <AlertTriangle className="w-3 h-3 mr-1" />
          Waitlist Only
        </Badge>
      );
    }

    return (
      <Badge
        className={cn(
          "transition-all",
          isCritical
            ? "bg-crimson/20 text-crimson border-crimson/30 animate-pulse"
            : isLow
            ? "bg-warning/20 text-warning border-warning/30"
            : "bg-primary/20 text-primary border-primary/30",
          className
        )}
      >
        <Users className="w-3 h-3 mr-1" />
        {availableSpots} of {totalSpots} Spots
      </Badge>
    );
  }

  if (variant === "banner") {
    if (isFull) {
      return (
        <div className={cn(
          "flex items-center gap-3 p-4 rounded-lg bg-crimson/10 border border-crimson/30",
          className
        )}>
          <AlertTriangle className="w-5 h-5 text-crimson flex-shrink-0" />
          <div>
            <p className="font-semibold text-crimson">All {totalSpots} spots are filled</p>
            <p className="text-sm text-muted-foreground">Join the waitlist to be notified first.</p>
          </div>
        </div>
      );
    }

    return (
      <div className={cn(
        "flex items-center gap-3 p-4 rounded-lg border transition-all",
        isCritical
          ? "bg-crimson/10 border-crimson/30"
          : isLow
          ? "bg-warning/10 border-warning/30"
          : "bg-primary/10 border-primary/30",
        className
      )}>
        <Crown className={cn(
          "w-5 h-5 flex-shrink-0",
          isCritical ? "text-crimson" : isLow ? "text-warning" : "text-primary"
        )} />
        <div>
          <p className={cn(
            "font-semibold",
            isCritical ? "text-crimson" : isLow ? "text-warning" : "text-primary"
          )}>
            {isCritical ? "Only 1 spot left!" : `${availableSpots} of ${totalSpots} spots available`}
          </p>
          <p className="text-sm text-muted-foreground">
            {isCritical ? "Secure your spot before it's gone." : "Limited to ensure quality coaching."}
          </p>
        </div>
      </div>
    );
  }

  // Compact variant
  return (
    <span className={cn(
      "text-sm font-medium",
      isFull ? "text-crimson" : isLow ? "text-warning" : "text-primary",
      className
    )}>
      {isFull ? "Waitlist Only" : `${availableSpots}/${totalSpots} spots`}
    </span>
  );
}

export default CoachingSpotsDisplay;
