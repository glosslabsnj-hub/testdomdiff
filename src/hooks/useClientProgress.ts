import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ClientProgressData {
  progressEntries: any[];
  workoutCompletions: any[];
  habitLogs: any[];
  checkIns: any[];
  progressPhotos: any[];
  stats: {
    totalWorkoutsCompleted: number;
    currentWeekWorkouts: number;
    currentStreak: number;
    avgCompliancePct: number;
    latestWeight: number | null;
    latestWaist: number | null;
    weightChange: number | null;
  };
}

export function useClientProgress(clientId: string | null) {
  const [data, setData] = useState<ClientProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientProgress = useCallback(async () => {
    if (!clientId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        progressRes,
        workoutsRes,
        habitsRes,
        checkInsRes,
        photosRes,
      ] = await Promise.all([
        supabase
          .from("progress_entries")
          .select("*")
          .eq("user_id", clientId)
          .order("week_number", { ascending: true }),
        supabase
          .from("workout_completions")
          .select("*")
          .eq("user_id", clientId)
          .order("completed_at", { ascending: false }),
        supabase
          .from("habit_logs")
          .select("*")
          .eq("user_id", clientId)
          .order("log_date", { ascending: false })
          .limit(100),
        supabase
          .from("check_ins")
          .select("*")
          .eq("user_id", clientId)
          .order("week_number", { ascending: false }),
        supabase
          .from("progress_photos")
          .select("*")
          .eq("user_id", clientId)
          .in("privacy_level", ["coach_only", "public"])
          .order("created_at", { ascending: false }),
      ]);

      const progressEntries = progressRes.data || [];
      const workoutCompletions = workoutsRes.data || [];
      const habitLogs = habitsRes.data || [];
      const checkIns = checkInsRes.data || [];
      const progressPhotos = photosRes.data || [];

      // Calculate stats
      const totalWorkoutsCompleted = workoutCompletions.length;
      
      // Current week workouts
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const currentWeekWorkouts = workoutCompletions.filter(w => {
        const completedDate = new Date(w.completed_at);
        return completedDate >= startOfWeek;
      }).length;

      // Calculate discipline streak from habit logs
      let currentStreak = 0;
      const sortedHabits = [...habitLogs].sort((a, b) => 
        new Date(b.log_date).getTime() - new Date(a.log_date).getTime()
      );
      
      const uniqueDates = [...new Set(sortedHabits.filter(h => h.completed).map(h => h.log_date))];
      for (let i = 0; i < uniqueDates.length; i++) {
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        const expectedDateStr = expectedDate.toISOString().split("T")[0];
        if (uniqueDates[i] === expectedDateStr) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Average compliance
      const complianceEntries = progressEntries.filter(e => e.compliance_pct != null);
      const avgCompliancePct = complianceEntries.length > 0
        ? Math.round(complianceEntries.reduce((sum, e) => sum + e.compliance_pct, 0) / complianceEntries.length)
        : 0;

      // Latest weight and waist
      const latestProgress = progressEntries[progressEntries.length - 1];
      const firstProgress = progressEntries[0];
      
      const latestWeight = latestProgress?.weight || null;
      const latestWaist = latestProgress?.waist || null;
      const weightChange = latestProgress?.weight && firstProgress?.weight
        ? Number((latestProgress.weight - firstProgress.weight).toFixed(1))
        : null;

      setData({
        progressEntries,
        workoutCompletions,
        habitLogs,
        checkIns,
        progressPhotos,
        stats: {
          totalWorkoutsCompleted,
          currentWeekWorkouts,
          currentStreak,
          avgCompliancePct,
          latestWeight,
          latestWaist,
          weightChange,
        },
      });
    } catch (err: any) {
      console.error("Error fetching client progress:", err);
      setError(err.message || "Failed to fetch client progress");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClientProgress();
  }, [fetchClientProgress]);

  return {
    data,
    loading,
    error,
    refetch: fetchClientProgress,
  };
}
