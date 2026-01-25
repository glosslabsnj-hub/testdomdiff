import { Sun, RefreshCw, BookOpen, Target, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDailyDevotional } from "@/hooks/useDailyDevotional";
import { useTTS } from "@/hooks/useTTS";
import { AudioPlayButton } from "@/components/AudioPlayButton";
import { cn } from "@/lib/utils";

export function MorningBriefing() {
  const { devotional, loading, error, refresh } = useDailyDevotional();
  const tts = useTTS();

  const handleListenToBriefing = () => {
    if (!devotional) return;
    
    // Build the full briefing text
    const parts = [
      `Today's scripture: ${devotional.scripture_text}. From ${devotional.scripture_reference}.`,
      devotional.message,
      `Today's challenge: ${devotional.challenge}`,
      `Prayer focus: ${devotional.prayer_focus}`,
    ];
    
    tts.speak(parts.join(" "));
  };

  if (loading && !devotional) {
    return (
      <div className="bg-charcoal-dark border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center">
            <Sun className="h-5 w-5 text-gold" />
          </div>
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-24 w-full mb-4" />
        <Skeleton className="h-16 w-full mb-4" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error && !devotional) {
    return (
      <div className="bg-charcoal-dark border border-destructive/30 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
              <Sun className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Morning Briefing</h3>
              <p className="text-sm text-muted-foreground">Unable to load</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={refresh}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-4 text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!devotional) return null;

  const themeColors: Record<string, string> = {
    discipline: "from-gold/20 to-transparent",
    perseverance: "from-crimson/20 to-transparent",
    strength: "from-steel/20 to-transparent",
    transformation: "from-blue-500/20 to-transparent",
    identity: "from-purple-500/20 to-transparent",
  };

  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const dateString = today.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="bg-charcoal-dark border border-border rounded-xl overflow-hidden">
      {/* Header gradient based on theme */}
      <div className={cn(
        "bg-gradient-to-b p-6",
        themeColors[devotional.theme] || themeColors.discipline
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center">
              <Sun className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Morning Briefing</h3>
              <p className="text-sm text-muted-foreground">
                {dayName}, {dateString}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={refresh}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>

        {/* Theme badge and Listen button */}
        <div className="flex items-center gap-3">
          {devotional.theme && (
            <span className="text-xs font-medium text-gold bg-gold/10 px-2 py-1 rounded-full border border-gold/30 capitalize">
              {devotional.theme}
            </span>
          )}
          <AudioPlayButton
            variant="compact"
            label="Listen"
            isLoading={tts.isLoading}
            isPlaying={tts.isPlaying}
            isPaused={tts.isPaused}
            onClick={handleListenToBriefing}
            onStop={tts.stop}
          />
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Scripture */}
        <div className="bg-charcoal border border-border rounded-lg p-4">
          <div className="flex gap-3">
            <BookOpen className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-foreground italic leading-relaxed mb-2">
                "{devotional.scripture_text}"
              </p>
              <p className="text-sm text-gold font-medium">
                — {devotional.scripture_reference}
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        <p className="text-foreground leading-relaxed">
          {devotional.message}
        </p>

        {/* Today's Challenge */}
        <div className="bg-gold/10 border border-gold/30 rounded-lg p-4">
          <div className="flex gap-3">
            <Target className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gold uppercase tracking-wide mb-1">
                Today's Challenge
              </p>
              <p className="text-foreground text-sm">
                {devotional.challenge}
              </p>
            </div>
          </div>
        </div>

        {/* Prayer Focus */}
        <div className="flex gap-3">
          <Heart className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Prayer Focus
            </p>
            <p className="text-muted-foreground text-sm">
              {devotional.prayer_focus}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
