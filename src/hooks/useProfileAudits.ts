import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProfileAudit {
  id: string;
  platform: string;
  audit_data: {
    score: number;
    optimized_bio: string;
    quick_wins: string[];
    advanced_tips: string[];
  };
  score: number;
  recommendations: {
    id: string;
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    category: string;
  }[];
  completed_items: string[];
  created_at: string;
  updated_at: string;
}

export interface AuditInput {
  platform: string;
  current_bio?: string;
  has_highlights?: boolean;
  has_pinned_post?: boolean;
  has_link_in_bio?: boolean;
  handle?: string;
  extra_context?: string;
}

export function useProfileAudits(platform?: string) {
  const queryClient = useQueryClient();

  const { data: audits = [], isLoading } = useQuery({
    queryKey: ["social-profile-audits", platform],
    queryFn: async () => {
      let query = supabase
        .from("social_profile_audits")
        .select("*")
        .order("created_at", { ascending: false });

      if (platform) {
        query = query.eq("platform", platform);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ProfileAudit[];
    },
  });

  const latestAudit = audits[0] || null;

  const runAudit = useMutation({
    mutationFn: async (input: AuditInput) => {
      const { data: fnData, error: fnError } = await supabase.functions.invoke(
        "social-profile-audit",
        { body: input }
      );
      if (fnError) throw fnError;

      const audit = fnData.audit;

      const { data, error } = await supabase
        .from("social_profile_audits")
        .insert({
          platform: input.platform,
          audit_data: audit,
          score: audit.score || 0,
          recommendations: audit.recommendations || [],
          completed_items: [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-profile-audits"] });
      toast.success("Profile audit complete!");
    },
    onError: (error) => {
      toast.error("Failed to run profile audit");
      console.error(error);
    },
  });

  const toggleCompleted = useMutation({
    mutationFn: async ({ auditId, itemId }: { auditId: string; itemId: string }) => {
      const audit = audits.find((a) => a.id === auditId);
      if (!audit) throw new Error("Audit not found");

      const completed = audit.completed_items || [];
      const updated = completed.includes(itemId)
        ? completed.filter((i: string) => i !== itemId)
        : [...completed, itemId];

      // Recalculate score based on completion
      const totalItems = (audit.recommendations || []).length;
      const completedCount = updated.length;
      const newScore = totalItems > 0
        ? Math.round((completedCount / totalItems) * 100)
        : audit.score;

      const { data, error } = await supabase
        .from("social_profile_audits")
        .update({ completed_items: updated, score: newScore })
        .eq("id", auditId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-profile-audits"] });
    },
    onError: (error) => {
      toast.error("Failed to update checklist");
      console.error(error);
    },
  });

  return {
    audits,
    latestAudit,
    isLoading,
    runAudit,
    toggleCompleted,
  };
}
