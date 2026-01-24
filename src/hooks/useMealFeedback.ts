import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MealFeedback {
  id: string;
  user_id: string;
  meal_id: string;
  feedback_type: "like" | "skip" | "made";
  rating: number | null;
  notes: string | null;
  feedback_date: string;
  created_at: string;
}

export interface MealSwap {
  id: string;
  user_id: string;
  original_meal_id: string;
  swapped_meal_id: string;
  day_number: number;
  swap_date: string;
  created_at: string;
}

export function useMealFeedback() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<MealFeedback[]>([]);
  const [swaps, setSwaps] = useState<MealSwap[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's feedback and swaps
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [feedbackRes, swapsRes] = await Promise.all([
          supabase
            .from("meal_feedback")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("user_meal_swaps")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
        ]);

        if (feedbackRes.error) throw feedbackRes.error;
        if (swapsRes.error) throw swapsRes.error;

        setFeedback((feedbackRes.data || []) as MealFeedback[]);
        setSwaps((swapsRes.data || []) as MealSwap[]);
      } catch (e) {
        console.error("Error fetching meal feedback:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Add feedback for a meal
  const addFeedback = useCallback(async (
    mealId: string,
    feedbackType: "like" | "skip" | "made",
    rating?: number,
    notes?: string
  ) => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      
      const { data, error } = await supabase
        .from("meal_feedback")
        .upsert({
          user_id: user.id,
          meal_id: mealId,
          feedback_type: feedbackType,
          rating: rating || null,
          notes: notes || null,
          feedback_date: today
        }, {
          onConflict: "user_id,meal_id,feedback_type,feedback_date"
        })
        .select()
        .single();

      if (error) throw error;
      
      setFeedback(prev => {
        const existing = prev.findIndex(
          f => f.meal_id === mealId && f.feedback_type === feedbackType && f.feedback_date === today
        );
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = data as MealFeedback;
          return updated;
        }
        return [data as MealFeedback, ...prev];
      });

      return data;
    } catch (e) {
      console.error("Error adding meal feedback:", e);
      throw e;
    }
  }, [user]);

  // Remove feedback
  const removeFeedback = useCallback(async (mealId: string, feedbackType: "like" | "skip" | "made") => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      
      const { error } = await supabase
        .from("meal_feedback")
        .delete()
        .eq("user_id", user.id)
        .eq("meal_id", mealId)
        .eq("feedback_type", feedbackType)
        .eq("feedback_date", today);

      if (error) throw error;
      
      setFeedback(prev => prev.filter(
        f => !(f.meal_id === mealId && f.feedback_type === feedbackType && f.feedback_date === today)
      ));
    } catch (e) {
      console.error("Error removing meal feedback:", e);
      throw e;
    }
  }, [user]);

  // Create a meal swap
  const createSwap = useCallback(async (
    originalMealId: string,
    swappedMealId: string,
    dayNumber: number
  ) => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      
      // Remove any existing swap for this day/meal type
      await supabase
        .from("user_meal_swaps")
        .delete()
        .eq("user_id", user.id)
        .eq("original_meal_id", originalMealId)
        .eq("swap_date", today);

      const { data, error } = await supabase
        .from("user_meal_swaps")
        .insert({
          user_id: user.id,
          original_meal_id: originalMealId,
          swapped_meal_id: swappedMealId,
          day_number: dayNumber,
          swap_date: today
        })
        .select()
        .single();

      if (error) throw error;
      
      setSwaps(prev => [data as MealSwap, ...prev]);
      return data;
    } catch (e) {
      console.error("Error creating meal swap:", e);
      throw e;
    }
  }, [user]);

  // Remove a swap (revert to original meal)
  const removeSwap = useCallback(async (swapId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_meal_swaps")
        .delete()
        .eq("id", swapId)
        .eq("user_id", user.id);

      if (error) throw error;
      
      setSwaps(prev => prev.filter(s => s.id !== swapId));
    } catch (e) {
      console.error("Error removing meal swap:", e);
      throw e;
    }
  }, [user]);

  // Check if a meal has feedback today
  const getMealFeedback = useCallback((mealId: string) => {
    const today = new Date().toISOString().split("T")[0];
    return feedback.filter(f => f.meal_id === mealId && f.feedback_date === today);
  }, [feedback]);

  // Check if there's an active swap for a meal
  const getActiveSwap = useCallback((originalMealId: string) => {
    const today = new Date().toISOString().split("T")[0];
    return swaps.find(s => s.original_meal_id === originalMealId && s.swap_date === today);
  }, [swaps]);

  return {
    feedback,
    swaps,
    loading,
    addFeedback,
    removeFeedback,
    createSwap,
    removeSwap,
    getMealFeedback,
    getActiveSwap
  };
}
