import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DisciplineRoutine {
  id: string;
  routine_type: "morning" | "evening";
  time_slot: string;
  action_text: string;
  display_order: number;
  is_active: boolean;
  duration_minutes: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export function useDisciplineRoutines() {
  const [routines, setRoutines] = useState<DisciplineRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRoutines = async () => {
    try {
      const { data, error } = await supabase
        .from("discipline_routines")
        .select("*")
        .order("routine_type")
        .order("display_order");

      if (error) throw error;
      setRoutines((data || []) as DisciplineRoutine[]);
    } catch (e: any) {
      console.error("Error fetching discipline routines:", e);
    } finally {
      setLoading(false);
    }
  };

  const createRoutine = async (routine: Omit<DisciplineRoutine, "id" | "created_at" | "updated_at">) => {
    try {
      const { error } = await supabase.from("discipline_routines").insert(routine);
      if (error) throw error;
      await fetchRoutines();
      toast({ title: "Success", description: "Routine item added" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const updateRoutine = async (id: string, updates: Partial<DisciplineRoutine>) => {
    try {
      const { error } = await supabase.from("discipline_routines").update(updates).eq("id", id);
      if (error) throw error;
      await fetchRoutines();
      toast({ title: "Success", description: "Routine item updated" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const deleteRoutine = async (id: string) => {
    try {
      const { error } = await supabase.from("discipline_routines").delete().eq("id", id);
      if (error) throw error;
      await fetchRoutines();
      toast({ title: "Success", description: "Routine item deleted" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  return { routines, loading, fetchRoutines, createRoutine, updateRoutine, deleteRoutine };
}
