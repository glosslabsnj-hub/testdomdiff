import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ContentCategory =
  | "faith"
  | "discipline"
  | "training"
  | "hustle"
  | "transformations"
  | "authority"
  | "platform"
  | "story"
  | "culture"
  | "controversy";

export type ContentMode = "done_for_you" | "freestyle";
export type ContentStatus = "fresh" | "used" | "favorite";

export type ContentStrategyType =
  | "hot_take"
  | "trending"
  | "story"
  | "value"
  | "engagement"
  | "promo";

export interface ContentPost {
  id: string;
  category: ContentCategory;
  mode: ContentMode;
  title: string;
  platforms: string[];
  format: string | null;
  hook: string;
  talking_points: string[];
  filming_tips: string | null;
  cta: string | null;
  status: ContentStatus;
  created_at: string;
  used_at: string | null;
  updated_at: string;
  strategy_type?: ContentStrategyType | null;
  hashtags?: string[] | null;
  why_it_works?: string | null;
}

export interface ContentPostInput {
  category: ContentCategory;
  mode: ContentMode;
  title: string;
  platforms: string[];
  format?: string;
  hook: string;
  talking_points: string[];
  filming_tips?: string;
  cta?: string;
  strategy_type?: ContentStrategyType;
  hashtags?: string[];
  why_it_works?: string;
}

interface UseContentEngineFilters {
  category?: ContentCategory | "all";
  mode?: ContentMode | "all";
  status?: ContentStatus | "all";
}

export function useContentEngine(filters: UseContentEngineFilters = {}) {
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ["content-engine-posts", filters],
    queryFn: async () => {
      let query = supabase
        .from("content_engine_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters.category && filters.category !== "all") {
        query = query.eq("category", filters.category);
      }
      if (filters.mode && filters.mode !== "all") {
        query = query.eq("mode", filters.mode);
      }
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ContentPost[];
    },
  });

  const createPost = useMutation({
    mutationFn: async (input: ContentPostInput) => {
      const { data, error } = await supabase
        .from("content_engine_posts")
        .insert({
          category: input.category,
          mode: input.mode,
          title: input.title,
          platforms: input.platforms,
          format: input.format || null,
          hook: input.hook,
          talking_points: input.talking_points,
          filming_tips: input.filming_tips || null,
          cta: input.cta || null,
          status: "fresh",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-engine-posts"] });
      toast.success("Content saved to library");
    },
    onError: (error) => {
      toast.error("Failed to save content");
      console.error("Create post error:", error);
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ContentStatus }) => {
      const updateData: { status: ContentStatus; used_at?: string | null } = { status };

      if (status === "used") {
        updateData.used_at = new Date().toISOString();
      } else if (status === "fresh") {
        updateData.used_at = null;
      }

      const { data, error } = await supabase
        .from("content_engine_posts")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-engine-posts"] });
    },
    onError: (error) => {
      toast.error("Failed to update status");
      console.error("Update status error:", error);
    },
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("content_engine_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-engine-posts"] });
      toast.success("Content deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete content");
      console.error("Delete post error:", error);
    },
  });

  return {
    posts,
    isLoading,
    error,
    createPost,
    updateStatus,
    deletePost,
  };
}

// Hook for generating content via edge function
export function useContentGenerator() {
  const generateContent = async (
    category: ContentCategory | "surprise",
    mode: ContentMode,
    strategy_type: ContentStrategyType | "surprise" = "surprise"
  ): Promise<ContentPostInput[]> => {
    const { data, error } = await supabase.functions.invoke("generate-content-ideas", {
      body: { category, mode, strategy_type },
    });

    if (error) {
      console.error("Generate content error:", error);
      throw new Error("Failed to generate content ideas");
    }

    return data.ideas;
  };

  return { generateContent };
}
