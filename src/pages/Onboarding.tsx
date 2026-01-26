import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Volume2, VolumeX, Play, ArrowRight, Pause, Volume1 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";

type PlaybackPhase = "welcome" | "walkthrough" | "complete";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { isCoaching, isTransformation } = useEffectiveSubscription();
  
  const [playbackPhase, setPlaybackPhase] = useState<PlaybackPhase>("welcome");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [needsAudioTap, setNeedsAudioTap] = useState(false);
  const [audioPrimed, setAudioPrimed] = useState(false);
  
  const welcomeVideoRef = useRef<HTMLVideoElement>(null);
  const walkthroughVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Determine tier key based on subscription
  const tierKey = isCoaching ? "coaching" : isTransformation ? "transformation" : "membership";
  const tierName = isCoaching ? "Free World" : isTransformation ? "General Population" : "Solitary Confinement";

  // Redirect if already watched
  useEffect(() => {
    if (profile?.first_login_video_watched) {
      navigate("/dashboard", { replace: true });
    }
  }, [profile, navigate]);

  // Fetch video URLs
  const { data: videos, isLoading } = useQuery({
    queryKey: ["onboarding-videos", tierKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("program_welcome_videos")
        .select("video_url, walkthrough_video_url")
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
    queryKey: ["onboarding-audio", tierKey, configVersion],
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
    if (playbackPhase !== "walkthrough" || !onboardingAudio?.audio_url) return;
    
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
        video.currentTime = audioCurrent;
      }
    }, 500);

    return () => clearInterval(syncInterval);
  }, [playbackPhase, onboardingAudio?.audio_url]);

  // Prime audio on first user tap to unlock mobile autoplay
  const primeAudioForMobile = () => {
    if (audioPrimed || !audioRef.current || !onboardingAudio?.audio_url) return;
    
    const audio = audioRef.current;
    const previousMuted = audio.muted;
    audio.muted = true;
    audio.play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = previousMuted;
        setAudioPrimed(true);
        console.log("[Onboarding] Audio primed for mobile playback");
      })
      .catch(() => {
        audio.muted = previousMuted;
        console.log("[Onboarding] Audio priming failed");
      });
  };

  const startWalkthroughPlayback = async () => {
    console.log("[Onboarding] Starting walkthrough playback");
    setNeedsAudioTap(false);
    
    if (walkthroughVideoRef.current) {
      walkthroughVideoRef.current.currentTime = 0;
      walkthroughVideoRef.current.play().catch(console.error);
    }
    
    if (audioRef.current && onboardingAudio?.audio_url) {
      audioRef.current.currentTime = 0;
      try {
        await audioRef.current.play();
        console.log("[Onboarding] Audio started successfully");
      } catch (error) {
        console.log("[Onboarding] Audio autoplay blocked, showing tap overlay");
        // Audio was blocked - pause video and show tap overlay
        walkthroughVideoRef.current?.pause();
        setNeedsAudioTap(true);
      }
    }
  };

  const handleWelcomeVideoEnd = () => {
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
    setIsComplete(true);
    
    // Update profile to mark video as watched
    if (user) {
      await supabase
        .from("profiles")
        .update({ first_login_video_watched: true })
        .eq("user_id", user.id);
      
      // Refresh profile to update state
      await refreshProfile();
    }
  };

  const handleContinue = () => {
    navigate("/dashboard", { replace: true });
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

  // Auto-complete if no videos available
  useEffect(() => {
    if (!isLoading && (!videos?.video_url && !videos?.walkthrough_video_url)) {
      handleComplete();
    }
  }, [isLoading, videos]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Always mount audio element for mobile reliability */}
      <audio
        ref={audioRef}
        src={onboardingAudio?.audio_url || ""}
        preload="auto"
        onEnded={handleWalkthroughEnd}
        onPlay={() => setIsPlaying(true)}
        onPause={() => !needsAudioTap && setIsPlaying(false)}
      />

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading your orientation...</p>
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
            <div className="absolute bottom-4 right-4 safe-area-inset-bottom flex gap-2">
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
              className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 hover:text-white text-xs safe-area-inset-bottom"
            >
              Skip Video →
            </Button>
          )}

          {/* Phase indicator */}
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-background/80 text-xs font-medium safe-area-inset-top">
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
          <div className="absolute bottom-4 right-4 safe-area-inset-bottom flex gap-2">
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
              className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 hover:text-white text-xs safe-area-inset-bottom"
            >
              Skip Video →
            </Button>
          )}
          
          {/* Phase indicator */}
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-background/80 text-xs font-medium safe-area-inset-top">
            Platform Walkthrough
          </div>
        </div>
      )}

      {/* Completion state */}
      {isComplete && (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center p-8">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
            <ArrowRight className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 text-center">
            Orientation Complete
          </h1>
          <p className="text-muted-foreground text-center mb-8 max-w-md">
            You're ready to start your journey. Let's get to work.
          </p>
          <Button 
            variant="hero" 
            size="hero" 
            onClick={handleContinue}
            className="gap-2"
          >
            Enter {tierName} <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
