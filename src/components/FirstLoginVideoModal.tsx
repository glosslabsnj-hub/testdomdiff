import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, X, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FirstLoginVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  isReplay?: boolean;
}

export function FirstLoginVideoModal({ isOpen, onClose, isReplay = false }: FirstLoginVideoModalProps) {
  const { profile } = useAuth();
  const { subscription, isCoaching, isTransformation, isMembership } = useEffectiveSubscription();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [canClose, setCanClose] = useState(isReplay);
  const [closeCountdown, setCloseCountdown] = useState(5);
  const [hasEnded, setHasEnded] = useState(false);

  // Get the tier key for fetching the correct video
  const tierKey = subscription?.plan_type || "membership";
  const tierName = isCoaching ? "Free World" : isTransformation ? "General Population" : "Solitary Confinement";

  // Fetch the video URL for this tier
  const { data: videoData, isLoading } = useQuery({
    queryKey: ["first-login-video", tierKey],
    queryFn: async () => {
      // First check for generated MP4 video
      const { data: generatedVideo } = await supabase
        .from("tier_onboarding_videos")
        .select("mp4_url, audio_url, captions_srt_url, status")
        .eq("tier_key", tierKey)
        .eq("status", "ready")
        .order("tier_config_version", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (generatedVideo?.mp4_url) {
        return {
          videoUrl: generatedVideo.mp4_url,
          captionsUrl: generatedVideo.captions_srt_url,
          hasVideo: true,
        };
      }

      // Fallback to admin-uploaded walkthrough video
      const { data: welcomeVideo } = await supabase
        .from("program_welcome_videos")
        .select("walkthrough_video_url, video_url")
        .eq("plan_type", tierKey)
        .maybeSingle();

      const videoUrl = welcomeVideo?.walkthrough_video_url || welcomeVideo?.video_url;
      
      return {
        videoUrl,
        captionsUrl: null,
        hasVideo: !!videoUrl,
      };
    },
    enabled: isOpen,
  });

  // 5-second countdown before allowing close (unless replay mode)
  useEffect(() => {
    if (!isOpen || isReplay || canClose) return;

    const timer = setInterval(() => {
      setCloseCountdown((prev) => {
        if (prev <= 1) {
          setCanClose(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isReplay, canClose]);

  // Auto-play when modal opens
  useEffect(() => {
    if (isOpen && videoRef.current && videoData?.videoUrl) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.log("Autoplay blocked:", err);
        setIsPlaying(false);
      });
    }
  }, [isOpen, videoData?.videoUrl]);

  // Handle video end
  const handleVideoEnd = useCallback(() => {
    setHasEnded(true);
    setIsPlaying(false);
  }, []);

  // Mark video as watched and close
  const handleClose = useCallback(async () => {
    if (!canClose) return;

    // Update profile to mark video as watched
    if (profile?.user_id && !isReplay) {
      await supabase
        .from("profiles")
        .update({ first_login_video_watched: true })
        .eq("user_id", profile.user_id);
    }

    onClose();
  }, [canClose, profile?.user_id, isReplay, onClose]);

  // Navigation actions
  const handleStartHere = useCallback(async () => {
    await handleClose();
    navigate("/dashboard/start-here");
  }, [handleClose, navigate]);

  const handleGeneratePlan = useCallback(async () => {
    await handleClose();
    navigate("/dashboard/program");
  }, [handleClose, navigate]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Replay video
  const replayVideo = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
    setHasEnded(false);
  }, []);

  // Don't render if no video available
  if (!videoData?.hasVideo && !isLoading) {
    // Still close and mark as watched so it doesn't keep showing
    if (isOpen && !isReplay) {
      handleClose();
    }
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent 
        className="max-w-md p-0 gap-0 overflow-hidden bg-charcoal border-primary/30"
        onPointerDownOutside={(e) => !canClose && e.preventDefault()}
        onEscapeKeyDown={(e) => !canClose && e.preventDefault()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary/20 to-transparent p-4 border-b border-primary/20">
          <h2 className="text-lg font-bold text-foreground">
            Welcome to {tierName}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isReplay ? "Replay your orientation" : "Your orientation video"}
          </p>
          
          {/* Close button with countdown */}
          <button
            onClick={handleClose}
            disabled={!canClose}
            className={cn(
              "absolute top-4 right-4 p-1.5 rounded-full transition-all",
              canClose 
                ? "bg-muted/50 hover:bg-muted text-foreground" 
                : "bg-muted/20 text-muted-foreground cursor-not-allowed"
            )}
          >
            {canClose ? (
              <X className="w-4 h-4" />
            ) : (
              <span className="text-xs font-mono w-4 h-4 flex items-center justify-center">
                {closeCountdown}
              </span>
            )}
          </button>
        </div>

        {/* Video Container - 9:16 aspect ratio */}
        <div className="relative aspect-[9/16] max-h-[60vh] bg-black">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : videoData?.videoUrl ? (
            <>
              <video
                ref={videoRef}
                src={videoData.videoUrl}
                className="w-full h-full object-contain"
                muted={isMuted}
                playsInline
                onEnded={handleVideoEnd}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                {videoData.captionsUrl && (
                  <track 
                    kind="captions" 
                    src={videoData.captionsUrl} 
                    srcLang="en" 
                    label="English"
                    default 
                  />
                )}
              </video>

              {/* Video Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-full bg-primary/80 hover:bg-primary text-primary-foreground transition-colors"
                  >
                    {hasEnded ? (
                      <RotateCcw className="w-5 h-5" onClick={replayVideo} />
                    ) : isPlaying ? (
                      <span className="w-5 h-5 flex items-center justify-center text-sm">❚❚</span>
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>
                  
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-full bg-muted/50 hover:bg-muted text-foreground transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>

                  <span className="text-xs text-white/70 ml-auto">
                    {isMuted && "Tap to unmute"}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <p>Video not available</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 space-y-2 bg-charcoal">
          <Button 
            variant="gold" 
            className="w-full" 
            size="lg"
            onClick={handleStartHere}
          >
            {isCoaching ? "Welcome Home" : "Start Intake Processing"}
          </Button>
          
          {!isMembership && (
            <Button 
              variant="goldOutline" 
              className="w-full"
              onClick={handleGeneratePlan}
            >
              {isCoaching ? "View My Program" : "Begin The Sentence"}
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            className="w-full text-muted-foreground"
            onClick={handleClose}
            disabled={!canClose}
          >
            {canClose ? "Skip for now" : `Skip in ${closeCountdown}s`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to manage first-login video state
export function useFirstLoginVideo() {
  const { profile } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isReplay, setIsReplay] = useState(false);

  // Check if user should see the first-login video
  useEffect(() => {
    if (profile && !profile.first_login_video_watched && profile.intake_completed_at) {
      // User has completed intake but hasn't watched the video
      setShowModal(true);
      setIsReplay(false);
    }
  }, [profile]);

  const openReplay = useCallback(() => {
    setShowModal(true);
    setIsReplay(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  return {
    showModal,
    isReplay,
    openReplay,
    closeModal,
  };
}
