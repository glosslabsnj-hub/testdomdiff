import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Volume2, VolumeX, Play, ArrowRight } from "lucide-react";
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

  // Fetch AI-generated audio
  const { data: onboardingAudio } = useQuery({
    queryKey: ["onboarding-audio", tierKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tier_onboarding_videos")
        .select("audio_url, status")
        .eq("tier_key", tierKey)
        .single();
      
      if (error || data?.status !== "ready") return null;
      return data;
    },
  });

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

  const handleWelcomeVideoEnd = () => {
    if (videos?.walkthrough_video_url) {
      setPlaybackPhase("walkthrough");
      setTimeout(() => {
        if (walkthroughVideoRef.current) {
          walkthroughVideoRef.current.currentTime = 0;
          walkthroughVideoRef.current.play().catch(console.error);
        }
        if (audioRef.current && onboardingAudio?.audio_url) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(console.error);
        }
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
    setIsPlaying(true);
    if (playbackPhase === "welcome" && welcomeVideoRef.current) {
      welcomeVideoRef.current.play();
    }
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

          {/* Mute toggle for welcome video */}
          {isPlaying && (
            <div className="absolute bottom-4 right-4 safe-area-inset-bottom">
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
            onClick={() => {
              setPlaybackPhase("walkthrough");
              setTimeout(() => {
                walkthroughVideoRef.current?.play();
                if (audioRef.current && onboardingAudio?.audio_url) {
                  audioRef.current.play();
                }
              }, 100);
            }}
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
          
          {/* AI-generated audio overlay */}
          {onboardingAudio?.audio_url && (
            <audio
              ref={audioRef}
              src={onboardingAudio.audio_url}
              onEnded={handleWalkthroughEnd}
            />
          )}

          {/* Audio controls */}
          <div className="absolute bottom-4 right-4 safe-area-inset-bottom">
            <Button
              variant="secondary"
              size="icon"
              onClick={toggleMute}
              className="bg-background/80 hover:bg-background"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
          
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
