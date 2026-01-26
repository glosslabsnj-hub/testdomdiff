import { useState, useEffect, useRef } from "react";
import { X, Loader2, Volume2, VolumeX, Play } from "lucide-react";
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
  
  const welcomeVideoRef = useRef<HTMLVideoElement>(null);
  const walkthroughVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch video URLs
  const { data: videos, isLoading } = useQuery({
    queryKey: ["welcome-videos-modal", tierKey],
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
    queryKey: ["onboarding-audio-modal", tierKey],
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

  // Sync audio with walkthrough video
  useEffect(() => {
    if (playbackPhase !== "walkthrough") return;
    
    const syncInterval = setInterval(() => {
      if (walkthroughVideoRef.current && audioRef.current) {
        const videoCurrent = walkthroughVideoRef.current.currentTime;
        const audioCurrent = audioRef.current.currentTime;
        const diff = Math.abs(videoCurrent - audioCurrent);
        
        if (diff > 0.5) {
          walkthroughVideoRef.current.currentTime = audioRef.current.currentTime;
        }
      }
    }, 1000);

    return () => clearInterval(syncInterval);
  }, [playbackPhase]);

  const handleWelcomeVideoEnd = () => {
    if (videos?.walkthrough_video_url) {
      setPlaybackPhase("walkthrough");
      setTimeout(() => {
        walkthroughVideoRef.current?.play();
        if (audioRef.current && onboardingAudio?.audio_url) {
          audioRef.current.play();
        }
      }, 500);
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

  // Don't render if no videos available
  if (!isLoading && (!videos?.video_url && !videos?.walkthrough_video_url)) {
    // Auto-complete if no videos
    handleComplete();
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-4xl w-[95vw] p-0 bg-black border-primary/30 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => !closeUnlocked && e.preventDefault()}
      >
        <VisuallyHidden>
          <DialogTitle>{tierName} Orientation</DialogTitle>
        </VisuallyHidden>
        
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
          <div className="aspect-video flex items-center justify-center bg-black">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        )}

        {/* Welcome Video (Phase 1) */}
        {!isLoading && playbackPhase === "welcome" && videos?.video_url && (
          <div className="aspect-video bg-black relative">
            <video
              ref={welcomeVideoRef}
              src={videos.video_url}
              className="w-full h-full"
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
              <div className="absolute bottom-4 right-4">
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

        {/* Skip directly to walkthrough if no welcome video */}
        {!isLoading && playbackPhase === "welcome" && !videos?.video_url && videos?.walkthrough_video_url && (
          <div className="aspect-video bg-black relative flex items-center justify-center">
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
          <div className="aspect-video bg-black relative">
            <video
              ref={walkthroughVideoRef}
              src={videos.walkthrough_video_url}
              className="w-full h-full"
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
            <div className="absolute bottom-4 right-4">
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
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-background/80 text-xs font-medium">
              Platform Walkthrough
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
