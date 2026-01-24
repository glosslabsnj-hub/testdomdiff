import { Shield, RefreshCw, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWarden } from "@/hooks/useWarden";
import { cn } from "@/lib/utils";

export function WardenBrief() {
  const { weeklyBrief, briefLoading, briefError, refreshBrief } = useWarden();

  if (briefLoading && !weeklyBrief) {
    return (
      <div className="bg-charcoal-dark border border-gold/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-gold" />
          </div>
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-20 w-full mb-4" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (briefError && !weeklyBrief) {
    return (
      <div className="bg-charcoal-dark border border-destructive/30 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">The Warden</h3>
              <p className="text-sm text-muted-foreground">Unable to load</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={refreshBrief}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-4 text-sm text-destructive">{briefError}</p>
      </div>
    );
  }

  if (!weeklyBrief) return null;

  const focusColors: Record<string, string> = {
    discipline: "bg-gold/10 text-gold border-gold/30",
    workouts: "bg-crimson/10 text-crimson border-crimson/30",
    nutrition: "bg-green-500/10 text-green-400 border-green-500/30",
    faith: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    general: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="bg-charcoal-dark border border-gold/20 rounded-xl p-6 relative overflow-hidden">
      {/* Subtle gold gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold/50 via-gold to-gold/50" />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-gold" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">The Warden</h3>
            <p className="text-sm text-muted-foreground">
              Week {weeklyBrief.week_number} Orders
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={refreshBrief}
          disabled={briefLoading}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={cn("h-4 w-4", briefLoading && "animate-spin")} />
        </Button>
      </div>

      {/* Focus area badge */}
      {weeklyBrief.focus_area && (
        <div className="mb-4">
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-full border",
              focusColors[weeklyBrief.focus_area] || focusColors.general
            )}
          >
            Focus: {weeklyBrief.focus_area.charAt(0).toUpperCase() + weeklyBrief.focus_area.slice(1)}
          </span>
        </div>
      )}

      {/* Main message */}
      <p className="text-foreground leading-relaxed mb-4">
        {weeklyBrief.message}
      </p>

      {/* Scripture if present */}
      {weeklyBrief.scripture_reference && weeklyBrief.scripture_text && (
        <div className="bg-charcoal border border-border rounded-lg p-4 flex gap-3">
          <BookOpen className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground italic mb-1">
              "{weeklyBrief.scripture_text}"
            </p>
            <p className="text-xs text-gold font-medium">
              — {weeklyBrief.scripture_reference}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
