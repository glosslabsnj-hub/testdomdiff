import { 
  Trophy, Star, Award, Crown, Flame, Clock, Calendar, 
  CheckCircle, ClipboardCheck, Droplet, Medal, Lock 
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MilestoneBadgeProps {
  icon: string;
  name: string;
  description?: string;
  earned?: boolean;
  earnedAt?: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  featured?: boolean;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Trophy,
  Star,
  Award,
  Crown,
  Flame,
  Clock,
  Calendar,
  CheckCircle,
  ClipboardCheck,
  Droplet,
  Medal,
  Lock,
};

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

const iconSizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export default function MilestoneBadge({
  icon,
  name,
  description,
  earned = true,
  earnedAt,
  size = "md",
  showTooltip = true,
  featured = false,
  className,
}: MilestoneBadgeProps) {
  const IconComponent = iconMap[icon] || Trophy;
  
  const badge = (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full transition-all duration-300",
        sizeClasses[size],
        earned
          ? featured
            ? "bg-gradient-to-br from-primary via-amber-400 to-primary text-primary-foreground shadow-lg shadow-primary/40"
            : "bg-primary/20 text-primary border border-primary/30"
          : "bg-charcoal text-muted-foreground/50 border border-border",
        earned && !featured && "hover:bg-primary/30 hover:border-primary/50",
        featured && "animate-pulse ring-2 ring-primary/50 ring-offset-2 ring-offset-background",
        className
      )}
    >
      {earned ? (
        <IconComponent className={cn(iconSizeClasses[size], featured && "text-primary-foreground")} />
      ) : (
        <Lock className={cn(iconSizeClasses[size], "opacity-50")} />
      )}
      
      {/* Glow effect for featured */}
      {featured && earned && (
        <div className="absolute inset-0 rounded-full bg-primary/30 blur-md -z-10" />
      )}
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {badge}
      </TooltipTrigger>
      <TooltipContent 
        side="top" 
        className="bg-charcoal border-border max-w-[200px] text-center"
      >
        <p className={cn("font-semibold", earned ? "text-primary" : "text-muted-foreground")}>
          {earned ? name : `🔒 ${name}`}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {earned && earnedAt && (
          <p className="text-xs text-muted-foreground/70 mt-1">
            Earned {new Date(earnedAt).toLocaleDateString()}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

// Grid component for displaying multiple badges
interface MilestoneBadgeGridProps {
  milestones: Array<{
    key: string;
    icon: string;
    name: string;
    description: string;
    earned: boolean;
    earnedAt?: string;
  }>;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MilestoneBadgeGrid({ milestones, size = "md", className }: MilestoneBadgeGridProps) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {milestones.map((milestone) => (
        <MilestoneBadge
          key={milestone.key}
          icon={milestone.icon}
          name={milestone.name}
          description={milestone.description}
          earned={milestone.earned}
          earnedAt={milestone.earnedAt}
          size={size}
        />
      ))}
    </div>
  );
}
