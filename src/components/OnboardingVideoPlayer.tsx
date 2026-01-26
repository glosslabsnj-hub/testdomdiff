import { useState, useEffect } from "react";
import { Play, RefreshCw, Loader2, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

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
  const [walkthroughUrl, setWalkthroughUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasWatched, setHasWatched] = useState(false);

  // Fetch walkthrough video URL for this tier
  useEffect(() => {
    const fetchWalkthrough = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("program_welcome_videos")
        .select("walkthrough_video_url")
        .eq("plan_type", tierKey)
        .single();

      if (!error && data?.walkthrough_video_url) {
        setWalkthroughUrl(data.walkthrough_video_url);
      }
      setLoading(false);
    };

    fetchWalkthrough();
  }, [tierKey]);

  const handleVideoEnd = () => {
    setHasWatched(true);
    onVideoWatched?.();
  };

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

  // No walkthrough video uploaded yet
  if (!walkthroughUrl) {
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
          {/* Video Player */}
          <div className="aspect-video bg-black">
            <video
              src={walkthroughUrl}
              controls
              className="w-full h-full"
              onEnded={handleVideoEnd}
              playsInline
            />
          </div>

          {/* Watched badge */}
          {hasWatched && (
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
