import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface DurationOverride {
  routine_index: number;
  duration_minutes: number;
}

// Smart defaults based on routine action text
const DURATION_DEFAULTS: Record<string, number> = {
  // Wake up / Morning
  "wake": 5,
  "rise": 5,
  "bed": 5,
  // Cold exposure
  "cold": 5,
  "shower": 10,
  // Scripture / Faith
  "scripture": 20,
  "bible": 20,
  "devotional": 20,
  "prayer": 15,
  "meditat": 15,
  // Training
  "training": 45,
  "workout": 45,
  "exercise": 45,
  "lift": 45,
  // Meal
  "meal": 30,
  "breakfast": 20,
  "lunch": 20,
  "dinner": 30,
  "prep": 30,
  "cook": 30,
  // Review / Planning
  "review": 15,
  "plan": 15,
  "journal": 15,
  // Wind down
  "screen": 30,
  "wind": 30,
  "relax": 30,
  // Accountability
  "text": 5,
  "call": 10,
  "accountability": 10,
};

export function getSmartDefaultDuration(actionText: string): number {
  const lowerText = actionText.toLowerCase();
  
  for (const [keyword, duration] of Object.entries(DURATION_DEFAULTS)) {
    if (lowerText.includes(keyword)) {
      return duration;
    }
  }
  
  // Default fallback
  return 15;
}

export function useRoutineDurations(templateId: string | null) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [overrides, setOverrides] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchOverrides = useCallback(async () => {
    if (!user || !templateId) {
      setOverrides(new Map());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_routine_durations")
        .select("routine_index, duration_minutes")
        .eq("user_id", user.id)
        .eq("template_id", templateId);

      if (error) throw error;

      const map = new Map<number, number>();
      (data || []).forEach((item: DurationOverride) => {
        map.set(item.routine_index, item.duration_minutes);
      });
      setOverrides(map);
    } catch (e: any) {
      console.error("Error fetching duration overrides:", e);
    } finally {
      setLoading(false);
    }
  }, [user, templateId]);

  const saveDurationOverride = async (
    routineIndex: number,
    durationMinutes: number
  ): Promise<void> => {
    if (!user || !templateId) return;

    try {
      const { error } = await supabase
        .from("user_routine_durations")
        .upsert(
          {
            user_id: user.id,
            template_id: templateId,
            routine_index: routineIndex,
            duration_minutes: durationMinutes,
          },
          { onConflict: "user_id,template_id,routine_index" }
        );

      if (error) throw error;

      // Update local state
      setOverrides((prev) => {
        const next = new Map(prev);
        next.set(routineIndex, durationMinutes);
        return next;
      });

      toast({
        title: "Duration saved",
        description: `Updated to ${durationMinutes} minutes`,
      });
    } catch (e: any) {
      console.error("Error saving duration override:", e);
      toast({
        title: "Error",
        description: "Failed to save duration",
        variant: "destructive",
      });
    }
  };

  const getDuration = (
    routineIndex: number,
    actionText: string
  ): number => {
    // Check for user override first
    if (overrides.has(routineIndex)) {
      return overrides.get(routineIndex)!;
    }
    // Fall back to smart default
    return getSmartDefaultDuration(actionText);
  };

  useEffect(() => {
    fetchOverrides();
  }, [fetchOverrides]);

  return {
    loading,
    overrides,
    saveDurationOverride,
    getDuration,
    refetch: fetchOverrides,
  };
}
