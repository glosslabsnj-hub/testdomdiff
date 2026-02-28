import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ScriptHook {
  what_to_say: string;
  how_to_say_it: string;
  camera_notes: string;
  duration: string;
}

export interface ScriptBodySection {
  section: string;
  what_to_say: string;
  how_to_say_it: string;
  b_roll_notes: string;
}

export interface ScriptCTA {
  what_to_say: string;
  on_screen_text: string;
}

export interface ScriptData {
  hook: ScriptHook;
  body: ScriptBodySection[];
  cta: ScriptCTA;
  caption: string;
  hashtags: string[];
  thumbnail_idea: string;
  filming_checklist: string[];
  total_duration: string;
  equipment_needed: string;
}

export interface ContentScript {
  id: string;
  content_post_id: string | null;
  script_data: ScriptData;
  platform: string;
  title: string | null;
  content_type: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerateScriptInput {
  title?: string;
  topic?: string;
  platform?: string;
  content_type?: string;
  category?: string;
  hook_idea?: string;
  talking_points?: string[];
  content_post_id?: string;
  situation?: string;
}

export function useContentScripts() {
  const queryClient = useQueryClient();

  const { data: scripts = [], isLoading } = useQuery({
    queryKey: ["content-scripts"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("content_scripts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code === "PGRST205" || error.code === "42P01") {
          return [];
        }
        throw error;
      }
      return data as ContentScript[];
    },
    retry: false,
  });

  const generateScript = useMutation({
    mutationFn: async (input: GenerateScriptInput) => {
      const { data, error } = await supabase.functions.invoke(
        "generate-content-script",
        { body: input }
      );
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-scripts"] });
      toast.success("Script generated!");
    },
    onError: (error: any) => {
      toast.error("Failed to generate script");
      console.error("Script generation error:", error);
    },
  });

  const deleteScript = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("content_scripts")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-scripts"] });
      toast.success("Script deleted");
    },
    onError: () => {
      toast.error("Failed to delete script");
    },
  });

  return {
    scripts,
    isLoading,
    generateScript,
    deleteScript,
  };
}
