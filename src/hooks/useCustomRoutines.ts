import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface CustomRoutine {
  id: string;
  user_id: string;
  routine_type: "morning" | "evening";
  time_slot: string;
  action_text: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateCustomRoutine = Omit<CustomRoutine, "id" | "user_id" | "created_at" | "updated_at">;

export function useCustomRoutines() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [customRoutines, setCustomRoutines] = useState<CustomRoutine[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomRoutines = async () => {
    if (!user) {
      setCustomRoutines([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_custom_routines")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("routine_type")
        .order("display_order");

      if (error) throw error;
      setCustomRoutines((data || []) as CustomRoutine[]);
    } catch (e: any) {
      console.error("Error fetching custom routines:", e);
    } finally {
      setLoading(false);
    }
  };

  const addCustomRoutine = async (routine: CreateCustomRoutine) => {
    if (!user) return false;

    try {
      // Get max display_order for this routine type
      const maxOrder = customRoutines
        .filter(r => r.routine_type === routine.routine_type)
        .reduce((max, r) => Math.max(max, r.display_order), 0);

      const { error } = await supabase.from("user_custom_routines").insert({
        user_id: user.id,
        routine_type: routine.routine_type,
        time_slot: routine.time_slot,
        action_text: routine.action_text,
        display_order: maxOrder + 1,
        is_active: true,
      });

      if (error) throw error;
      await fetchCustomRoutines();
      toast({ title: "Added", description: "Custom routine added to your schedule" });
      return true;
    } catch (e: any) {
      console.error("Error adding custom routine:", e);
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const updateCustomRoutine = async (id: string, updates: Partial<CreateCustomRoutine>) => {
    try {
      const { error } = await supabase
        .from("user_custom_routines")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      await fetchCustomRoutines();
      toast({ title: "Updated", description: "Routine updated" });
      return true;
    } catch (e: any) {
      console.error("Error updating custom routine:", e);
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const deleteCustomRoutine = async (id: string) => {
    try {
      const { error } = await supabase
        .from("user_custom_routines")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchCustomRoutines();
      toast({ title: "Deleted", description: "Routine removed from your schedule" });
      return true;
    } catch (e: any) {
      console.error("Error deleting custom routine:", e);
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  useEffect(() => {
    fetchCustomRoutines();
  }, [user]);

  // Get routines by type
  const getMorningCustomRoutines = () => customRoutines.filter(r => r.routine_type === "morning");
  const getEveningCustomRoutines = () => customRoutines.filter(r => r.routine_type === "evening");

  return {
    customRoutines,
    loading,
    addCustomRoutine,
    updateCustomRoutine,
    deleteCustomRoutine,
    refetch: fetchCustomRoutines,
    getMorningCustomRoutines,
    getEveningCustomRoutines,
  };
}
