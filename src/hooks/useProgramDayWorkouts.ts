import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ProgramDayWorkout {
  id: string;
  week_id: string;
  day_of_week: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  workout_name: string;
  workout_description: string | null;
  display_order: number;
  is_rest_day: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProgramDayExercise {
  id: string;
  day_workout_id: string;
  section_type: "warmup" | "main" | "finisher" | "cooldown";
  exercise_name: string;
  sets: string | null;
  reps_or_time: string | null;
  rest: string | null;
  notes: string | null;
  scaling_options: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export function useProgramDayWorkouts(weekId: string | null) {
  const [workouts, setWorkouts] = useState<ProgramDayWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWorkouts = useCallback(async () => {
    if (!weekId) {
      setWorkouts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("program_day_workouts")
        .select("*")
        .eq("week_id", weekId)
        .order("display_order");

      if (error) throw error;
      setWorkouts((data || []) as ProgramDayWorkout[]);
    } catch (e: any) {
      console.error("Error fetching day workouts:", e);
    } finally {
      setLoading(false);
    }
  }, [weekId]);

  const createWorkout = async (workout: Omit<ProgramDayWorkout, "id" | "created_at" | "updated_at">) => {
    try {
      const { error } = await supabase.from("program_day_workouts").insert(workout);
      if (error) throw error;
      await fetchWorkouts();
      toast({ title: "Success", description: "Workout day created" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const updateWorkout = async (id: string, updates: Partial<ProgramDayWorkout>) => {
    try {
      const { error } = await supabase.from("program_day_workouts").update(updates).eq("id", id);
      if (error) throw error;
      await fetchWorkouts();
      toast({ title: "Success", description: "Workout day updated" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const deleteWorkout = async (id: string) => {
    try {
      const { error } = await supabase.from("program_day_workouts").delete().eq("id", id);
      if (error) throw error;
      await fetchWorkouts();
      toast({ title: "Success", description: "Workout day deleted" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  return { workouts, loading, fetchWorkouts, createWorkout, updateWorkout, deleteWorkout };
}

export function useProgramDayExercises(dayWorkoutId: string | null) {
  const [exercises, setExercises] = useState<ProgramDayExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchExercises = useCallback(async () => {
    if (!dayWorkoutId) {
      setExercises([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("program_day_exercises")
        .select("*")
        .eq("day_workout_id", dayWorkoutId)
        .order("section_type")
        .order("display_order");

      if (error) throw error;
      setExercises((data || []) as ProgramDayExercise[]);
    } catch (e: any) {
      console.error("Error fetching exercises:", e);
    } finally {
      setLoading(false);
    }
  }, [dayWorkoutId]);

  const createExercise = async (exercise: Omit<ProgramDayExercise, "id" | "created_at" | "updated_at">) => {
    try {
      const { error } = await supabase.from("program_day_exercises").insert(exercise);
      if (error) throw error;
      await fetchExercises();
      toast({ title: "Success", description: "Exercise added" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const updateExercise = async (id: string, updates: Partial<ProgramDayExercise>) => {
    try {
      const { error } = await supabase.from("program_day_exercises").update(updates).eq("id", id);
      if (error) throw error;
      await fetchExercises();
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const deleteExercise = async (id: string) => {
    try {
      const { error } = await supabase.from("program_day_exercises").delete().eq("id", id);
      if (error) throw error;
      await fetchExercises();
      toast({ title: "Success", description: "Exercise deleted" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  return { exercises, loading, fetchExercises, createExercise, updateExercise, deleteExercise };
}

// Bulk fetch all exercises for multiple day workouts
export function useBulkProgramExercises(dayWorkoutIds: string[]) {
  const [exercisesMap, setExercisesMap] = useState<Record<string, ProgramDayExercise[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchAllExercises = useCallback(async () => {
    if (dayWorkoutIds.length === 0) {
      setExercisesMap({});
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("program_day_exercises")
        .select("*")
        .in("day_workout_id", dayWorkoutIds)
        .order("section_type")
        .order("display_order");

      if (error) throw error;
      
      const grouped: Record<string, ProgramDayExercise[]> = {};
      (data || []).forEach((ex: ProgramDayExercise) => {
        if (!grouped[ex.day_workout_id]) grouped[ex.day_workout_id] = [];
        grouped[ex.day_workout_id].push(ex);
      });
      setExercisesMap(grouped);
    } catch (e: any) {
      console.error("Error fetching bulk exercises:", e);
    } finally {
      setLoading(false);
    }
  }, [dayWorkoutIds.join(",")]);

  useEffect(() => {
    fetchAllExercises();
  }, [fetchAllExercises]);

  return { exercisesMap, loading, fetchAllExercises };
}
