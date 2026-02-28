import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InstagramInsights {
  username: string;
  full_name: string;
  biography: string;
  follower_count: number;
  following_count: number;
  post_count: number;
  is_verified: boolean;
  profile_pic_url: string;
  external_url: string;
  engagement_rate: number;
  avg_likes: number;
  avg_comments: number;
  posts_per_week: number;
  top_posts: {
    url: string;
    caption: string;
    likes: number;
    comments: number;
    timestamp: string;
    type: string;
    engagement: number;
  }[];
  recent_posts: any[];
  growth_trend: string;
}

export interface InsightsRow {
  id: string;
  profile_handle: string;
  data: InstagramInsights;
  fetched_at: string;
  expires_at: string;
  created_at: string;
}

export function useInstagramInsights(handle = "domdifferent_") {
  const queryClient = useQueryClient();

  const { data: insights, isLoading } = useQuery({
    queryKey: ["instagram-insights", handle],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("instagram_insights")
        .select("*")
        .eq("profile_handle", handle)
        .order("fetched_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        if (error.code === "PGRST205" || error.code === "42P01") {
          return null;
        }
        throw error;
      }
      return data as InsightsRow | null;
    },
    retry: false,
  });

  const isExpired = !insights || new Date(insights.expires_at) < new Date();

  const fetchInsights = useMutation({
    mutationFn: async (handles: string[] = [handle]) => {
      const { data, error } = await supabase.functions.invoke(
        "apify-instagram-insights",
        { body: { handles } }
      );
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instagram-insights"] });
      toast.success("Instagram insights updated!");
    },
    onError: (error: any) => {
      toast.error("Failed to fetch Instagram insights");
      console.error("Instagram insights error:", error);
    },
  });

  // Get historical data for growth chart
  const { data: history = [] } = useQuery({
    queryKey: ["instagram-insights-history", handle],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("instagram_insights")
        .select("data, fetched_at")
        .eq("profile_handle", handle)
        .order("fetched_at", { ascending: true })
        .limit(30);

      if (error) return [];
      return (data || []).map((row: any) => ({
        date: row.fetched_at,
        followers: row.data?.follower_count || 0,
        engagement: row.data?.engagement_rate || 0,
      }));
    },
    retry: false,
  });

  return {
    insights: insights?.data || null,
    raw: insights,
    isLoading,
    isExpired,
    fetchInsights,
    history,
  };
}
