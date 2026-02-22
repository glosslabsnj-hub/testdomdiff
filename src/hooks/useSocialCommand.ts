import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SocialCommandConfig {
  id: string;
  onboarding_completed: boolean;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  youtube_handle: string | null;
  twitter_handle: string | null;
  posting_cadence: Record<string, number>;
  content_pillars: string[];
  brand_voice_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialCommandConfigInput {
  onboarding_completed?: boolean;
  instagram_handle?: string | null;
  tiktok_handle?: string | null;
  youtube_handle?: string | null;
  twitter_handle?: string | null;
  posting_cadence?: Record<string, number>;
  content_pillars?: string[];
  brand_voice_notes?: string | null;
}

export function useSocialCommand() {
  const queryClient = useQueryClient();

  const { data: config, isLoading, error } = useQuery({
    queryKey: ["social-command-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_command_config")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as SocialCommandConfig | null;
    },
  });

  const upsertConfig = useMutation({
    mutationFn: async (input: SocialCommandConfigInput) => {
      if (config?.id) {
        const { data, error } = await supabase
          .from("social_command_config")
          .update(input)
          .eq("id", config.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("social_command_config")
          .insert(input)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-command-config"] });
    },
    onError: (error) => {
      toast.error("Failed to save configuration");
      console.error("Upsert config error:", error);
    },
  });

  const activePlatforms = config
    ? [
        config.instagram_handle ? "instagram" : null,
        config.tiktok_handle ? "tiktok" : null,
        config.youtube_handle ? "youtube" : null,
        config.twitter_handle ? "twitter" : null,
      ].filter(Boolean) as string[]
    : [];

  return {
    config,
    isLoading,
    error,
    upsertConfig,
    activePlatforms,
    onboardingCompleted: config?.onboarding_completed ?? false,
  };
}
