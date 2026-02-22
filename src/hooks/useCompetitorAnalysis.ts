import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CompetitorAnalysis {
  id: string;
  competitor_handle: string;
  platform: string;
  analysis_data: Record<string, unknown>;
  pasted_content: string[] | null;
  notes: string | null;
  created_at: string;
}

export function useCompetitorAnalysis() {
  const queryClient = useQueryClient();

  const { data: analyses, isLoading } = useQuery({
    queryKey: ["competitor-analyses"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("social_competitor_analyses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code === "PGRST205" || error.code === "42P01") {
          return [];
        }
        throw error;
      }
      return data as CompetitorAnalysis[];
    },
    retry: false,
  });

  const analyzeCompetitor = useMutation({
    mutationFn: async (input: {
      competitor_handle: string;
      platform: string;
      pasted_content?: string[];
      notes?: string;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("social-competitor-analyze", {
        body: input,
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitor-analyses"] });
      toast.success("Competitor analysis complete");
    },
    onError: (error: any) => {
      toast.error("Failed to analyze competitor");
      console.error("Competitor analysis error:", error);
    },
  });

  const deleteAnalysis = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("social_competitor_analyses")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitor-analyses"] });
      toast.success("Analysis deleted");
    },
    onError: () => {
      toast.error("Failed to delete analysis");
    },
  });

  return {
    analyses: analyses || [],
    isLoading,
    analyzeCompetitor,
    deleteAnalysis,
  };
}
