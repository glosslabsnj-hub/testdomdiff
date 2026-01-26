import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Check, Volume2, VolumeX, Pause } from "lucide-react";
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
  const [hasStarted, setHasStarted] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [needsAudioTap, setNeedsAudioTap] = useState(false);
  
  const welcomeVideoRef = useRef<HTMLVideoElement>(null);
  const walkthroughVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const autoStartWalkthroughRef = useRef(false);

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

  // Auto-transition to walkthrough if no welcome video
  useEffect(() => {
    if (!loading && !welcomeVideoUrl && walkthroughVideoUrl && playbackPhase === "welcome") {
      setPlaybackPhase("walkthrough");
    }
  }, [loading, welcomeVideoUrl, walkthroughVideoUrl, playbackPhase]);

  // Start walkthrough playback. If mobile blocks programmatic audio, we pause and show a tap-to-enable overlay.
  const startWalkthroughPlayback = useCallback(async () => {
    const video = walkthroughVideoRef.current;
    const audio = audioRef.current;

    console.log("[OnboardingVideoPlayer] Starting walkthrough playback", {
      hasVideo: !!video,
      hasAudio: !!audio,
      hasAiAudio,
      audioUrl: onboardingData?.audio_url,
    });

    if (!video) return;

    setNeedsAudioTap(false);
    video.currentTime = 0;

    try {
      await video.play();
    } catch (e) {
      console.error("[OnboardingVideoPlayer] Video play failed", e);
      return;
    }

    if (audio && hasAiAudio && onboardingData?.audio_url) {
      audio.currentTime = 0;
      try {
        await audio.play();
      } catch (e) {
        console.warn("[OnboardingVideoPlayer] Audio play blocked; waiting for user tap", e);
        video.pause();
        setIsPlaying(false);
        setNeedsAudioTap(true);
        return;
      }
    }

    setIsPlaying(true);
  }, [hasAiAudio, onboardingData?.audio_url]);

  // Handle welcome video end - transition to walkthrough
  const handleWelcomeVideoEnd = useCallback(() => {
    console.log("[OnboardingVideoPlayer] Welcome video ended");
    if (walkthroughVideoUrl) {
      setPlaybackPhase("walkthrough");
      autoStartWalkthroughRef.current = true;
    } else {
      setPlaybackPhase("complete");
      setHasWatched(true);
      onVideoWatched?.();
    }
  }, [walkthroughVideoUrl, startWalkthroughPlayback, onVideoWatched]);

  // Auto-start walkthrough after phase switch (allows refs to mount first)
  useEffect(() => {
    if (playbackPhase !== "walkthrough") return;
    if (!autoStartWalkthroughRef.current) return;
    autoStartWalkthroughRef.current = false;

    const t = setTimeout(() => {
      startWalkthroughPlayback();
    }, 250);

    return () => clearTimeout(t);
  }, [playbackPhase, startWalkthroughPlayback]);

  // Handle walkthrough end
  const handleWalkthroughEnd = useCallback(() => {
    console.log("[OnboardingVideoPlayer] Walkthrough ended");
    setPlaybackPhase("complete");
    setHasWatched(true);
    setIsPlaying(false);
    onVideoWatched?.();
  }, [onVideoWatched]);

  // Start playback (initial play button click)
  const handlePlay = useCallback(() => {
    setHasStarted(true);
    setIsPlaying(true);

    // Mobile browsers (especially iOS Safari) often require a user gesture before audio can play.
    // We "prime" the narration audio on the first tap so the later auto-transition can start audio reliably.
    if (hasAiAudio && onboardingData?.audio_url && audioRef.current) {
      const audio = audioRef.current;
      const previousMuted = audio.muted;
      audio.muted = true;
      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = previousMuted;
        })
        .catch(() => {
          audio.muted = previousMuted;
        });
    }
    
    if (playbackPhase === "welcome" && welcomeVideoRef.current) {
      welcomeVideoRef.current.play().catch(console.error);
    } else if (playbackPhase === "walkthrough") {
      startWalkthroughPlayback();
    }
  }, [playbackPhase, startWalkthroughPlayback, hasAiAudio, onboardingData?.audio_url]);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (playbackPhase === "welcome" && welcomeVideoRef.current) {
      if (isPlaying) {
        welcomeVideoRef.current.pause();
      } else {
        welcomeVideoRef.current.play().catch(console.error);
      }
    } else if (playbackPhase === "walkthrough") {
      if (isPlaying) {
        walkthroughVideoRef.current?.pause();
        audioRef.current?.pause();
      } else {
        const video = walkthroughVideoRef.current;
        const audio = audioRef.current;
        video?.play().catch(console.error);
        audio?.play().catch((e) => {
          console.warn("[OnboardingVideoPlayer] Audio play blocked on resume", e);
          video?.pause();
          setNeedsAudioTap(true);
          setIsPlaying(false);
        });
      }
    }
    if (!(playbackPhase === "walkthrough" && !isPlaying && needsAudioTap)) {
      setIsPlaying(!isPlaying);
    }
  }, [playbackPhase, isPlaying, needsAudioTap]);

  // Toggle mute for the walkthrough audio
  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioRef.current) {
      audioRef.current.muted = newMuted;
    }
    // Also mute/unmute welcome video if in that phase
    if (welcomeVideoRef.current) {
      welcomeVideoRef.current.muted = newMuted;
    }
  }, [isMuted]);

  // Show skip button after 30 seconds of playback
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setTimeout(() => {
      setShowSkipButton(true);
    }, 30000);
    
    return () => clearTimeout(timer);
  }, [isPlaying]);

  // Sync walkthrough video with audio - audio is the source of truth
  useEffect(() => {
    if (playbackPhase !== "walkthrough" || !hasAiAudio || !onboardingData?.audio_url) {
      return;
    }

    const syncInterval = setInterval(() => {
      const video = walkthroughVideoRef.current;
      const audio = audioRef.current;
      
      if (!video || !audio) return;
      
      // Only sync if both are playing
      if (video.paused || audio.paused) return;
      
      const videoCurrent = video.currentTime;
      const audioCurrent = audio.currentTime;
      const diff = Math.abs(videoCurrent - audioCurrent);
      
      // If more than 0.3 seconds out of sync, resync video to audio
      if (diff > 0.3) {
        console.log("[OnboardingVideoPlayer] Syncing video to audio", { videoCurrent, audioCurrent, diff });
        video.currentTime = audioCurrent;
      }
    }, 500);

    return () => clearInterval(syncInterval);
  }, [playbackPhase, hasAiAudio, onboardingData?.audio_url]);

  // If the walkthrough is playing but audio got blocked/paused, try to start it once it's available.
  useEffect(() => {
    if (playbackPhase !== "walkthrough") return;
    if (!hasStarted) return;
    if (!hasAiAudio || !onboardingData?.audio_url) return;
    if (needsAudioTap) return;

    const video = walkthroughVideoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;

    if (!video.paused && audio.paused) {
      audio.currentTime = video.currentTime;
      audio.play().catch((e) => {
        console.warn("[OnboardingVideoPlayer] Audio play blocked during sync-start", e);
        video.pause();
        setIsPlaying(false);
        setNeedsAudioTap(true);
      });
    }
  }, [playbackPhase, hasStarted, hasAiAudio, onboardingData?.audio_url, needsAudioTap]);

  // Handle video play/pause events
  const handleVideoPlay = useCallback(() => setIsPlaying(true), []);
  const handleVideoPause = useCallback(() => setIsPlaying(false), []);

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
          {/* ALWAYS mount audio element for mobile reliability - src updates when data loads */}
          <audio
            ref={audioRef}
            src={onboardingData?.audio_url || ""}
            onEnded={handleWalkthroughEnd}
            preload="auto"
            onPlay={() => setIsPlaying(true)}
            onPause={() => !needsAudioTap && setIsPlaying(false)}
          />

          {/* Welcome Video (Phase 1) */}
          {playbackPhase === "welcome" && welcomeVideoUrl && (
            <div className="aspect-video bg-black relative">
              <video
                ref={welcomeVideoRef}
                src={welcomeVideoUrl}
                className="w-full h-full"
                onEnded={handleWelcomeVideoEnd}
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                playsInline
              />
              
              {/* Play overlay - shown before user starts */}
              {!hasStarted && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
                  onClick={handlePlay}
                >
                  <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center">
                    <Play className="w-10 h-10 text-primary-foreground ml-1" />
                  </div>
                </div>
              )}

              {/* Video controls - shown after started */}
              {hasStarted && (
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={togglePlayPause}
                    className="bg-background/80 hover:bg-background"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={toggleMute}
                    className="bg-background/80 hover:bg-background"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
              )}
              
              {/* Phase indicator */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-background/80 text-xs font-medium">
                Welcome Message
              </div>
            </div>
          )}

          {/* Walkthrough Video with Audio Overlay (Phase 2) */}
          {playbackPhase === "walkthrough" && walkthroughVideoUrl && (
            <div className="aspect-video bg-black relative">
              {/* Screen recording video (muted - plays silently, audio comes from AI narration) */}
              <video
                ref={walkthroughVideoRef}
                src={walkthroughVideoUrl}
                className="w-full h-full"
                onEnded={handleWalkthroughEnd}
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                playsInline
                muted
              />

              {/* If mobile blocks audio autoplay, require a tap */}
              {needsAudioTap && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm cursor-pointer"
                  onClick={() => startWalkthroughPlayback()}
                >
                  <div className="px-4 py-3 rounded-lg bg-background/80 border border-border text-center max-w-[85%]">
                    <p className="text-sm font-medium">Tap to enable narration</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Some phones block auto-audio until you tap.
                    </p>
                    <div className="mt-3 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Play overlay for walkthrough - shown if not started from welcome */}
              {!hasStarted && !isPlaying && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
                  onClick={handlePlay}
                >
                  <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center">
                    <Play className="w-10 h-10 text-primary-foreground ml-1" />
                  </div>
                </div>
              )}

              {/* Video controls */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={togglePlayPause}
                  className="bg-background/80 hover:bg-background"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={toggleMute}
                  className="bg-background/80 hover:bg-background"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
              
              {/* Skip button after 30 seconds */}
              {showSkipButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPlaybackPhase("complete");
                    setHasWatched(true);
                    setIsPlaying(false);
                    onVideoWatched?.();
                  }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 hover:text-white text-xs"
                >
                  Skip Video →
                </Button>
              )}

              {/* Phase indicator with audio status */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-background/80 text-xs font-medium flex items-center gap-2">
                <span>Platform Walkthrough</span>
                {hasAiAudio && onboardingData?.audio_url && (
                  <span className="flex items-center gap-1 text-primary">
                    <Volume2 className="w-3 h-3" />
                    <span>AI Narration</span>
                  </span>
                )}
              </div>
            </div>
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
