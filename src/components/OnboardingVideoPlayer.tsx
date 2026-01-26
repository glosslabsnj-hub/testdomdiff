import { Play, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useOnboardingVideo } from "@/hooks/useOnboardingVideo";
import { OnboardingVideoWithVisuals } from "./OnboardingVideoWithVisuals";

interface OnboardingVideoPlayerProps {
  tierKey: string;
  tierName: string;
  accentClass?: string;
  borderClass?: string;
  onVideoWatched?: () => void;
  fallbackContent?: React.ReactNode;
}

export function OnboardingVideoPlayer({
  tierKey,
  tierName,
  accentClass = "text-primary",
  borderClass = "border-primary/30",
  onVideoWatched,
  fallbackContent,
}: OnboardingVideoPlayerProps) {
  const { video, isLoading, needsGeneration, isGenerating, isReady, triggerGeneration } = useOnboardingVideo(tierKey);

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn("mb-8", borderClass)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-32 h-20 rounded-lg bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Generation in progress
  if (isGenerating) {
    const statusMessages: Record<string, string> = {
      queued: "Preparing your walkthrough...",
      generating_script: "Writing your personalized script...",
      generating_audio: "Recording voiceover...",
      generating_captions: "Adding captions...",
    };

    return (
      <Card className={cn("mb-8 bg-charcoal", borderClass)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
              <Loader2 className={cn("w-8 h-8 animate-spin", accentClass)} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Generating Your Tier Walkthrough</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {video?.status ? statusMessages[video.status] : "Starting..."}
              </p>
              <p className="text-xs text-muted-foreground">
                This takes about 2 minutes. You can continue browsing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Needs generation (not auto-triggered)
  if (needsGeneration) {
    return (
      <Card className={cn("mb-8 bg-charcoal", borderClass)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
              <Play className={cn("w-8 h-8", accentClass)} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{tierName} Walkthrough</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {video?.error 
                  ? "Previous generation failed. Click to try again."
                  : "Get a personalized audio walkthrough of how to use your program."}
              </p>
              <Button
                variant="gold"
                size="sm"
                onClick={() => triggerGeneration.mutate(!!video?.error)}
                disabled={triggerGeneration.isPending}
                className="gap-2"
              >
                {triggerGeneration.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : video?.error ? (
                  <RefreshCw className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {video?.error ? "Retry Generation" : "Generate Walkthrough"}
              </Button>
              {video?.error && (
                <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {video.error}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ready - show visual video player with Ken Burns effects
  if (isReady && video?.audio_url) {
    return (
      <Card className={cn("mb-8 bg-charcoal overflow-hidden", borderClass)}>
        <CardContent className="p-0">
          <OnboardingVideoWithVisuals
            audioUrl={video.audio_url}
            captionLines={video.caption_lines}
            screenSlides={video.screen_slides}
            tierKey={tierKey}
            tierName={tierName}
            accentClass={accentClass}
            onVideoWatched={onVideoWatched}
          />
        </CardContent>
      </Card>
    );
  }

  // Fallback to provided content
  return <>{fallbackContent}</>;
}
