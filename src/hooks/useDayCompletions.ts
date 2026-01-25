import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DayCompletion {
  id: string;
  user_id: string;
  day_workout_id: string;
  week_number: number;
  completed_at: string;
  created_at: string;
}

export function useDayCompletions(weekNumber: number | null) {
  const { user } = useAuth();
  const [completions, setCompletions] = useState<DayCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedDayIds, setCompletedDayIds] = useState<Set<string>>(new Set());

  const fetchCompletions = useCallback(async () => {
    if (!user || weekNumber === null) {
      setCompletions([]);
      setCompletedDayIds(new Set());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("day_completions")
        .select("*")
        .eq("user_id", user.id)
        .eq("week_number", weekNumber);

      if (error) throw error;

      const completionData = (data || []) as DayCompletion[];
      setCompletions(completionData);
      setCompletedDayIds(new Set(completionData.map((c) => c.day_workout_id)));
    } catch (e: any) {
      console.error("Error fetching day completions:", e);
    } finally {
      setLoading(false);
    }
  }, [user, weekNumber]);

  const toggleDayCompletion = async (
    dayWorkoutId: string,
    weekNum: number
  ): Promise<boolean> => {
    if (!user) return false;

    const isCompleted = completedDayIds.has(dayWorkoutId);

    try {
      if (isCompleted) {
        // Remove completion
        const { error } = await supabase
          .from("day_completions")
          .delete()
          .eq("user_id", user.id)
          .eq("day_workout_id", dayWorkoutId)
          .eq("week_number", weekNum);

        if (error) throw error;

        setCompletedDayIds((prev) => {
          const next = new Set(prev);
          next.delete(dayWorkoutId);
          return next;
        });
        setCompletions((prev) =>
          prev.filter((c) => c.day_workout_id !== dayWorkoutId)
        );
      } else {
        // Add completion
        const { data, error } = await supabase
          .from("day_completions")
          .insert({
            user_id: user.id,
            day_workout_id: dayWorkoutId,
            week_number: weekNum,
          })
          .select()
          .single();

        if (error) throw error;

        setCompletedDayIds((prev) => new Set([...prev, dayWorkoutId]));
        setCompletions((prev) => [...prev, data as DayCompletion]);
      }

      return true;
    } catch (e: any) {
      console.error("Error toggling day completion:", e);
      return false;
    }
  };

  const isDayCompleted = (dayWorkoutId: string): boolean => {
    return completedDayIds.has(dayWorkoutId);
  };

  const getWeekProgress = (totalDays: number): { completed: number; total: number; percent: number } => {
    const completed = completedDayIds.size;
    const percent = totalDays > 0 ? Math.round((completed / totalDays) * 100) : 0;
    return { completed, total: totalDays, percent };
  };

  useEffect(() => {
    fetchCompletions();
  }, [fetchCompletions]);

  return {
    completions,
    loading,
    completedDayIds,
    fetchCompletions,
    toggleDayCompletion,
    isDayCompleted,
    getWeekProgress,
  };
}
