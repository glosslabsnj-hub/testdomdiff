import { useState, useEffect } from "react";
import { Loader2, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useOnboardingVideo } from "@/hooks/useOnboardingVideo";
import { OnboardingVideoPlayer } from "@/components/OnboardingVideoPlayer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardOnboardingVideoProps {
  tierKey: string;
  tierName: string;
}

export function DashboardOnboardingVideo({ tierKey, tierName }: DashboardOnboardingVideoProps) {
  const { video, isLoading, isGenerating, isReady, needsGeneration, triggerGeneration } = useOnboardingVideo(tierKey);
  const { profile } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [hasWatched, setHasWatched] = useState(false);

  // Check if user has already watched (using onboarding_video_watched for now)
  useEffect(() => {
    if (profile?.onboarding_video_watched) {
      setHasWatched(true);
    }
  }, [profile]);

  // Auto-trigger generation if needed and video doesn't exist
  useEffect(() => {
    if (needsGeneration && !isGenerating && !video?.error && !triggerGeneration.isPending) {
      triggerGeneration.mutate(false);
    }
  }, [needsGeneration, isGenerating, video?.error, triggerGeneration]);

  const handleDismiss = async () => {
    setDismissed(true);
    // Mark as watched in database
    if (profile?.user_id) {
      await supabase
        .from("profiles")
        .update({ dashboard_video_watched: true })
        .eq("user_id", profile.user_id);
    }
  };

  const handleVideoWatched = async () => {
    setHasWatched(true);
    if (profile?.user_id) {
      await supabase
        .from("profiles")
        .update({ dashboard_video_watched: true })
        .eq("user_id", profile.user_id);
    }
  };

  // Don't show if dismissed or already watched (and not showing again)
  if (dismissed) return null;

  // Don't show if user explicitly watched before
  if (hasWatched && !isReady) return null;

  // Loading state
  if (isLoading) {
    return (
      <Card className="mb-8 border-primary/30 bg-charcoal">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Loading your walkthrough...</h3>
              <p className="text-sm text-muted-foreground">Just a moment.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Generating state - show progress
  if (isGenerating) {
    const statusMessages: Record<string, string> = {
      queued: "Preparing your personalized walkthrough...",
      generating_script: "Writing your personalized script...",
      generating_audio: "Recording voiceover...",
      generating_captions: "Adding captions...",
    };

    return (
      <Card className="mb-8 border-primary/30 bg-charcoal">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Building Your {tierName} Walkthrough</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {video?.status ? statusMessages[video.status] : "Starting..."}
              </p>
              <p className="text-xs text-muted-foreground">
                This takes about 2 minutes. You can scroll down to explore while it generates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ready - show the video player prominently
  if (isReady && video?.audio_url) {
    return (
      <div className="mb-8 relative">
        {/* Dismiss button */}
        {hasWatched && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="absolute top-4 right-4 z-10 bg-background/80 hover:bg-background"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
        
        <OnboardingVideoPlayer
          tierKey={tierKey}
          tierName={tierName}
          accentClass="text-primary"
          borderClass="border-primary/30"
          onVideoWatched={handleVideoWatched}
        />
      </div>
    );
  }

  // Needs generation but failed or not started
  if (needsGeneration && video?.error) {
    return (
      <Card className="mb-8 border-destructive/30 bg-charcoal">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Play className="w-8 h-8 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Video Generation Failed</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {video.error}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => triggerGeneration.mutate(true)}
                disabled={triggerGeneration.isPending}
                className="gap-2"
              >
                {triggerGeneration.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Retry
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default: nothing to show yet
  return null;
}
