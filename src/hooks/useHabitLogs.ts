import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfWeek, endOfWeek, format, eachDayOfInterval } from "date-fns";

export interface HabitLog {
  id: string;
  user_id: string;
  habit_name: string;
  log_date: string;
  completed: boolean;
  created_at: string;
}

export const DEFAULT_HABITS = [
  "Morning Routine",
  "Workout",
  "Water",
  "Nutrition",
  "Evening Routine",
  "Scripture",
];

export const useHabitLogs = (weekStartDate?: Date) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentWeekStart = weekStartDate || startOfWeek(new Date(), { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  useEffect(() => {
    if (user) {
      fetchLogs();
    } else {
      setLogs([]);
      setLoading(false);
    }
  }, [user, weekStartDate]);

  const fetchLogs = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const startDate = format(currentWeekStart, "yyyy-MM-dd");
      const endDate = format(currentWeekEnd, "yyyy-MM-dd");

      const { data, error: fetchError } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("log_date", startDate)
        .lte("log_date", endDate);

      if (fetchError) throw fetchError;
      setLogs((data || []) as HabitLog[]);
    } catch (err: any) {
      console.error("Error fetching habit logs:", err);
      setError(err.message || "Failed to fetch habit logs");
    } finally {
      setLoading(false);
    }
  };

  const toggleHabit = async (habitName: string, date: Date): Promise<void> => {
    if (!user) throw new Error("Must be logged in");

    const dateStr = format(date, "yyyy-MM-dd");
    const existing = logs.find(
      l => l.habit_name === habitName && l.log_date === dateStr
    );

    if (existing) {
      // Toggle existing
      if (existing.completed) {
        // Delete if unchecking
        const { error } = await supabase
          .from("habit_logs")
          .delete()
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        // Update to completed
        const { error } = await supabase
          .from("habit_logs")
          .update({ completed: true })
          .eq("id", existing.id);
        if (error) throw error;
      }
    } else {
      // Create new
      const { error } = await supabase
        .from("habit_logs")
        .insert({
          user_id: user.id,
          habit_name: habitName,
          log_date: dateStr,
          completed: true,
        });
      if (error) throw error;
    }

    await fetchLogs();
  };

  const isHabitCompleted = (habitName: string, date: Date): boolean => {
    const dateStr = format(date, "yyyy-MM-dd");
    const log = logs.find(
      l => l.habit_name === habitName && l.log_date === dateStr
    );
    return log?.completed || false;
  };

  const getWeekDays = (): Date[] => {
    return eachDayOfInterval({
      start: currentWeekStart,
      end: currentWeekEnd,
    });
  };

  const getWeeklyCompliancePercent = (): number => {
    const totalPossible = DEFAULT_HABITS.length * 7;
    const completed = logs.filter(l => l.completed).length;
    return Math.min(100, Math.max(0, Math.round((completed / totalPossible) * 100)));
  };

  return {
    logs,
    loading,
    error,
    refetch: fetchLogs,
    toggleHabit,
    isHabitCompleted,
    getWeekDays,
    getWeeklyCompliancePercent,
  };
};
