import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const DAY_NAMES = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

function getPhase(weekNumber: number): "foundation" | "build" | "peak" {
  if (weekNumber <= 4) return "foundation";
  if (weekNumber <= 8) return "build";
  return "peak";
}

const PHASE_TITLES: Record<string, string> = {
  foundation: "Foundation Phase",
  build: "Build Phase",
  peak: "Peak Phase",
};

const PHASE_DESCRIPTIONS: Record<string, string> = {
  foundation: "Establish discipline. Learn movements. Build the habit that everything else sits on.",
  build: "Now we push. More volume, less rest, harder variations. Time to force growth.",
  peak: "Maximum intensity. Complex movements. Minimal rest. This is where transformation happens.",
};

export interface AIProgramWeek {
  id: string;
  week_number: number;
  phase: "foundation" | "build" | "peak";
  title: string | null;
  focus_description: string | null;
  conditioning_notes: string | null;
  recovery_notes: string | null;
  scripture_reference: string | null;
  video_url: string | null;
  video_title: string | null;
  video_description: string | null;
  track_id: string | null;
  workout_monday: string | null;
  workout_tuesday: string | null;
  workout_wednesday: string | null;
  workout_thursday: string | null;
  workout_friday: string | null;
  workout_saturday: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIDayWorkout {
  id: string;
  week_id: string;
  day_of_week: string;
  workout_name: string;
  workout_description: string | null;
  is_rest_day: boolean;
  display_order: number;
}

export interface AIExercise {
  id: string;
  day_workout_id: string;
  section_type: string;
  exercise_name: string;
  sets: string | null;
  reps_or_time: string | null;
  rest: string | null;
  notes: string | null;
  demo_url: string | null;
  display_order: number;
  scaling_options?: string | null;
  instructions?: string | null;
  form_tips?: string | null;
  muscles_targeted?: string | null;
}

/**
 * Loads the AI-generated workout program directly from workout_personalizations.
 * Used as fallback when program_weeks (admin templates) don't exist.
 */
export function useAIGeneratedProgram(enabled: boolean) {
  const { user } = useAuth();
  const [weeks, setWeeks] = useState<AIProgramWeek[]>([]);
  const [dayWorkouts, setDayWorkouts] = useState<AIDayWorkout[]>([]);
  const [exercisesByDay, setExercisesByDay] = useState<Record<string, AIExercise[]>>({});
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (!enabled || !user?.id) {
      setLoading(false);
      return;
    }

    const fetchAIProgram = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("workout_personalizations")
        .select("id, week_number, day_of_week, personalized_exercises, modification_notes")
        .eq("user_id", user.id)
        .order("week_number")
        .order("day_of_week");

      if (error || !data || data.length === 0) {
        setHasData(false);
        setLoading(false);
        return;
      }

      setHasData(true);

      // Build synthetic weeks (always 12 for the full program)
      const syntheticWeeks: AIProgramWeek[] = Array.from({ length: 12 }, (_, i) => {
        const wn = i + 1;
        const phase = getPhase(wn);
        const weekInPhase = ((wn - 1) % 4) + 1;
        return {
          id: `ai-week-${wn}`,
          week_number: wn,
          phase,
          title: `${PHASE_TITLES[phase]} — Week ${weekInPhase}`,
          focus_description: weekInPhase === 1 ? PHASE_DESCRIPTIONS[phase] : null,
          conditioning_notes: null,
          recovery_notes: null,
          scripture_reference: null,
          video_url: null,
          video_title: null,
          video_description: null,
          track_id: null,
          workout_monday: null,
          workout_tuesday: null,
          workout_wednesday: null,
          workout_thursday: null,
          workout_friday: null,
          workout_saturday: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      // Build synthetic day workouts and exercises
      const allDayWorkouts: AIDayWorkout[] = [];
      const allExercisesByDay: Record<string, AIExercise[]> = {};

      for (const row of data) {
        const weekId = `ai-week-${row.week_number}`;
        const dayIndex = typeof row.day_of_week === "number" ? row.day_of_week : parseInt(row.day_of_week);
        const dayName = DAY_NAMES[dayIndex] || "monday";
        const dayId = `ai-day-${row.week_number}-${dayIndex}`;

        // Parse exercises from JSONB
        let exercises: any[] = [];
        if (Array.isArray(row.personalized_exercises)) {
          exercises = row.personalized_exercises;
        } else if (
          row.personalized_exercises &&
          typeof row.personalized_exercises === "object" &&
          (row.personalized_exercises as any).exercises
        ) {
          exercises = (row.personalized_exercises as any).exercises;
        }

        if (exercises.length === 0) continue;

        // Build workout name from the exercises
        const mainExercises = exercises.filter((e: any) => e.section_type === "main");
        const dayTitle = dayName.charAt(0).toUpperCase() + dayName.slice(1);
        const workoutName = mainExercises.length > 0
          ? `${dayTitle} — ${mainExercises[0]?.exercise_name?.split(" ").slice(0, 3).join(" ") || "Training"}`
          : `${dayTitle} Training`;

        allDayWorkouts.push({
          id: dayId,
          week_id: weekId,
          day_of_week: dayName,
          workout_name: workoutName,
          workout_description: row.modification_notes || null,
          is_rest_day: false,
          display_order: dayIndex,
        });

        allExercisesByDay[dayId] = exercises.map((ex: any, idx: number) => ({
          id: `ai-ex-${row.week_number}-${dayIndex}-${idx}`,
          day_workout_id: dayId,
          section_type: ex.section_type || "main",
          exercise_name: ex.exercise_name || "Exercise",
          sets: ex.sets || null,
          reps_or_time: ex.reps_or_time || null,
          rest: ex.rest || null,
          notes: ex.notes || null,
          demo_url: null,
          display_order: ex.display_order ?? idx,
          scaling_options: ex.scaling_options || null,
          instructions: ex.instructions || null,
          form_tips: ex.form_tips || null,
          muscles_targeted: ex.muscles_targeted || null,
        }));
      }

      setWeeks(syntheticWeeks);
      setDayWorkouts(allDayWorkouts);
      setExercisesByDay(allExercisesByDay);
      setLoading(false);
    };

    fetchAIProgram();
  }, [enabled, user?.id]);

  return { weeks, dayWorkouts, exercisesByDay, loading, hasData };
}
