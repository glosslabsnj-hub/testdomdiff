import { Lock, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface UnlockCondition {
  type: "week" | "action" | "tier";
  value: number | string;
  label: string;
}

interface LockedFeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  unlockCondition: UnlockCondition;
  upgradeHref?: string;
  isPremium?: boolean;
  className?: string;
}

export function LockedFeatureCard({
  title,
  description,
  icon: Icon,
  unlockCondition,
  upgradeHref = "/checkout",
  isPremium = false,
  className,
}: LockedFeatureCardProps) {
  const getUnlockMessage = () => {
    switch (unlockCondition.type) {
      case "week":
        return `Unlocks Week ${unlockCondition.value}`;
      case "action":
        return unlockCondition.label;
      case "tier":
        return `Available in ${unlockCondition.label}`;
      default:
        return "Coming soon";
    }
  };

  return (
    <div
      className={cn(
        "relative p-4 rounded-xl border transition-all",
        isPremium 
          ? "bg-gradient-to-br from-crimson/10 to-crimson/5 border-crimson/30" 
          : "bg-charcoal/30 border-border/50",
        "opacity-75 hover:opacity-90",
        className
      )}
    >
      {/* Lock overlay */}
      <div className="absolute inset-0 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-10">
        <div className={cn(
          "flex flex-col items-center gap-2 p-4 rounded-lg",
          isPremium ? "bg-crimson/20" : "bg-charcoal/80"
        )}>
          <Lock className={cn(
            "w-6 h-6",
            isPremium ? "text-crimson" : "text-muted-foreground"
          )} />
          <span className={cn(
            "text-xs font-medium text-center",
            isPremium ? "text-crimson" : "text-muted-foreground"
          )}>
            {getUnlockMessage()}
          </span>
        </div>
      </div>

      {/* Card content (blurred behind lock) */}
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
          isPremium ? "bg-crimson/20" : "bg-muted/50"
        )}>
          <Icon className={cn(
            "w-5 h-5",
            isPremium ? "text-crimson/50" : "text-muted-foreground/50"
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-muted-foreground/50">{title}</h3>
          <p className="text-xs text-muted-foreground/30 line-clamp-2">{description}</p>
        </div>
      </div>

      {/* Upgrade CTA for premium features */}
      {isPremium && unlockCondition.type === "tier" && (
        <Link
          to={upgradeHref}
          className="absolute bottom-3 right-3 z-20 flex items-center gap-1 px-2 py-1 rounded-md bg-crimson/20 text-crimson text-xs font-medium hover:bg-crimson/30 transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          Upgrade
          <ChevronRight className="w-3 h-3" />
        </Link>
      )}
      
      {/* Premium badge */}
      {isPremium && (
        <div className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-full bg-crimson/20 border border-crimson/30">
          <span className="text-[10px] font-bold text-crimson uppercase tracking-wider">
            Free World
          </span>
        </div>
      )}
    </div>
  );
}

export default LockedFeatureCard;
