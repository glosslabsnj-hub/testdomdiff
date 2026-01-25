import { Shield, RefreshCw, BookOpen, MessageCircle, ChevronDown, Volume2, VolumeX, Loader2, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWarden } from "@/hooks/useWarden";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { RotatingWardenTip } from "./RotatingWardenTip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const LAST_WARDEN_AUDIO_KEY = "lastWardenAudioDate";

const openWardenChat = () => {
  window.dispatchEvent(new CustomEvent('open-warden-chat'));
};

export function WardenBrief() {
  const { weeklyBrief, briefLoading, briefError, refreshBrief } = useWarden();
  const isMobile = useIsMobile();
  const [scriptureOpen, setScriptureOpen] = useState(!isMobile);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const handleListen = useCallback(async (isAutoPlay = false) => {
    if (!weeklyBrief?.message) return;

    // If already playing, stop
    if (isPlaying && audioRef.current) {
      stopAudio();
      return;
    }

    setIsGeneratingAudio(true);

    try {
      // Build the full text to speak
      let textToSpeak = weeklyBrief.message;
      if (weeklyBrief.scripture_text && weeklyBrief.scripture_reference) {
        textToSpeak += ` ... ${weeklyBrief.scripture_text}. ${weeklyBrief.scripture_reference}.`;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/warden-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: textToSpeak }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate audio");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Clean up previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        if (!isAutoPlay) {
          toast({
            title: "Audio Error",
            description: "Failed to play audio. Please try again.",
            variant: "destructive",
          });
        }
      };

      await audio.play();
      setIsPlaying(true);
      
      // Mark today as the day we played audio
      if (isAutoPlay) {
        localStorage.setItem(LAST_WARDEN_AUDIO_KEY, new Date().toDateString());
      }
    } catch (error) {
      console.error("TTS error:", error);
      if (!isAutoPlay) {
        toast({
          title: "Voice Unavailable",
          description: "Could not generate audio. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsGeneratingAudio(false);
    }
  }, [weeklyBrief, isPlaying, stopAudio, toast]);

  // Auto-play on first daily login
  useEffect(() => {
    if (!weeklyBrief || hasAutoPlayed || briefLoading) return;

    const lastPlayedDate = localStorage.getItem(LAST_WARDEN_AUDIO_KEY);
    const today = new Date().toDateString();

    if (lastPlayedDate !== today) {
      // Small delay to let UI settle before auto-playing
      const timeout = setTimeout(() => {
        setHasAutoPlayed(true);
        handleListen(true);
      }, 800);

      return () => clearTimeout(timeout);
    } else {
      setHasAutoPlayed(true);
    }
  }, [weeklyBrief, hasAutoPlayed, briefLoading, handleListen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
        audioRef.current = null;
      }
    };
  }, []);

  if (briefLoading && !weeklyBrief) {
    return (
      <div className="bg-charcoal-dark border border-gold/20 rounded-xl p-4 sm:p-6">
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
      <div className="bg-charcoal-dark border border-destructive/30 rounded-xl p-4 sm:p-6">
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
    <div className="space-y-3">
      {/* Main Warden Brief Card */}
      <div 
        className={cn(
          "bg-charcoal-dark border border-gold/20 rounded-xl p-4 sm:p-6 relative overflow-hidden transition-all",
          isPlaying && "ring-2 ring-gold/30 ring-offset-2 ring-offset-background"
        )}
        onClick={isPlaying ? stopAudio : undefined}
      >
        {/* Subtle gold gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold/50 via-gold to-gold/50" />
        
        {/* Tap to stop indicator while playing */}
        {isPlaying && (
          <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-gold/80 bg-gold/10 px-2 py-1 rounded-full">
            <Hand className="h-3 w-3" />
            <span>Tap to stop</span>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0",
              isPlaying && "animate-pulse"
            )}>
              <Shield className="h-5 w-5 text-gold" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground text-sm sm:text-base">The Warden</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Week {weeklyBrief.week_number} Orders
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {/* Listen button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleListen(false)}
              disabled={isGeneratingAudio}
              className={cn(
                "text-muted-foreground hover:text-gold hover:bg-gold/10",
                isPlaying && "text-gold bg-gold/10"
              )}
              title={isPlaying ? "Stop" : "Listen"}
            >
              {isGeneratingAudio ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPlaying ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshBrief}
              disabled={briefLoading}
              className="text-muted-foreground hover:text-foreground flex-shrink-0"
            >
              <RefreshCw className={cn("h-4 w-4", briefLoading && "animate-spin")} />
            </Button>
          </div>
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
        <p className="text-foreground text-sm sm:text-base leading-relaxed mb-4">
          {weeklyBrief.message}
        </p>

        {/* Scripture if present - collapsible on mobile */}
        {weeklyBrief.scripture_reference && weeklyBrief.scripture_text && (
          isMobile ? (
            <Collapsible open={scriptureOpen} onOpenChange={setScriptureOpen} className="mb-4">
              <CollapsibleTrigger className="w-full bg-charcoal border border-border rounded-lg p-3 flex items-center justify-between hover:bg-charcoal-light transition-colors">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gold" />
                  <span className="text-sm text-gold font-medium">{weeklyBrief.scripture_reference}</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", scriptureOpen && "rotate-180")} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-charcoal border border-border rounded-lg p-3">
                  <p className="text-sm text-muted-foreground italic">
                    "{weeklyBrief.scripture_text}"
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <div className="bg-charcoal border border-border rounded-lg p-4 flex gap-3 mb-4">
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
          )
        )}

        {/* Ask the Warden button */}
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            onClick={openWardenChat}
            variant="outline"
            className="w-full border-gold/30 text-gold hover:bg-gold/10 hover:text-gold"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Ask the Warden
          </Button>
        </div>
      </div>

      {/* Rotating Warden Tip - appears below main brief */}
      <RotatingWardenTip />
    </div>
  );
}
