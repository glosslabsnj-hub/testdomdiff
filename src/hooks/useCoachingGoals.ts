import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CoachingGoal {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  status: string;
  progress_pct: number;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalInput {
  client_id: string;
  title: string;
  description?: string;
  target_date?: string;
  status?: string;
  progress_pct?: number;
}

export function useCoachingGoals(clientId?: string) {
  const [goals, setGoals] = useState<CoachingGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("coaching_goals")
        .select("*")
        .order("created_at", { ascending: false });

      if (clientId) {
        query = query.eq("client_id", clientId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setGoals((data || []) as CoachingGoal[]);
    } catch (err: any) {
      console.error("Error fetching coaching goals:", err);
      toast({
        title: "Error",
        description: "Failed to load goals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [clientId, toast]);

  const createGoal = async (input: CreateGoalInput): Promise<CoachingGoal | null> => {
    try {
      const { data, error } = await supabase
        .from("coaching_goals")
        .insert(input)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Goal created",
        description: "The goal has been added",
      });

      await fetchGoals();
      return data as CoachingGoal;
    } catch (err: any) {
      console.error("Error creating goal:", err);
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateGoal = async (
    goalId: string,
    updates: Partial<CoachingGoal>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("coaching_goals")
        .update(updates)
        .eq("id", goalId);

      if (error) throw error;

      toast({
        title: "Goal updated",
        description: "The goal has been updated",
      });

      await fetchGoals();
      return true;
    } catch (err: any) {
      console.error("Error updating goal:", err);
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateProgress = async (goalId: string, progress: number): Promise<boolean> => {
    return updateGoal(goalId, { progress_pct: Math.min(100, Math.max(0, progress)) });
  };

  const completeGoal = async (goalId: string): Promise<boolean> => {
    return updateGoal(goalId, { status: "completed", progress_pct: 100 });
  };

  const deleteGoal = async (goalId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("coaching_goals")
        .delete()
        .eq("id", goalId);

      if (error) throw error;

      toast({
        title: "Goal deleted",
        description: "The goal has been removed",
      });

      await fetchGoals();
      return true;
    } catch (err: any) {
      console.error("Error deleting goal:", err);
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return {
    goals,
    loading,
    createGoal,
    updateGoal,
    updateProgress,
    completeGoal,
    deleteGoal,
    refetch: fetchGoals,
  };
}
