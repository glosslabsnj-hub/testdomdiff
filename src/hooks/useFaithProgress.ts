import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface FaithProgress {
  journal_entry: string;
  completed_actions: string[];
  reflection_answers: Record<string, string>;
}

export function useFaithProgress(weekNumber: number) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [progress, setProgress] = useState<FaithProgress>({
    journal_entry: "",
    completed_actions: [],
    reflection_answers: {},
  });
  const [prayers, setPrayers] = useState<{ id: string; content: string; is_answered: boolean }[]>([]);
  const [memorizedWeeks, setMemorizedWeeks] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load progress for current week
  useEffect(() => {
    if (!user?.id) return;
    setLoaded(false);

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("faith_progress")
          .select("journal_entry, completed_actions, reflection_answers")
          .eq("user_id", user.id)
          .eq("week_number", weekNumber)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setProgress({
            journal_entry: data.journal_entry || "",
            completed_actions: (data.completed_actions as string[]) || [],
            reflection_answers: (data.reflection_answers as Record<string, string>) || {},
          });
        } else {
          setProgress({ journal_entry: "", completed_actions: [], reflection_answers: {} });
        }
      } catch (e) {
        console.error("Error loading faith progress:", e);
        setProgress({ journal_entry: "", completed_actions: [], reflection_answers: {} });
      }
      setLoaded(true);
    };

    load();
  }, [user?.id, weekNumber]);

  // Load prayers (global, not per-week)
  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("faith_prayers")
          .select("id, content, is_answered")
          .eq("user_id", user.id)
          .order("created_at");

        if (error) throw error;
        setPrayers(data || []);
      } catch (e) {
        console.error("Error loading prayers:", e);
        setPrayers([]);
      }
    };

    load();
  }, [user?.id]);

  // Load memorized weeks (global)
  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("faith_memorized")
          .select("week_number")
          .eq("user_id", user.id);

        if (error) throw error;
        setMemorizedWeeks((data || []).map(d => d.week_number));
      } catch (e) {
        console.error("Error loading memorized weeks:", e);
        setMemorizedWeeks([]);
      }
    };

    load();
  }, [user?.id]);

  // Upsert progress for current week
  const saveProgress = useCallback(async (updates: Partial<FaithProgress>) => {
    if (!user?.id) return;

    const merged = { ...progress, ...updates };
    setProgress(merged);

    try {
      await supabase
        .from("faith_progress")
        .upsert({
          user_id: user.id,
          week_number: weekNumber,
          journal_entry: merged.journal_entry,
          completed_actions: merged.completed_actions,
          reflection_answers: merged.reflection_answers,
        }, { onConflict: "user_id,week_number" });
    } catch (e) {
      console.error("Error saving faith progress:", e);
    }
  }, [user?.id, weekNumber, progress]);

  const saveJournal = useCallback(async (entry: string) => {
    await saveProgress({ journal_entry: entry });
    toast({ title: "Journal Saved", description: "Your reflection has been saved." });
  }, [saveProgress, toast]);

  const toggleAction = useCallback(async (action: string) => {
    const updated = progress.completed_actions.includes(action)
      ? progress.completed_actions.filter(a => a !== action)
      : [...progress.completed_actions, action];
    await saveProgress({ completed_actions: updated });
  }, [progress.completed_actions, saveProgress]);

  const saveReflection = useCallback(async (question: string, answer: string) => {
    const updated = { ...progress.reflection_answers, [question]: answer };
    await saveProgress({ reflection_answers: updated });
  }, [progress.reflection_answers, saveProgress]);

  const addPrayer = useCallback(async (content: string) => {
    if (!user?.id || !content.trim()) return;

    const { data } = await supabase
      .from("faith_prayers")
      .insert({ user_id: user.id, content: content.trim() })
      .select("id, content, is_answered")
      .single();

    if (data) {
      setPrayers(prev => [...prev, data]);
      toast({ title: "Prayer Added", description: "Added to your prayer list." });
    }
  }, [user?.id, toast]);

  const removePrayer = useCallback(async (id: string) => {
    await supabase.from("faith_prayers").delete().eq("id", id);
    setPrayers(prev => prev.filter(p => p.id !== id));
  }, []);

  const toggleMemorized = useCallback(async (week: number) => {
    if (!user?.id) return;

    if (memorizedWeeks.includes(week)) {
      await supabase
        .from("faith_memorized")
        .delete()
        .eq("user_id", user.id)
        .eq("week_number", week);
      setMemorizedWeeks(prev => prev.filter(w => w !== week));
    } else {
      await supabase
        .from("faith_memorized")
        .insert({ user_id: user.id, week_number: week });
      setMemorizedWeeks(prev => [...prev, week]);
      toast({ title: "Scripture Memorized!", description: `Week ${week} scripture added to your memory bank.` });
    }
  }, [user?.id, memorizedWeeks, toast]);

  return {
    journalEntry: progress.journal_entry,
    completedActions: progress.completed_actions,
    reflectionAnswers: progress.reflection_answers,
    prayers,
    memorizedWeeks,
    loaded,
    saveJournal,
    toggleAction,
    saveReflection,
    addPrayer,
    removePrayer,
    toggleMemorized,
    setJournalEntry: (entry: string) => setProgress(prev => ({ ...prev, journal_entry: entry })),
  };
}
