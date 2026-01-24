import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay, differenceInCalendarDays, subDays } from "date-fns";

export interface DisciplineRoutine {
  id: string;
  routine_type: "morning" | "evening";
  time_slot: string;
  action_text: string;
  display_order: number;
  is_active: boolean;
}

export interface DisciplineJournal {
  id: string;
  user_id: string;
  journal_date: string;
  prompt: string;
  response: string;
  created_at: string;
}

interface RoutineCompletion {
  routineId: string;
  completedAt: string;
}

interface TemplateRoutineItem {
  routine_type: "morning" | "evening";
  time_slot: string;
  action_text: string;
  display_order: number;
}

export function useDailyDiscipline() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [routines, setRoutines] = useState<DisciplineRoutine[]>([]);
  const [completions, setCompletions] = useState<Map<string, RoutineCompletion>>(new Map());
  const [waterCount, setWaterCountState] = useState(0);
  const [streak, setStreak] = useState(0);
  const [journalEntries, setJournalEntries] = useState<DisciplineJournal[]>([]);

  const today = format(new Date(), "yyyy-MM-dd");
  
  // Get the user's selected template ID from profile
  const templateId = (profile as any)?.discipline_template_id || null;

  // Fetch routines from the user's selected template
  const fetchRoutines = useCallback(async () => {
    try {
      // If user has a template selected, load from that template's JSON
      if (templateId) {
        const { data: templateData, error: templateError } = await supabase
          .from("discipline_templates")
          .select("id, routines")
          .eq("id", templateId)
          .single();

        if (templateError) throw templateError;

        // Parse the routines JSON from the template - handle the Json type
        const routinesData = templateData?.routines;
        const templateRoutines: TemplateRoutineItem[] = Array.isArray(routinesData) 
          ? routinesData as unknown as TemplateRoutineItem[]
          : [];
        
        if (templateRoutines.length > 0) {
          // Convert template routines to DisciplineRoutine format with generated IDs
          const mappedRoutines: DisciplineRoutine[] = templateRoutines.map((item, index) => ({
            id: `${templateId}_${item.routine_type}_${index}`,
            routine_type: item.routine_type as "morning" | "evening",
            time_slot: item.time_slot,
            action_text: item.action_text,
            display_order: item.display_order,
            is_active: true,
          }));
          
          setRoutines(mappedRoutines);
          return;
        }
      }
      
      // Fallback: Try loading from discipline_routines table (legacy support)
      const { data, error } = await supabase
        .from("discipline_routines")
        .select("*")
        .eq("is_active", true)
        .order("routine_type")
        .order("display_order");

      if (error) throw error;
      setRoutines((data || []) as DisciplineRoutine[]);
    } catch (e) {
      console.error("Error fetching routines:", e);
    }
  }, [templateId]);

  // Fetch today's completions from habit_logs
  const fetchCompletions = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("log_date", today)
        .like("habit_name", "routine_%");

      if (error) throw error;

      const completionMap = new Map<string, RoutineCompletion>();
      (data || []).forEach((log: any) => {
        const routineId = log.habit_name.replace("routine_", "");
        completionMap.set(routineId, {
          routineId,
          completedAt: log.created_at,
        });
      });
      setCompletions(completionMap);
    } catch (e) {
      console.error("Error fetching completions:", e);
    }
  }, [user, today]);

  // Fetch water count for today
  const fetchWaterCount = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("log_date", today)
        .eq("habit_name", "water_tracking");

      if (error) throw error;
      
      // Store water count as a single entry with the count in a field
      // We'll use the number of water entries for simplicity
      const { data: waterData, error: waterError } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("log_date", today)
        .like("habit_name", "water_glass_%");

      if (waterError) throw waterError;
      setWaterCountState((waterData || []).length);
    } catch (e) {
      console.error("Error fetching water count:", e);
    }
  }, [user, today]);

  // Calculate streak
  const calculateStreak = useCallback(async () => {
    if (!user) return;

    try {
      // Get distinct dates where user completed at least one routine
      const { data, error } = await supabase
        .from("habit_logs")
        .select("log_date")
        .eq("user_id", user.id)
        .like("habit_name", "routine_%")
        .order("log_date", { ascending: false });

      if (error) throw error;

      const uniqueDates = [...new Set((data || []).map(d => d.log_date))];
      
      let currentStreak = 0;
      const todayDate = startOfDay(new Date());

      for (let i = 0; i < uniqueDates.length; i++) {
        const logDate = startOfDay(new Date(uniqueDates[i]));
        const expectedDate = subDays(todayDate, i);
        
        if (differenceInCalendarDays(expectedDate, logDate) === 0) {
          currentStreak++;
        } else {
          break;
        }
      }

      setStreak(currentStreak);
    } catch (e) {
      console.error("Error calculating streak:", e);
    }
  }, [user]);

  // Fetch journal entries for today
  const fetchJournalEntries = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("discipline_journals")
        .select("*")
        .eq("user_id", user.id)
        .eq("journal_date", today)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setJournalEntries((data || []) as DisciplineJournal[]);
    } catch (e) {
      console.error("Error fetching journal entries:", e);
    }
  }, [user, today]);

  // Toggle routine completion
  const toggleRoutineCompletion = useCallback(async (routineId: string) => {
    if (!user) return;

    const habitName = `routine_${routineId}`;
    const isCompleted = completions.has(routineId);

    try {
      if (isCompleted) {
        // Remove completion
        const { error } = await supabase
          .from("habit_logs")
          .delete()
          .eq("user_id", user.id)
          .eq("log_date", today)
          .eq("habit_name", habitName);

        if (error) throw error;

        setCompletions(prev => {
          const next = new Map(prev);
          next.delete(routineId);
          return next;
        });
      } else {
        // Add completion
        const { error } = await supabase
          .from("habit_logs")
          .insert({
            user_id: user.id,
            log_date: today,
            habit_name: habitName,
            completed: true,
          });

        if (error) throw error;

        setCompletions(prev => {
          const next = new Map(prev);
          next.set(routineId, {
            routineId,
            completedAt: new Date().toISOString(),
          });
          return next;
        });
      }

      // Recalculate streak
      await calculateStreak();
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to update routine",
        variant: "destructive",
      });
    }
  }, [user, today, completions, calculateStreak, toast]);

  // Set water count
  const setWaterCount = useCallback(async (count: number) => {
    if (!user) return;

    try {
      // Delete existing water entries for today
      await supabase
        .from("habit_logs")
        .delete()
        .eq("user_id", user.id)
        .eq("log_date", today)
        .like("habit_name", "water_glass_%");

      // Insert new entries
      if (count > 0) {
        const entries = Array.from({ length: count }, (_, i) => ({
          user_id: user.id,
          log_date: today,
          habit_name: `water_glass_${i + 1}`,
          completed: true,
        }));

        const { error } = await supabase
          .from("habit_logs")
          .insert(entries);

        if (error) throw error;
      }

      setWaterCountState(count);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to update water count",
        variant: "destructive",
      });
    }
  }, [user, today, toast]);

  // Save journal entry
  const saveJournalEntry = useCallback(async (prompt: string, response: string) => {
    if (!user || !response.trim()) return;

    try {
      // Check if entry exists for this prompt today
      const existingEntry = journalEntries.find(e => e.prompt === prompt);

      if (existingEntry) {
        // Update existing
        const { error } = await supabase
          .from("discipline_journals")
          .update({ response: response.trim() })
          .eq("id", existingEntry.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("discipline_journals")
          .insert({
            user_id: user.id,
            journal_date: today,
            prompt,
            response: response.trim(),
          });

        if (error) throw error;
      }

      await fetchJournalEntries();
      
      toast({
        title: "Saved",
        description: "Your reflection has been saved.",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to save journal entry",
        variant: "destructive",
      });
    }
  }, [user, today, journalEntries, fetchJournalEntries, toast]);

  // Get journal response for a prompt
  const getJournalResponse = useCallback((prompt: string): string => {
    const entry = journalEntries.find(e => e.prompt === prompt);
    return entry?.response || "";
  }, [journalEntries]);

  // Calculate compliance
  const getTodayCompliance = useCallback(() => {
    const total = routines.length;
    const completed = completions.size;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  }, [routines, completions]);

  // Initial load
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchRoutines(),
        fetchCompletions(),
        fetchWaterCount(),
        calculateStreak(),
        fetchJournalEntries(),
      ]);
      setLoading(false);
    };

    if (user) {
      loadAll();
    } else {
      setLoading(false);
    }
  }, [user, fetchRoutines, fetchCompletions, fetchWaterCount, calculateStreak, fetchJournalEntries]);

  const morningRoutines = routines.filter(r => r.routine_type === "morning");
  const eveningRoutines = routines.filter(r => r.routine_type === "evening");

  return {
    loading,
    morningRoutines,
    eveningRoutines,
    completions,
    streak,
    waterCount,
    setWaterCount,
    journalEntries,
    toggleRoutineCompletion,
    saveJournalEntry,
    getJournalResponse,
    getTodayCompliance,
    isRoutineCompleted: (routineId: string) => completions.has(routineId),
    getCompletionTime: (routineId: string) => completions.get(routineId)?.completedAt,
    refetch: () => Promise.all([fetchRoutines(), fetchCompletions(), fetchWaterCount(), calculateStreak(), fetchJournalEntries()]),
  };
}
