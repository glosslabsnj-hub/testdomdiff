import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CheckIn {
  id: string;
  user_id: string;
  week_number: number;
  weight: number | null;
  waist: number | null;
  steps_avg: number | null;
  workouts_completed: number | null;
  wins: string | null;
  struggles: string | null;
  changes: string | null;
  faith_reflection: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface CheckInFormData {
  week_number: number;
  weight: string;
  waist: string;
  steps_avg: string;
  workouts_completed: string;
  wins: string;
  struggles: string;
  changes: string;
  faith_reflection: string;
}

export const useCheckIns = () => {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCheckIns();
    } else {
      setCheckIns([]);
      setLoading(false);
    }
  }, [user]);

  const fetchCheckIns = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("check_ins")
        .select("*")
        .eq("user_id", user.id)
        .order("week_number", { ascending: false });

      if (fetchError) throw fetchError;
      setCheckIns((data || []) as CheckIn[]);
    } catch (err: any) {
      console.error("Error fetching check-ins:", err);
      setError(err.message || "Failed to fetch check-ins");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentWeekNumber = (): number => {
    // Calculate week number based on user's subscription start or first check-in
    if (checkIns.length === 0) return 1;
    const maxWeek = Math.max(...checkIns.map(c => c.week_number));
    return maxWeek + 1;
  };

  const submitCheckIn = async (formData: CheckInFormData): Promise<CheckIn> => {
    if (!user) throw new Error("Must be logged in to submit check-in");

    const checkInData = {
      user_id: user.id,
      week_number: formData.week_number,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      waist: formData.waist ? parseFloat(formData.waist) : null,
      steps_avg: formData.steps_avg ? parseInt(formData.steps_avg) : null,
      workouts_completed: formData.workouts_completed ? parseInt(formData.workouts_completed) : null,
      wins: formData.wins || null,
      struggles: formData.struggles || null,
      changes: formData.changes || null,
      faith_reflection: formData.faith_reflection || null,
    };

    // Use upsert to allow updating existing week's check-in
    const { data, error } = await supabase
      .from("check_ins")
      .upsert(checkInData, { onConflict: "user_id,week_number" })
      .select()
      .single();

    if (error) throw error;
    await fetchCheckIns();
    return data as CheckIn;
  };

  const getCheckInByWeek = (weekNumber: number): CheckIn | undefined => {
    return checkIns.find(c => c.week_number === weekNumber);
  };

  return {
    checkIns,
    loading,
    error,
    refetch: fetchCheckIns,
    submitCheckIn,
    getCurrentWeekNumber,
    getCheckInByWeek,
  };
};
