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

const LOCAL_STORAGE_KEY = "day_completions_local";

// AI-mode IDs start with "ai-day-" and can't be stored in the DB
// because of the foreign key constraint on program_day_workouts
function isAIModeId(id: string): boolean {
  return id.startsWith("ai-day-") || id.startsWith("ai-");
}

function getLocalCompletions(userId: string, weekNumber: number): Set<string> {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return new Set();
    const parsed = JSON.parse(stored);
    const key = `${userId}_${weekNumber}`;
    return new Set(parsed[key] || []);
  } catch {
    return new Set();
  }
}

function setLocalCompletions(userId: string, weekNumber: number, ids: Set<string>) {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    const key = `${userId}_${weekNumber}`;
    parsed[key] = Array.from(ids);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
  } catch (e) {
    console.error("Error saving local completions:", e);
  }
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
      // Fetch DB completions (for template-mode workouts)
      const { data, error } = await supabase
        .from("day_completions")
        .select("*")
        .eq("user_id", user.id)
        .eq("week_number", weekNumber);

      if (error) throw error;

      const completionData = (data || []) as DayCompletion[];
      const dbIds = new Set(completionData.map((c) => c.day_workout_id));

      // Also load local completions (for AI-mode workouts)
      const localIds = getLocalCompletions(user.id, weekNumber);

      // Merge both sets
      const merged = new Set([...dbIds, ...localIds]);

      setCompletions(completionData);
      setCompletedDayIds(merged);
    } catch (e: any) {
      console.error("Error fetching day completions:", e);
      // Still try to load local completions even if DB fails
      if (user) {
        const localIds = getLocalCompletions(user.id, weekNumber!);
        setCompletedDayIds(localIds);
      }
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
    const isAI = isAIModeId(dayWorkoutId);

    try {
      if (isAI) {
        // AI-mode: use localStorage (no FK in DB for synthetic IDs)
        const localIds = getLocalCompletions(user.id, weekNum);

        if (isCompleted) {
          localIds.delete(dayWorkoutId);
        } else {
          localIds.add(dayWorkoutId);
        }

        setLocalCompletions(user.id, weekNum, localIds);

        // Update state
        setCompletedDayIds((prev) => {
          const next = new Set(prev);
          if (isCompleted) {
            next.delete(dayWorkoutId);
          } else {
            next.add(dayWorkoutId);
          }
          return next;
        });

        return true;
      }

      // Template-mode: use Supabase DB
      if (isCompleted) {
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
