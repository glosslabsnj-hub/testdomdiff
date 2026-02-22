import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PersonalizedExercise {
  original_exercise_name: string;
  exercise_name: string;
  section_type: "warmup" | "main" | "finisher" | "cooldown";
  sets: string;
  reps_or_time: string;
  rest: string;
  notes: string | null;
  modification_reason: string | null;
  display_order: number;
}

interface PersonalizationResult {
  personalized: boolean;
  exercises?: PersonalizedExercise[];
  notes?: string;
  cached?: boolean;
  reason?: string;
}

// Maps day name to index
const DAY_INDEX: Record<string, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
};

export function usePersonalizedWorkout(weekNumber: number, dayOfWeek: string) {
  const { user } = useAuth();
  const [personalization, setPersonalization] = useState<PersonalizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPersonalization = useCallback(async () => {
    if (!user?.id || !weekNumber || !dayOfWeek) return;

    const dayIndex = DAY_INDEX[dayOfWeek.toLowerCase()];
    if (dayIndex === undefined) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("personalize-workout", {
        body: {
          userId: user.id,
          weekNumber,
          dayOfWeek: dayIndex,
        },
      });

      if (fnError) {
        console.error("Personalization error:", fnError);
        setError(fnError.message);
        setPersonalization(null);
        return;
      }

      setPersonalization(data as PersonalizationResult);
    } catch (err) {
      console.error("Personalization fetch failed:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setPersonalization(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id, weekNumber, dayOfWeek]);

  useEffect(() => {
    fetchPersonalization();
  }, [fetchPersonalization]);

  return {
    personalization,
    loading,
    error,
    isPersonalized: personalization?.personalized === true,
    personalizedExercises: personalization?.exercises || null,
    modificationNotes: personalization?.notes || null,
    refetch: fetchPersonalization,
  };
}
