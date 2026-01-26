import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface ClientProgramExercise {
  id: string;
  day_id: string;
  section_type: string;
  exercise_name: string;
  sets: string | null;
  reps_or_time: string | null;
  rest: string | null;
  notes: string | null;
  instructions: string | null;
  demo_url: string | null;
  display_order: number;
}

export interface ClientProgramDay {
  id: string;
  week_id: string;
  day_of_week: string;
  display_order: number;
  workout_name: string;
  workout_description: string | null;
  is_rest_day: boolean;
  exercises?: ClientProgramExercise[];
}

export interface ClientProgramWeek {
  id: string;
  client_id: string;
  week_number: number;
  title: string | null;
  focus_description: string | null;
  phase: string;
  days?: ClientProgramDay[];
}

export interface ClientDayCompletion {
  id: string;
  user_id: string;
  day_id: string;
  week_number: number;
  completed_at: string;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function useClientProgram(clientId: string | null) {
  const [weeks, setWeeks] = useState<ClientProgramWeek[]>([]);
  const [completions, setCompletions] = useState<ClientDayCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProgram = async () => {
    if (!clientId) {
      setWeeks([]);
      setCompletions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch weeks
    const { data: weeksData, error: weeksError } = await supabase
      .from("client_program_weeks")
      .select("*")
      .eq("client_id", clientId)
      .order("week_number", { ascending: true });

    if (weeksError) {
      console.error("Error fetching client program weeks:", weeksError);
      setLoading(false);
      return;
    }

    if (!weeksData || weeksData.length === 0) {
      setWeeks([]);
      setCompletions([]);
      setLoading(false);
      return;
    }

    // Fetch days for all weeks
    const weekIds = weeksData.map((w) => w.id);
    const { data: daysData, error: daysError } = await supabase
      .from("client_program_days")
      .select("*")
      .in("week_id", weekIds)
      .order("display_order", { ascending: true });

    if (daysError) {
      console.error("Error fetching client program days:", daysError);
    }

    // Fetch exercises for all days
    const dayIds = (daysData || []).map((d) => d.id);
    let exercisesData: ClientProgramExercise[] = [];
    if (dayIds.length > 0) {
      const { data, error: exercisesError } = await supabase
        .from("client_program_exercises")
        .select("*")
        .in("day_id", dayIds)
        .order("display_order", { ascending: true });

      if (exercisesError) {
        console.error("Error fetching client program exercises:", exercisesError);
      } else {
        exercisesData = (data as ClientProgramExercise[]) || [];
      }
    }

    // Fetch completions
    const { data: completionsData } = await supabase
      .from("client_day_completions")
      .select("*")
      .eq("user_id", clientId);

    setCompletions((completionsData as ClientDayCompletion[]) || []);

    // Combine data
    const weeksWithDays = weeksData.map((week) => ({
      ...week,
      days: (daysData || [])
        .filter((d) => d.week_id === week.id)
        .map((day) => ({
          ...day,
          exercises: exercisesData.filter((e) => e.day_id === day.id),
        })),
    })) as ClientProgramWeek[];

    setWeeks(weeksWithDays);
    setLoading(false);
  };

  useEffect(() => {
    fetchProgram();
  }, [clientId]);

  // Check if program exists
  const hasProgram = weeks.length > 0;

  // Check if all weeks are complete
  const isPhaseComplete = () => {
    if (!hasProgram) return false;
    const allDays = weeks.flatMap((w) => w.days || []).filter((d) => !d.is_rest_day);
    return allDays.length > 0 && allDays.every((d) => completions.some((c) => c.day_id === d.id));
  };

  // Initialize 4 weeks with default days
  const initializeProgram = async () => {
    if (!clientId) return false;

    try {
      // Create 4 weeks
      for (let weekNum = 1; weekNum <= 4; weekNum++) {
        const { data: weekData, error: weekError } = await supabase
          .from("client_program_weeks")
          .insert({
            client_id: clientId,
            week_number: weekNum,
            title: `Week ${weekNum}`,
            phase: "custom",
          })
          .select()
          .single();

        if (weekError) throw weekError;

        // Create 7 days for this week
        const daysToInsert = DAYS_OF_WEEK.map((day, index) => ({
          week_id: weekData.id,
          day_of_week: day,
          display_order: index,
          workout_name: day === "Sunday" ? "Rest Day" : `Day ${index + 1}`,
          is_rest_day: day === "Sunday",
        }));

        const { error: daysError } = await supabase
          .from("client_program_days")
          .insert(daysToInsert);

        if (daysError) throw daysError;
      }

      toast({
        title: "Program initialized",
        description: "4-week program template created. Add exercises to each day.",
      });

      await fetchProgram();
      return true;
    } catch (error) {
      console.error("Error initializing program:", error);
      toast({
        title: "Error",
        description: "Failed to initialize program",
        variant: "destructive",
      });
      return false;
    }
  };

  // Update week
  const updateWeek = async (weekId: string, updates: Partial<ClientProgramWeek>) => {
    try {
      const { error } = await supabase
        .from("client_program_weeks")
        .update(updates)
        .eq("id", weekId);

      if (error) throw error;
      await fetchProgram();
      return true;
    } catch (error) {
      console.error("Error updating week:", error);
      return false;
    }
  };

  // Update day
  const updateDay = async (dayId: string, updates: Partial<ClientProgramDay>) => {
    try {
      const { error } = await supabase
        .from("client_program_days")
        .update(updates)
        .eq("id", dayId);

      if (error) throw error;
      await fetchProgram();
      return true;
    } catch (error) {
      console.error("Error updating day:", error);
      return false;
    }
  };

  // Add exercise
  const addExercise = async (dayId: string, exercise: Partial<ClientProgramExercise>) => {
    try {
      const { error } = await supabase.from("client_program_exercises").insert({
        day_id: dayId,
        section_type: exercise.section_type || "main",
        exercise_name: exercise.exercise_name || "New Exercise",
        sets: exercise.sets,
        reps_or_time: exercise.reps_or_time,
        rest: exercise.rest,
        notes: exercise.notes,
        instructions: exercise.instructions,
        demo_url: exercise.demo_url,
        display_order: exercise.display_order || 0,
      });

      if (error) throw error;
      await fetchProgram();
      return true;
    } catch (error) {
      console.error("Error adding exercise:", error);
      return false;
    }
  };

  // Update exercise
  const updateExercise = async (exerciseId: string, updates: Partial<ClientProgramExercise>) => {
    try {
      const { error } = await supabase
        .from("client_program_exercises")
        .update(updates)
        .eq("id", exerciseId);

      if (error) throw error;
      await fetchProgram();
      return true;
    } catch (error) {
      console.error("Error updating exercise:", error);
      return false;
    }
  };

  // Delete exercise
  const deleteExercise = async (exerciseId: string) => {
    try {
      const { error } = await supabase
        .from("client_program_exercises")
        .delete()
        .eq("id", exerciseId);

      if (error) throw error;
      await fetchProgram();
      return true;
    } catch (error) {
      console.error("Error deleting exercise:", error);
      return false;
    }
  };

  // Toggle day completion (for clients)
  const toggleDayCompletion = async (dayId: string, weekNumber: number) => {
    if (!clientId) return false;

    const existing = completions.find((c) => c.day_id === dayId);

    try {
      if (existing) {
        // Remove completion
        const { error } = await supabase
          .from("client_day_completions")
          .delete()
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Add completion
        const { error } = await supabase.from("client_day_completions").insert({
          user_id: clientId,
          day_id: dayId,
          week_number: weekNumber,
        });

        if (error) throw error;
      }

      await fetchProgram();
      return true;
    } catch (error) {
      console.error("Error toggling completion:", error);
      return false;
    }
  };

  // Check if day is completed
  const isDayCompleted = (dayId: string) => {
    return completions.some((c) => c.day_id === dayId);
  };

  // Delete entire program
  const deleteProgram = async () => {
    if (!clientId) return false;

    try {
      const { error } = await supabase
        .from("client_program_weeks")
        .delete()
        .eq("client_id", clientId);

      if (error) throw error;

      toast({
        title: "Program deleted",
        description: "The client's custom program has been removed",
      });

      await fetchProgram();
      return true;
    } catch (error) {
      console.error("Error deleting program:", error);
      toast({
        title: "Error",
        description: "Failed to delete program",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    weeks,
    completions,
    loading,
    hasProgram,
    isPhaseComplete: isPhaseComplete(),
    initializeProgram,
    updateWeek,
    updateDay,
    addExercise,
    updateExercise,
    deleteExercise,
    toggleDayCompletion,
    isDayCompleted,
    deleteProgram,
    refetch: fetchProgram,
  };
}
