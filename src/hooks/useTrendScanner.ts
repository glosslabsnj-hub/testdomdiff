import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TrendScan {
  id: string;
  platform: string;
  trends: {
    title: string;
    description: string;
    content_idea: string;
    estimated_reach: "high" | "medium" | "low";
    urgency: "act_now" | "this_week" | "ongoing";
  }[];
  content_angles: {
    angle: string;
    why: string;
    example_hook: string;
  }[];
  scanned_at: string;
  expires_at: string;
}

export function useTrendScanner(platform?: string) {
  const queryClient = useQueryClient();

  const { data: scans = [], isLoading } = useQuery({
    queryKey: ["social-trend-scans", platform],
    queryFn: async () => {
      let query = (supabase as any)
        .from("social_trend_scans")
        .select("*")
        .gt("expires_at", new Date().toISOString())
        .order("scanned_at", { ascending: false });

      if (platform) {
        query = query.eq("platform", platform);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TrendScan[];
    },
  });

  const latestScan = scans[0] || null;
  const isExpired = !latestScan || new Date(latestScan.expires_at) < new Date();

  const runScan = useMutation({
    mutationFn: async (targetPlatform: string) => {
      const { data: fnData, error: fnError } = await supabase.functions.invoke(
        "social-trend-scan",
        { body: { platform: targetPlatform } }
      );
      if (fnError) throw fnError;

      const scan = fnData.scan;
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { data, error } = await (supabase as any)
        .from("social_trend_scans")
        .insert({
          platform: targetPlatform,
          trends: scan.trends || [],
          content_angles: scan.content_angles || [],
          scanned_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-trend-scans"] });
      toast.success("Trend scan complete!");
    },
    onError: (error: any) => {
      toast.error("Failed to scan trends");
      console.error(error);
    },
  });

  return {
    scans,
    latestScan,
    isLoading,
    isExpired,
    runScan,
  };
}
