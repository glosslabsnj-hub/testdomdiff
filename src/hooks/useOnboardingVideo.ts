import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

interface CaptionLine {
  text: string;
  start: number;
  end: number;
}

interface ScreenSlide {
  id: string;
  screen: string;
  highlight_areas?: string[];
  start: number;
  end: number;
  zoom_level?: number;
}

interface OnboardingVideo {
  id: string;
  tier_key: string;
  tier_config_version: number;
  status: "queued" | "generating_script" | "generating_audio" | "generating_captions" | "ready" | "failed";
  script_text: string | null;
  caption_lines: CaptionLine[] | null;
  screen_slides: ScreenSlide[] | null;
  voice_id: string | null;
  audio_url: string | null;
  captions_srt_url: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}

// Helper to convert Json to typed arrays
function parseCaptionLines(data: Json | null): CaptionLine[] | null {
  if (!data || !Array.isArray(data)) return null;
  return data as unknown as CaptionLine[];
}

function parseScreenSlides(data: Json | null): ScreenSlide[] | null {
  if (!data || !Array.isArray(data)) return null;
  return data as unknown as ScreenSlide[];
}

function transformVideoData(data: any): OnboardingVideo | null {
  if (!data) return null;
  return {
    ...data,
    caption_lines: parseCaptionLines(data.caption_lines),
    screen_slides: parseScreenSlides(data.screen_slides),
  } as OnboardingVideo;
}

export function useOnboardingVideo(tierKey: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current tier config version
  const { data: configVersion } = useQuery({
    queryKey: ["tier-config-version"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "tier_config_version")
        .single();

      if (error) throw error;
      return parseInt(data?.value || "1", 10);
    },
  });

  // Get the onboarding video for this tier
  const { data: video, isLoading, error, refetch } = useQuery({
    queryKey: ["onboarding-video", tierKey, configVersion],
    queryFn: async () => {
      if (!configVersion) return null;

      const { data, error } = await supabase
        .from("tier_onboarding_videos")
        .select("*")
        .eq("tier_key", tierKey)
        .eq("tier_config_version", configVersion)
        .maybeSingle();

      if (error) throw error;
      return transformVideoData(data);
    },
    enabled: !!tierKey && !!configVersion,
    refetchInterval: (query) => {
      // Poll every 5 seconds while generating
      const data = query.state.data as OnboardingVideo | null | undefined;
      if (data && ["queued", "generating_script", "generating_audio", "generating_captions"].includes(data.status)) {
        return 5000;
      }
      return false;
    },
  });

  // Trigger video generation
  const triggerGeneration = useMutation({
    mutationFn: async (forceRegenerate: boolean = false) => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tier-onboarding-generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ tier_key: tierKey, force_regenerate: forceRegenerate }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to start generation");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-video", tierKey] });
      toast({
        title: "Generation Started",
        description: "Your tier walkthrough is being generated. This takes about 2 minutes.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Check if video needs to be generated
  const needsGeneration = !video || video.status === "failed";
  const isGenerating = video && ["queued", "generating_script", "generating_audio", "generating_captions"].includes(video.status);
  const isReady = video?.status === "ready";

  return {
    video,
    isLoading,
    error,
    configVersion,
    needsGeneration,
    isGenerating,
    isReady,
    triggerGeneration,
    refetch,
  };
}

// Hook for admin to manage all tier videos
export function useTierOnboardingVideos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get config version
  const { data: configVersion, refetch: refetchVersion } = useQuery({
    queryKey: ["tier-config-version"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "tier_config_version")
        .single();

      if (error) throw error;
      return parseInt(data?.value || "1", 10);
    },
  });

  // Get all onboarding videos
  const { data: videos, isLoading, refetch } = useQuery({
    queryKey: ["all-onboarding-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tier_onboarding_videos")
        .select("*")
        .order("tier_key");

      if (error) throw error;
      return (data || []).map(transformVideoData).filter(Boolean) as OnboardingVideo[];
    },
    refetchInterval: (query) => {
      // Poll while any video is generating
      const data = query.state.data as OnboardingVideo[] | undefined;
      if (data?.some(v => ["queued", "generating_script", "generating_audio", "generating_captions"].includes(v.status))) {
        return 5000;
      }
      return false;
    },
  });

  // Increment config version (invalidates all videos)
  const incrementVersion = useMutation({
    mutationFn: async () => {
      const newVersion = (configVersion || 1) + 1;
      const { error } = await supabase
        .from("site_settings")
        .update({ value: String(newVersion) })
        .eq("key", "tier_config_version");

      if (error) throw error;
      return newVersion;
    },
    onSuccess: (newVersion) => {
      queryClient.invalidateQueries({ queryKey: ["tier-config-version"] });
      queryClient.invalidateQueries({ queryKey: ["all-onboarding-videos"] });
      toast({
        title: "Version Incremented",
        description: `Tier config is now v${newVersion}. Existing videos are invalidated.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Generate a specific tier video
  const generateVideo = useMutation({
    mutationFn: async ({ tierKey, forceRegenerate }: { tierKey: string; forceRegenerate?: boolean }) => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tier-onboarding-generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ tier_key: tierKey, force_regenerate: forceRegenerate }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to start generation");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-onboarding-videos"] });
      toast({
        title: "Generation Started",
        description: "Video generation is in progress.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    videos,
    isLoading,
    configVersion,
    incrementVersion,
    generateVideo,
    refetch,
    refetchVersion,
  };
}
