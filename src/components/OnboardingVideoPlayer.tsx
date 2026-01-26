import { useState, useEffect, useRef } from "react";
import { Play, RefreshCw, Loader2, AlertCircle, Check, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useOnboardingVideo } from "@/hooks/useOnboardingVideo";

interface OnboardingVideoPlayerProps {
  tierKey: string;
  tierName: string;
  accentClass?: string;
  borderClass?: string;
  onVideoWatched?: () => void;
  fallbackContent?: React.ReactNode;
}

type PlaybackPhase = "welcome" | "walkthrough" | "complete";

export function OnboardingVideoPlayer({
  tierKey,
  tierName,
  accentClass = "text-primary",
  borderClass = "border-primary/30",
  onVideoWatched,
  fallbackContent,
}: OnboardingVideoPlayerProps) {
  const [welcomeVideoUrl, setWelcomeVideoUrl] = useState<string | null>(null);
  const [walkthroughVideoUrl, setWalkthroughVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasWatched, setHasWatched] = useState(false);
  const [playbackPhase, setPlaybackPhase] = useState<PlaybackPhase>("welcome");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const welcomeVideoRef = useRef<HTMLVideoElement>(null);
  const walkthroughVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Get AI-generated audio for walkthrough
  const { video: onboardingData, isReady: hasAiAudio } = useOnboardingVideo(tierKey);

  // Fetch welcome video and walkthrough video URLs
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("program_welcome_videos")
        .select("video_url, walkthrough_video_url")
        .eq("plan_type", tierKey)
        .single();

      if (!error && data) {
        setWelcomeVideoUrl(data.video_url);
        setWalkthroughVideoUrl(data.walkthrough_video_url);
      }
      setLoading(false);
    };

    fetchVideos();
  }, [tierKey]);

  // Handle welcome video end - transition to walkthrough
  const handleWelcomeVideoEnd = () => {
    if (walkthroughVideoUrl) {
      setPlaybackPhase("walkthrough");
      // Small delay for smooth transition
      setTimeout(() => {
        if (walkthroughVideoRef.current) {
          walkthroughVideoRef.current.play();
        }
        if (audioRef.current && hasAiAudio && onboardingData?.audio_url) {
          audioRef.current.play();
        }
      }, 500);
    } else {
      // No walkthrough video, mark as complete
      setPlaybackPhase("complete");
      setHasWatched(true);
      onVideoWatched?.();
    }
  };

  // Handle walkthrough end
  const handleWalkthroughEnd = () => {
    setPlaybackPhase("complete");
    setHasWatched(true);
    onVideoWatched?.();
  };

  // Start playback
  const handlePlay = () => {
    setIsPlaying(true);
    if (playbackPhase === "welcome" && welcomeVideoRef.current) {
      welcomeVideoRef.current.play();
    } else if (playbackPhase === "walkthrough") {
      walkthroughVideoRef.current?.play();
      if (audioRef.current && hasAiAudio && onboardingData?.audio_url) {
        audioRef.current.play();
      }
    }
  };

  // Toggle mute for the walkthrough audio
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  // Sync walkthrough video with audio
  useEffect(() => {
    if (playbackPhase === "walkthrough" && walkthroughVideoRef.current && audioRef.current) {
      // Keep video and audio in sync
      const syncInterval = setInterval(() => {
        if (walkthroughVideoRef.current && audioRef.current) {
          const videoCurrent = walkthroughVideoRef.current.currentTime;
          const audioCurrent = audioRef.current.currentTime;
          const diff = Math.abs(videoCurrent - audioCurrent);
          
          // If more than 0.5 seconds out of sync, resync
          if (diff > 0.5) {
            walkthroughVideoRef.current.currentTime = audioRef.current.currentTime;
          }
        }
      }, 1000);

      return () => clearInterval(syncInterval);
    }
  }, [playbackPhase]);

  // Loading state
  if (loading) {
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

  // No videos uploaded yet
  if (!welcomeVideoUrl && !walkthroughVideoUrl) {
    return (
      <Card className={cn("mb-8 bg-charcoal", borderClass)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
              <Play className={cn("w-8 h-8", accentClass)} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{tierName} Walkthrough</h3>
              <p className="text-sm text-muted-foreground">
                Walkthrough video coming soon. Check back later for a guided tour of your program.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ready - show video player
  return (
    <Card className={cn("mb-8 bg-charcoal overflow-hidden", borderClass)}>
      <CardContent className="p-0">
        <div className="relative">
          {/* Welcome Video (Phase 1) */}
          {playbackPhase === "welcome" && welcomeVideoUrl && (
            <div className="aspect-video bg-black relative">
              <video
                ref={welcomeVideoRef}
                src={welcomeVideoUrl}
                className="w-full h-full"
                onEnded={handleWelcomeVideoEnd}
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Play overlay */}
              {!isPlaying && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
                  onClick={handlePlay}
                >
                  <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center">
                    <Play className="w-10 h-10 text-primary-foreground ml-1" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Walkthrough Video with Audio Overlay (Phase 2) */}
          {playbackPhase === "walkthrough" && walkthroughVideoUrl && (
            <div className="aspect-video bg-black relative">
              {/* Screen recording video (muted - plays silently) */}
              <video
                ref={walkthroughVideoRef}
                src={walkthroughVideoUrl}
                className="w-full h-full"
                onEnded={handleWalkthroughEnd}
                playsInline
                muted // Video is always muted - audio comes from AI narration
              />
              
              {/* AI-generated audio overlay */}
              {hasAiAudio && onboardingData?.audio_url && (
                <audio
                  ref={audioRef}
                  src={onboardingData.audio_url}
                  onEnded={handleWalkthroughEnd}
                />
              )}

              {/* Audio controls */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={toggleMute}
                  className="bg-background/80 hover:bg-background"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              {/* Phase indicator */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-background/80 text-xs font-medium">
                Tier Walkthrough
              </div>
            </div>
          )}

          {/* Skip welcome if only walkthrough exists */}
          {playbackPhase === "welcome" && !welcomeVideoUrl && walkthroughVideoUrl && (
            (() => {
              // Auto-transition to walkthrough
              setPlaybackPhase("walkthrough");
              return null;
            })()
          )}

          {/* Completion state */}
          {playbackPhase === "complete" && (
            <div className="aspect-video bg-black flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Walkthrough Complete</h3>
                <p className="text-sm text-muted-foreground">
                  You're ready to start your {tierName} journey.
                </p>
              </div>
            </div>
          )}

          {/* Watched badge */}
          {hasWatched && playbackPhase !== "complete" && (
            <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
              <Check className="w-3 h-3" />
              Watched
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
