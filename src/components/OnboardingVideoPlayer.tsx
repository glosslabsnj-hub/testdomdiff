import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Download, RefreshCw, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useOnboardingVideo } from "@/hooks/useOnboardingVideo";

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
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentCaption, setCurrentCaption] = useState("");
  const [hasWatched, setHasWatched] = useState(false);

  // Auto-trigger generation if needed (only once)
  useEffect(() => {
    if (needsGeneration && !isGenerating && !triggerGeneration.isPending) {
      // Don't auto-generate, let user click to generate
    }
  }, [needsGeneration, isGenerating]);

  // Update current caption based on audio time
  useEffect(() => {
    if (!video?.caption_lines || !audioRef.current) return;

    const updateCaption = () => {
      const time = audioRef.current?.currentTime || 0;
      const caption = video.caption_lines?.find(
        (c) => time >= c.start && time < c.end
      );
      setCurrentCaption(caption?.text || "");
    };

    const audio = audioRef.current;
    audio.addEventListener("timeupdate", updateCaption);
    return () => audio.removeEventListener("timeupdate", updateCaption);
  }, [video?.caption_lines]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setHasWatched(true);
      onVideoWatched?.();
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [onVideoWatched]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

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
      generating_audio: "Recording voiceover with Dom...",
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

  // Ready - show audio player with captions
  if (isReady && video?.audio_url) {
    return (
      <Card className={cn("mb-8 bg-charcoal overflow-hidden", borderClass)}>
        <CardContent className="p-0">
          {/* Visual area with captions */}
          <div className="relative aspect-video bg-gradient-to-b from-charcoal to-background flex items-center justify-center">
            {/* Background branding */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <span className="text-6xl font-bold tracking-wider">DOM DIFFERENT</span>
            </div>
            
            {/* Caption display */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <p className={cn(
                "text-lg md:text-xl font-medium text-center transition-opacity duration-300",
                currentCaption ? "opacity-100" : "opacity-0"
              )}>
                {currentCaption || " "}
              </p>
            </div>

            {/* Play button overlay when paused */}
            {!isPlaying && (
              <button
                onClick={togglePlayPause}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
              >
                <div className={cn(
                  "w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center",
                  "group-hover:scale-110 transition-transform"
                )}>
                  <Play className="w-10 h-10 text-primary-foreground ml-1" />
                </div>
              </button>
            )}

            {/* Watched badge */}
            {hasWatched && (
              <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs">
                <Check className="w-3 h-3" />
                Watched
              </div>
            )}
          </div>

          {/* Audio controls */}
          <div className="p-4 space-y-3">
            {/* Progress bar */}
            <div className="relative">
              <Progress value={progressPercent} className="h-2 cursor-pointer" />
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = Number(e.target.value);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlayPause}
                  className="h-10 w-10"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="h-10 w-10"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {video.captions_srt_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="gap-2 text-muted-foreground"
                >
                  <a href={video.captions_srt_url} download>
                    <Download className="w-4 h-4" />
                    Captions
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Hidden audio element */}
          <audio ref={audioRef} src={video.audio_url} preload="metadata" />
        </CardContent>
      </Card>
    );
  }

  // Fallback to provided content
  return <>{fallbackContent}</>;
}
