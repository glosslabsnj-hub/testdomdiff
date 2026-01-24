import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface TimeOverride {
  routine_index: number;
  custom_time: string;
}

export function useRoutineTimeOverrides(templateId: string | null) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [overrides, setOverrides] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchOverrides = useCallback(async () => {
    if (!user || !templateId) {
      setOverrides(new Map());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_routine_times")
        .select("routine_index, custom_time")
        .eq("user_id", user.id)
        .eq("template_id", templateId);

      if (error) throw error;

      const map = new Map<number, string>();
      (data || []).forEach((item: TimeOverride) => {
        map.set(item.routine_index, item.custom_time);
      });
      setOverrides(map);
    } catch (e) {
      console.error("Error fetching time overrides:", e);
    } finally {
      setLoading(false);
    }
  }, [user, templateId]);

  useEffect(() => {
    fetchOverrides();
  }, [fetchOverrides]);

  const saveTimeOverride = useCallback(async (routineIndex: number, newTime: string) => {
    if (!user || !templateId) return;

    try {
      // Upsert the time override
      const { error } = await supabase
        .from("user_routine_times")
        .upsert({
          user_id: user.id,
          template_id: templateId,
          routine_index: routineIndex,
          custom_time: newTime,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,template_id,routine_index"
        });

      if (error) throw error;

      setOverrides(prev => {
        const next = new Map(prev);
        next.set(routineIndex, newTime);
        return next;
      });

      toast({
        title: "Time Updated",
        description: "Your schedule has been customized.",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to save time",
        variant: "destructive",
      });
      throw e;
    }
  }, [user, templateId, toast]);

  const getTime = useCallback((routineIndex: number, defaultTime: string): string => {
    return overrides.get(routineIndex) || defaultTime;
  }, [overrides]);

  return {
    loading,
    overrides,
    saveTimeOverride,
    getTime,
    refetch: fetchOverrides,
  };
}
