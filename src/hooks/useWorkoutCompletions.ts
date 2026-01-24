import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface WorkoutCompletion {
  id: string;
  user_id: string;
  exercise_id: string;
  completed_at: string;
  week_number: number;
  day_of_week: string;
  created_at: string;
}

export function useWorkoutCompletions(weekNumber: number | null) {
  const { user } = useAuth();
  const [completions, setCompletions] = useState<WorkoutCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<Set<string>>(new Set());

  const fetchCompletions = useCallback(async () => {
    if (!user || weekNumber === null) {
      setCompletions([]);
      setCompletedExerciseIds(new Set());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("workout_completions")
        .select("*")
        .eq("user_id", user.id)
        .eq("week_number", weekNumber);

      if (error) throw error;

      const completionData = (data || []) as WorkoutCompletion[];
      setCompletions(completionData);
      setCompletedExerciseIds(new Set(completionData.map(c => c.exercise_id)));
    } catch (e: any) {
      console.error("Error fetching completions:", e);
    } finally {
      setLoading(false);
    }
  }, [user, weekNumber]);

  const toggleExerciseCompletion = async (
    exerciseId: string,
    dayOfWeek: string,
    weekNum: number
  ): Promise<boolean> => {
    if (!user) return false;

    const isCompleted = completedExerciseIds.has(exerciseId);

    try {
      if (isCompleted) {
        // Remove completion
        const { error } = await supabase
          .from("workout_completions")
          .delete()
          .eq("user_id", user.id)
          .eq("exercise_id", exerciseId)
          .eq("week_number", weekNum);

        if (error) throw error;

        setCompletedExerciseIds(prev => {
          const next = new Set(prev);
          next.delete(exerciseId);
          return next;
        });
        setCompletions(prev => prev.filter(c => c.exercise_id !== exerciseId));
      } else {
        // Add completion
        const { data, error } = await supabase
          .from("workout_completions")
          .insert({
            user_id: user.id,
            exercise_id: exerciseId,
            week_number: weekNum,
            day_of_week: dayOfWeek,
          })
          .select()
          .single();

        if (error) throw error;

        setCompletedExerciseIds(prev => new Set([...prev, exerciseId]));
        setCompletions(prev => [...prev, data as WorkoutCompletion]);
      }

      return true;
    } catch (e: any) {
      console.error("Error toggling completion:", e);
      return false;
    }
  };

  const isExerciseCompleted = (exerciseId: string): boolean => {
    return completedExerciseIds.has(exerciseId);
  };

  const getWorkoutProgress = (dayWorkoutId: string, exerciseIds: string[]): number => {
    if (exerciseIds.length === 0) return 0;
    const completed = exerciseIds.filter(id => completedExerciseIds.has(id)).length;
    return Math.round((completed / exerciseIds.length) * 100);
  };

  const getDayProgress = (dayWorkoutExercises: Record<string, string[]>): number => {
    const allExerciseIds = Object.values(dayWorkoutExercises).flat();
    if (allExerciseIds.length === 0) return 0;
    const completed = allExerciseIds.filter(id => completedExerciseIds.has(id)).length;
    return Math.round((completed / allExerciseIds.length) * 100);
  };

  useEffect(() => {
    fetchCompletions();
  }, [fetchCompletions]);

  return {
    completions,
    loading,
    completedExerciseIds,
    fetchCompletions,
    toggleExerciseCompletion,
    isExerciseCompleted,
    getWorkoutProgress,
    getDayProgress,
  };
}
