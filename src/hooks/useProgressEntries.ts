import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ProgressEntry {
  id: string;
  user_id: string;
  week_number: number;
  weight: number | null;
  waist: number | null;
  steps_avg: number | null;
  workouts: number | null;
  compliance_pct: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useProgressEntries = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchEntries();
    } else {
      setEntries([]);
      setLoading(false);
    }
  }, [user]);

  const fetchEntries = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("progress_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("week_number", { ascending: true });

      if (fetchError) throw fetchError;
      setEntries((data || []) as ProgressEntry[]);
    } catch (err: any) {
      console.error("Error fetching progress entries:", err);
      setError(err.message || "Failed to fetch progress entries");
    } finally {
      setLoading(false);
    }
  };

  const updateEntry = async (weekNumber: number, updates: Partial<ProgressEntry>): Promise<ProgressEntry> => {
    if (!user) throw new Error("Must be logged in");

    const entryData = {
      user_id: user.id,
      week_number: weekNumber,
      ...updates,
    };

    const { data, error } = await supabase
      .from("progress_entries")
      .upsert(entryData, { onConflict: "user_id,week_number" })
      .select()
      .single();

    if (error) throw error;
    await fetchEntries();
    return data as ProgressEntry;
  };

  const getEntryByWeek = (weekNumber: number): ProgressEntry | undefined => {
    return entries.find(e => e.week_number === weekNumber);
  };

  return {
    entries,
    loading,
    error,
    refetch: fetchEntries,
    updateEntry,
    getEntryByWeek,
  };
};
