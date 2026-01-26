import { useState, useEffect, useRef } from "react";
import { X, Loader2, Volume2, VolumeX, Play, Pause, Volume1 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface FirstLoginVideoModalProps {
  tierKey: string;
  tierName: string;
  userId: string;
  onComplete: () => void;
}

type PlaybackPhase = "welcome" | "walkthrough" | "complete";

export function FirstLoginVideoModal({
  tierKey,
  tierName,
  userId,
  onComplete,
}: FirstLoginVideoModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [closeUnlocked, setCloseUnlocked] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [playbackPhase, setPlaybackPhase] = useState<PlaybackPhase>("welcome");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [needsAudioTap, setNeedsAudioTap] = useState(false);
  const [audioPrimed, setAudioPrimed] = useState(false);
  
  const welcomeVideoRef = useRef<HTMLVideoElement>(null);
  const walkthroughVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch video URLs (including manual audio)
  const { data: videos, isLoading } = useQuery({
    queryKey: ["welcome-videos-modal", tierKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("program_welcome_videos")
        .select("video_url, walkthrough_video_url, walkthrough_audio_url")
        .eq("plan_type", tierKey)
        .single();
      
      if (error) return null;
      return data;
    },
  });

  // Fetch current tier config version
  const { data: configVersion } = useQuery({
    queryKey: ["tier-config-version"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "tier_config_version")
        .single();
      return parseInt(data?.value || "1", 10);
    },
  });

  // Fetch AI-generated audio with version filter and cache-busting
  const { data: onboardingAudio } = useQuery({
    queryKey: ["onboarding-audio-modal", tierKey, configVersion],
    queryFn: async () => {
      if (!configVersion) return null;
      const { data, error } = await supabase
        .from("tier_onboarding_videos")
        .select("audio_url, status, updated_at")
        .eq("tier_key", tierKey)
        .eq("tier_config_version", configVersion)
        .maybeSingle();
      
      if (error || data?.status !== "ready" || !data?.audio_url) return null;
      
      // Add cache-busting parameter to force fresh audio fetch
      const cacheBuster = new Date(data.updated_at).getTime();
      const audioUrlWithCacheBust = `${data.audio_url}?v=${configVersion}&t=${cacheBuster}`;
      
      return { ...data, audio_url: audioUrlWithCacheBust };
    },
    enabled: !!configVersion,
  });

  // Determine effective audio URL (manual takes priority over AI-generated)
  const effectiveAudioUrl = videos?.walkthrough_audio_url || onboardingAudio?.audio_url;

  // Unlock close button after 5 seconds
  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCloseUnlocked(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Show skip button after 30 seconds of playback
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setTimeout(() => {
      setShowSkipButton(true);
    }, 30000);
    
    return () => clearTimeout(timer);
  }, [isPlaying]);

  // Sync audio with walkthrough video - audio is source of truth
  useEffect(() => {
    if (playbackPhase !== "walkthrough" || !effectiveAudioUrl) return;
    
    const syncInterval = setInterval(() => {
      const video = walkthroughVideoRef.current;
      const audio = audioRef.current;
      
      if (!video || !audio) return;
      if (video.paused || audio.paused) return;
      
      const videoCurrent = video.currentTime;
      const audioCurrent = audio.currentTime;
      const diff = Math.abs(videoCurrent - audioCurrent);
      
      // Sync video to audio if more than 0.3s out of sync
      if (diff > 0.3) {
        console.log("[FirstLoginVideoModal] Syncing video to audio", { videoCurrent, audioCurrent, diff });
        video.currentTime = audioCurrent;
      }
    }, 500);

    return () => clearInterval(syncInterval);
  }, [playbackPhase, effectiveAudioUrl]);

  // Prime audio on first user tap to unlock mobile autoplay
  const primeAudioForMobile = () => {
    if (audioPrimed || !audioRef.current || !effectiveAudioUrl) return;
    
    const audio = audioRef.current;
    const previousMuted = audio.muted;
    audio.muted = true;
    audio.play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = previousMuted;
        setAudioPrimed(true);
        console.log("[FirstLoginVideoModal] Audio primed for mobile playback");
      })
      .catch(() => {
        audio.muted = previousMuted;
        console.log("[FirstLoginVideoModal] Audio priming failed");
      });
  };

  const startWalkthroughPlayback = async () => {
    console.log("[FirstLoginVideoModal] Starting walkthrough playback");
    setNeedsAudioTap(false);
    
    if (walkthroughVideoRef.current) {
      walkthroughVideoRef.current.currentTime = 0;
      walkthroughVideoRef.current.play().catch(console.error);
    }
    
    if (audioRef.current && effectiveAudioUrl) {
      audioRef.current.currentTime = 0;
      try {
        await audioRef.current.play();
        console.log("[FirstLoginVideoModal] Audio started successfully");
      } catch (error) {
        console.log("[FirstLoginVideoModal] Audio autoplay blocked, showing tap overlay");
        // Audio was blocked - pause video and show tap overlay
        walkthroughVideoRef.current?.pause();
        setNeedsAudioTap(true);
      }
    }
  };

  const handleWelcomeVideoEnd = () => {
    console.log("[FirstLoginVideoModal] Welcome video ended");
    if (videos?.walkthrough_video_url) {
      setPlaybackPhase("walkthrough");
      setTimeout(() => {
        startWalkthroughPlayback();
      }, 300);
    } else {
      handleComplete();
    }
  };

  const handleWalkthroughEnd = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    setPlaybackPhase("complete");
    
    // Update profile to mark video as watched
    await supabase
      .from("profiles")
      .update({ first_login_video_watched: true })
      .eq("user_id", userId);
    
    onComplete();
    setIsOpen(false);
  };

  const handleClose = async () => {
    if (!closeUnlocked) return;
    
    // Mark as watched even if they close early
    await supabase
      .from("profiles")
      .update({ first_login_video_watched: true })
      .eq("user_id", userId);
    
    onComplete();
    setIsOpen(false);
  };

  const handlePlay = () => {
    // Prime audio on first user interaction for mobile
    primeAudioForMobile();
    
    setIsPlaying(true);
    if (playbackPhase === "welcome" && welcomeVideoRef.current) {
      welcomeVideoRef.current.play();
    }
  };

  const handleStartWalkthroughDirect = () => {
    // Prime audio on first user interaction for mobile
    primeAudioForMobile();
    
    setPlaybackPhase("walkthrough");
    setIsPlaying(true);
    setTimeout(() => {
      startWalkthroughPlayback();
    }, 100);
  };

  const togglePlayPause = () => {
    if (playbackPhase === "welcome" && welcomeVideoRef.current) {
      if (isPlaying) {
        welcomeVideoRef.current.pause();
      } else {
        welcomeVideoRef.current.play().catch(console.error);
      }
    } else if (playbackPhase === "walkthrough") {
      if (needsAudioTap) {
        // If audio was blocked, try to resume with user tap
        startWalkthroughPlayback();
        return;
      }
      if (isPlaying) {
        walkthroughVideoRef.current?.pause();
        audioRef.current?.pause();
      } else {
        walkthroughVideoRef.current?.play().catch(console.error);
        audioRef.current?.play().catch(console.error);
      }
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    if (welcomeVideoRef.current) {
      welcomeVideoRef.current.muted = !isMuted;
    }
  };

  // Don't render if no videos available
  if (!isLoading && (!videos?.video_url && !videos?.walkthrough_video_url)) {
    // Auto-complete if no videos
    handleComplete();
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-none w-screen h-screen max-h-screen p-0 bg-black border-none rounded-none overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => !closeUnlocked && e.preventDefault()}
      >
        <VisuallyHidden>
          <DialogTitle>{tierName} Orientation</DialogTitle>
        </VisuallyHidden>
        
        {/* Always mount audio element for mobile reliability */}
        <audio
          ref={audioRef}
          src={effectiveAudioUrl || ""}
          preload="auto"
          onEnded={handleWalkthroughEnd}
          onPlay={() => setIsPlaying(true)}
          onPause={() => !needsAudioTap && setIsPlaying(false)}
        />
        
        {/* Close button with countdown */}
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={!closeUnlocked}
            className={cn(
              "bg-background/80 hover:bg-background transition-all",
              !closeUnlocked && "opacity-50 cursor-not-allowed"
            )}
          >
            {closeUnlocked ? (
              <X className="w-5 h-5" />
            ) : (
              <span className="text-sm font-medium">{countdown}</span>
            )}
          </Button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        )}

        {/* Welcome Video (Phase 1) */}
        {!isLoading && playbackPhase === "welcome" && videos?.video_url && (
          <div className="w-full h-full bg-black relative flex items-center justify-center">
            <video
              ref={welcomeVideoRef}
              src={videos.video_url}
              className="w-full h-full object-contain"
              onEnded={handleWelcomeVideoEnd}
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            
            {/* Play overlay */}
            {!isPlaying && (
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 cursor-pointer"
                onClick={handlePlay}
              >
                <div className="w-24 h-24 rounded-full bg-primary/90 flex items-center justify-center mb-4">
                  <Play className="w-12 h-12 text-primary-foreground ml-1" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Welcome to {tierName}
                </h2>
                <p className="text-white/70 text-sm">
                  Tap to start your orientation
                </p>
              </div>
            )}

            {/* Controls for welcome video */}
            {isPlaying && (
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

            {/* Skip button after 30 seconds */}
            {showSkipButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleComplete}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 hover:text-white text-xs"
              >
                Skip Video →
              </Button>
            )}

            {/* Phase indicator */}
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-background/80 text-xs font-medium">
              Welcome Message
            </div>
          </div>
        )}

        {/* Skip directly to walkthrough if no welcome video */}
        {!isLoading && playbackPhase === "welcome" && !videos?.video_url && videos?.walkthrough_video_url && (
          <div className="w-full h-full bg-black relative flex items-center justify-center">
            <div 
              className="flex flex-col items-center cursor-pointer"
              onClick={handleStartWalkthroughDirect}
            >
              <div className="w-24 h-24 rounded-full bg-primary/90 flex items-center justify-center mb-4">
                <Play className="w-12 h-12 text-primary-foreground ml-1" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {tierName} Walkthrough
              </h2>
              <p className="text-white/70 text-sm">
                Tap to start your guided tour
              </p>
            </div>
          </div>
        )}

        {/* Walkthrough Video with Audio Overlay (Phase 2) */}
        {!isLoading && playbackPhase === "walkthrough" && videos?.walkthrough_video_url && (
          <div className="w-full h-full bg-black relative flex items-center justify-center">
            <video
              ref={walkthroughVideoRef}
              src={videos.walkthrough_video_url}
              className="w-full h-full object-contain"
              onEnded={handleWalkthroughEnd}
              playsInline
              muted // Video is muted - audio comes from AI narration
            />
            
            {/* Tap to enable narration overlay - shows when audio was blocked */}
            {needsAudioTap && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer z-10"
                onClick={startWalkthroughPlayback}
              >
                <div className="px-6 py-4 rounded-xl bg-background/90 border border-primary/30 text-center shadow-lg">
                  <Volume1 className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium text-foreground">Tap to enable narration</p>
                  <p className="text-xs text-muted-foreground mt-1">Audio was blocked by your browser</p>
                </div>
              </div>
            )}

            {/* Controls for walkthrough */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={togglePlayPause}
                className="bg-background/80 hover:bg-background"
              >
                {isPlaying && !needsAudioTap ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
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
                onClick={handleComplete}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 hover:text-white text-xs"
              >
                Skip Video →
              </Button>
            )}
            
            {/* Phase indicator */}
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-background/80 text-xs font-medium">
              Platform Walkthrough
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
