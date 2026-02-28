import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ViralResearchResult {
  id: string;
  source_url: string | null;
  research_type: string;
  data: {
    viral_hooks?: { hook: string; why_it_works: string; dom_adaptation: string }[];
    content_patterns?: { pattern: string; description: string; frequency: string; dom_angle: string }[];
    trending_formats?: { format: string; description: string; example: string; fit_for_dom: string }[];
    trending_audio?: { name: string; description: string; use_case: string }[];
    hashtag_clusters?: { primary: string; related: string[]; estimated_reach: string }[];
    key_takeaways?: string[];
  };
  fetched_at: string;
  created_at: string;
}

export function useViralResearch() {
  const queryClient = useQueryClient();

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["viral-research"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("viral_research_results")
        .select("*")
        .order("fetched_at", { ascending: false })
        .limit(20);

      if (error) {
        if (error.code === "PGRST205" || error.code === "42P01") {
          return [];
        }
        throw error;
      }
      return data as ViralResearchResult[];
    },
    retry: false,
  });

  const runResearch = useMutation({
    mutationFn: async (input: {
      url?: string;
      research_type?: string;
      competitor_handle?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke(
        "firecrawl-viral-research",
        { body: input }
      );
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["viral-research"] });
      toast.success("Viral research complete!");
    },
    onError: (error: any) => {
      toast.error("Failed to run viral research");
      console.error("Viral research error:", error);
    },
  });

  const latestResult = results[0] || null;

  return {
    results,
    latestResult,
    isLoading,
    runResearch,
  };
}
