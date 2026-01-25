import { useState, useEffect } from "react";
import { Play, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface WelcomeVideoStepProps {
  onReady: () => void;
}

interface WelcomeVideo {
  video_url: string | null;
  video_title: string;
  video_description: string | null;
}

export default function WelcomeVideoStep({ onReady }: WelcomeVideoStepProps) {
  const { subscription } = useEffectiveSubscription();
  const { profile } = useAuth();
  const [video, setVideo] = useState<WelcomeVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [watched, setWatched] = useState(false);
  const [watchTimer, setWatchTimer] = useState(0);

  const planType = subscription?.plan_type || "membership";

  // Fetch welcome video
  useEffect(() => {
    const fetchVideo = async () => {
      const { data } = await supabase
        .from("program_welcome_videos")
        .select("video_url, video_title, video_description")
        .eq("plan_type", planType)
        .single();

      if (data) {
        setVideo(data);
      }
      setLoading(false);
    };

    fetchVideo();
  }, [planType]);

  // Check if already watched
  useEffect(() => {
    if (profile?.onboarding_video_watched) {
      setWatched(true);
      onReady();
    }
  }, [profile, onReady]);

  // Timer when modal is open
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (showModal && !watched) {
      interval = setInterval(() => {
        setWatchTimer((prev) => {
          const newTime = prev + 1;
          // Allow proceeding after 30 seconds
          if (newTime >= 30 && !watched) {
            setWatched(true);
            markVideoWatched();
            onReady();
          }
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [showModal, watched, onReady]);

  const markVideoWatched = async () => {
    if (!profile) return;
    
    await supabase
      .from("profiles")
      .update({ onboarding_video_watched: true })
      .eq("user_id", profile.user_id);
  };

  const handleSkip = () => {
    setWatched(true);
    markVideoWatched();
    onReady();
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Dom Has a Message For You</h2>
        <p className="text-muted-foreground">
          Before we get started, watch this quick welcome video from your coach.
        </p>
      </div>

      {/* Video Card */}
      <div className="bg-charcoal rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setShowModal(true)}
          className="relative w-full aspect-video bg-black/50 group"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center transition-all",
              watched 
                ? "bg-primary" 
                : "bg-white/20 group-hover:bg-white/30 group-hover:scale-110"
            )}>
              {watched ? (
                <Check className="w-10 h-10 text-primary-foreground" />
              ) : (
                <Play className="w-10 h-10 text-white ml-1" />
              )}
            </div>
          </div>
          {watched && (
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
              Watched ✓
            </div>
          )}
        </button>
        
        <div className="p-6">
          <h3 className="font-semibold text-lg mb-2">
            {video?.video_title || "Welcome to the Program"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {video?.video_description || "A personal message from Dom about your journey ahead."}
          </p>
          
          {!watched && (
            <div className="mt-4 flex items-center gap-4">
              <Button variant="gold" onClick={() => setShowModal(true)} className="gap-2">
                <Play className="w-4 h-4" />
                Watch Video
              </Button>
              <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
                Skip for now
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl p-0 bg-black">
          <div className="aspect-video">
            {video?.video_url ? (
              <iframe
                src={video.video_url}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-charcoal">
                <p className="text-muted-foreground">Video coming soon</p>
              </div>
            )}
          </div>
          
          {!watched && (
            <div className="absolute bottom-4 right-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSkip}
                className="bg-background/80 backdrop-blur-sm"
              >
                Skip ({Math.max(0, 30 - watchTimer)}s)
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Why This Matters */}
      <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <h4 className="font-medium text-foreground text-sm mb-1">💡 Why This Matters</h4>
        <p className="text-sm text-muted-foreground">
          Dom created this video specifically for you. It covers the mindset and approach 
          you'll need to succeed in this program. Taking 2 minutes now sets you up for 12 weeks of success.
        </p>
      </div>
    </div>
  );
}
