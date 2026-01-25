import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CoachingActionItem {
  id: string;
  client_id: string;
  session_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  completed_at: string | null;
  priority: string;
  created_at: string;
  updated_at: string;
}

export interface CreateActionItemInput {
  client_id: string;
  session_id?: string;
  title: string;
  description?: string;
  due_date?: string;
  priority?: string;
}

export function useCoachingActionItems(clientId?: string) {
  const [actionItems, setActionItems] = useState<CoachingActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchActionItems = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("coaching_action_items")
        .select("*")
        .order("due_date", { ascending: true, nullsFirst: false });

      if (clientId) {
        query = query.eq("client_id", clientId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setActionItems((data || []) as CoachingActionItem[]);
    } catch (err: any) {
      console.error("Error fetching action items:", err);
      toast({
        title: "Error",
        description: "Failed to load action items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [clientId, toast]);

  const createActionItem = async (input: CreateActionItemInput): Promise<CoachingActionItem | null> => {
    try {
      const { data, error } = await supabase
        .from("coaching_action_items")
        .insert(input)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Action item added",
        description: "The task has been assigned",
      });

      await fetchActionItems();
      return data as CoachingActionItem;
    } catch (err: any) {
      console.error("Error creating action item:", err);
      toast({
        title: "Error",
        description: "Failed to add action item",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateActionItem = async (
    itemId: string,
    updates: Partial<CoachingActionItem>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("coaching_action_items")
        .update(updates)
        .eq("id", itemId);

      if (error) throw error;

      await fetchActionItems();
      return true;
    } catch (err: any) {
      console.error("Error updating action item:", err);
      toast({
        title: "Error",
        description: "Failed to update action item",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleComplete = async (itemId: string): Promise<boolean> => {
    const item = actionItems.find(i => i.id === itemId);
    if (!item) return false;

    const updates = item.completed_at
      ? { completed_at: null }
      : { completed_at: new Date().toISOString() };

    const success = await updateActionItem(itemId, updates);
    
    if (success) {
      toast({
        title: item.completed_at ? "Task reopened" : "Task completed",
        description: item.completed_at ? "Task marked as incomplete" : "Great work!",
      });
    }

    return success;
  };

  const deleteActionItem = async (itemId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("coaching_action_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      toast({
        title: "Action item deleted",
        description: "The task has been removed",
      });

      await fetchActionItems();
      return true;
    } catch (err: any) {
      console.error("Error deleting action item:", err);
      toast({
        title: "Error",
        description: "Failed to delete action item",
        variant: "destructive",
      });
      return false;
    }
  };

  const getPendingItems = () => actionItems.filter(i => !i.completed_at);
  const getCompletedItems = () => actionItems.filter(i => i.completed_at);
  const getOverdueItems = () => {
    const today = new Date().toISOString().split("T")[0];
    return actionItems.filter(i => !i.completed_at && i.due_date && i.due_date < today);
  };

  useEffect(() => {
    fetchActionItems();
  }, [fetchActionItems]);

  return {
    actionItems,
    loading,
    createActionItem,
    updateActionItem,
    toggleComplete,
    deleteActionItem,
    getPendingItems,
    getCompletedItems,
    getOverdueItems,
    refetch: fetchActionItems,
  };
}
