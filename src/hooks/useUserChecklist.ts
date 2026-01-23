import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ChecklistItem {
  id: string;
  user_id: string;
  item_id: string;
  completed_at: string;
  created_at: string;
}

export const useUserChecklist = () => {
  const { user } = useAuth();
  const [completedItems, setCompletedItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCompletedItems();
    } else {
      setCompletedItems([]);
      setLoading(false);
    }
  }, [user]);

  const fetchCompletedItems = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("user_checklist")
        .select("*")
        .eq("user_id", user.id);

      if (fetchError) throw fetchError;
      setCompletedItems((data || []) as ChecklistItem[]);
    } catch (err: any) {
      console.error("Error fetching checklist:", err);
      setError(err.message || "Failed to fetch checklist");
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (itemId: string): Promise<void> => {
    if (!user) throw new Error("Must be logged in");

    const existing = completedItems.find(i => i.item_id === itemId);

    if (existing) {
      // Remove completion
      const { error } = await supabase
        .from("user_checklist")
        .delete()
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      // Mark as complete
      const { error } = await supabase
        .from("user_checklist")
        .insert({
          user_id: user.id,
          item_id: itemId,
        });
      if (error) throw error;
    }

    await fetchCompletedItems();
  };

  const isItemCompleted = (itemId: string): boolean => {
    return completedItems.some(i => i.item_id === itemId);
  };

  const getCompletionPercent = (totalItems: number): number => {
    if (totalItems === 0) return 0;
    return Math.round((completedItems.length / totalItems) * 100);
  };

  return {
    completedItems,
    loading,
    error,
    refetch: fetchCompletedItems,
    toggleItem,
    isItemCompleted,
    getCompletionPercent,
  };
};
