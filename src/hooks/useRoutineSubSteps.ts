import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface SubStep {
  id: string;
  action_text: string;
  step_order: number;
  duration_seconds: number | null;
  is_user_created: boolean;
  is_deleted: boolean;
  original_substep_id: string | null;
}

export interface SubStepCompletion {
  substep_id: string | null;
  user_substep_id: string | null;
}

export function useRoutineSubSteps(templateId: string | null) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [adminSubSteps, setAdminSubSteps] = useState<Map<number, SubStep[]>>(new Map());
  const [userSubSteps, setUserSubSteps] = useState<Map<number, SubStep[]>>(new Map());
  const [completions, setCompletions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchSubSteps = useCallback(async () => {
    if (!templateId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch admin-defined sub-steps
      const { data: adminData, error: adminError } = await supabase
        .from("routine_substeps")
        .select("*")
        .eq("template_id", templateId)
        .order("routine_index")
        .order("step_order");

      if (adminError) throw adminError;

      // Group by routine_index
      const adminMap = new Map<number, SubStep[]>();
      (adminData || []).forEach((item: any) => {
        const existing = adminMap.get(item.routine_index) || [];
        existing.push({
          id: item.id,
          action_text: item.action_text,
          step_order: item.step_order,
          duration_seconds: item.duration_seconds,
          is_user_created: false,
          is_deleted: false,
          original_substep_id: null,
        });
        adminMap.set(item.routine_index, existing);
      });
      setAdminSubSteps(adminMap);

      // Fetch user customizations if logged in
      if (user) {
        const { data: userData, error: userError } = await supabase
          .from("user_routine_substeps")
          .select("*")
          .eq("user_id", user.id)
          .eq("template_id", templateId)
          .order("routine_index")
          .order("step_order");

        if (userError) throw userError;

        const userMap = new Map<number, SubStep[]>();
        (userData || []).forEach((item: any) => {
          const existing = userMap.get(item.routine_index) || [];
          existing.push({
            id: item.id,
            action_text: item.action_text,
            step_order: item.step_order,
            duration_seconds: null,
            is_user_created: true,
            is_deleted: item.is_deleted,
            original_substep_id: item.original_substep_id,
          });
          userMap.set(item.routine_index, existing);
        });
        setUserSubSteps(userMap);

        // Fetch today's completions
        const today = new Date().toISOString().split("T")[0];
        const { data: completionData } = await supabase
          .from("user_substep_completions")
          .select("substep_id, user_substep_id")
          .eq("user_id", user.id)
          .eq("completion_date", today);

        const completionSet = new Set<string>();
        (completionData || []).forEach((c: SubStepCompletion) => {
          if (c.substep_id) completionSet.add(c.substep_id);
          if (c.user_substep_id) completionSet.add(c.user_substep_id);
        });
        setCompletions(completionSet);
      }
    } catch (e: any) {
      console.error("Error fetching sub-steps:", e);
    } finally {
      setLoading(false);
    }
  }, [templateId, user]);

  useEffect(() => {
    fetchSubSteps();
  }, [fetchSubSteps]);

  // Get merged sub-steps for a routine (admin defaults + user overrides/additions)
  const getSubSteps = useCallback((routineIndex: number): SubStep[] => {
    const admin = adminSubSteps.get(routineIndex) || [];
    const userMods = userSubSteps.get(routineIndex) || [];

    // Find deleted admin sub-step IDs
    const deletedIds = new Set(
      userMods
        .filter(u => u.is_deleted && u.original_substep_id)
        .map(u => u.original_substep_id)
    );

    // Find overridden admin sub-step IDs
    const overriddenIds = new Set(
      userMods
        .filter(u => !u.is_deleted && u.original_substep_id)
        .map(u => u.original_substep_id)
    );

    // Filter admin steps (exclude deleted, replace overridden)
    const filteredAdmin = admin
      .filter(a => !deletedIds.has(a.id))
      .map(a => {
        if (overriddenIds.has(a.id)) {
          const override = userMods.find(u => u.original_substep_id === a.id && !u.is_deleted);
          if (override) {
            return { ...a, action_text: override.action_text, id: override.id, is_user_created: true };
          }
        }
        return a;
      });

    // Get user-added steps (no original_substep_id and not deleted)
    const userAdded = userMods.filter(u => !u.original_substep_id && !u.is_deleted);

    // Combine and sort by step_order
    return [...filteredAdmin, ...userAdded].sort((a, b) => a.step_order - b.step_order);
  }, [adminSubSteps, userSubSteps]);

  // Add a user sub-step
  const addUserSubStep = async (routineIndex: number, actionText: string): Promise<boolean> => {
    if (!user || !templateId) return false;

    const existing = getSubSteps(routineIndex);
    const maxOrder = existing.length > 0 ? Math.max(...existing.map(s => s.step_order)) : -1;

    try {
      const { error } = await supabase
        .from("user_routine_substeps")
        .insert({
          user_id: user.id,
          template_id: templateId,
          routine_index: routineIndex,
          step_order: maxOrder + 1,
          action_text: actionText,
          is_override: false,
        });

      if (error) throw error;
      await fetchSubSteps();
      toast({ title: "Step added" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  // Edit a sub-step (creates override if editing admin step)
  const editSubStep = async (subStepId: string, newText: string, isUserCreated: boolean): Promise<boolean> => {
    if (!user || !templateId) return false;

    try {
      if (isUserCreated) {
        // Update user's own sub-step
        const { error } = await supabase
          .from("user_routine_substeps")
          .update({ action_text: newText })
          .eq("id", subStepId)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Create override for admin sub-step
        const adminStep = Array.from(adminSubSteps.values())
          .flat()
          .find(s => s.id === subStepId);

        if (!adminStep) throw new Error("Sub-step not found");

        // Find the routine index
        let routineIndex = -1;
        adminSubSteps.forEach((steps, idx) => {
          if (steps.some(s => s.id === subStepId)) routineIndex = idx;
        });

        const { error } = await supabase
          .from("user_routine_substeps")
          .insert({
            user_id: user.id,
            template_id: templateId,
            routine_index: routineIndex,
            step_order: adminStep.step_order,
            action_text: newText,
            is_override: true,
            original_substep_id: subStepId,
          });

        if (error) throw error;
      }

      await fetchSubSteps();
      toast({ title: "Step updated" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  // Delete a sub-step (soft delete for admin steps, hard delete for user steps)
  const deleteSubStep = async (subStepId: string, isUserCreated: boolean): Promise<boolean> => {
    if (!user || !templateId) return false;

    try {
      if (isUserCreated) {
        const { error } = await supabase
          .from("user_routine_substeps")
          .delete()
          .eq("id", subStepId)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Find routine index
        let routineIndex = -1;
        adminSubSteps.forEach((steps, idx) => {
          if (steps.some(s => s.id === subStepId)) routineIndex = idx;
        });

        const adminStep = Array.from(adminSubSteps.values())
          .flat()
          .find(s => s.id === subStepId);

        // Mark as deleted via user override
        const { error } = await supabase
          .from("user_routine_substeps")
          .insert({
            user_id: user.id,
            template_id: templateId,
            routine_index: routineIndex,
            step_order: adminStep?.step_order || 0,
            action_text: "",
            is_override: false,
            original_substep_id: subStepId,
            is_deleted: true,
          });

        if (error) throw error;
      }

      await fetchSubSteps();
      toast({ title: "Step removed" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  // Toggle sub-step completion
  const toggleSubStepComplete = async (subStepId: string, isUserCreated: boolean): Promise<void> => {
    if (!user) return;

    const isCompleted = completions.has(subStepId);
    const today = new Date().toISOString().split("T")[0];

    try {
      if (isCompleted) {
        // Remove completion
        const { error } = await supabase
          .from("user_substep_completions")
          .delete()
          .eq("user_id", user.id)
          .eq("completion_date", today)
          .eq(isUserCreated ? "user_substep_id" : "substep_id", subStepId);

        if (error) throw error;
        setCompletions(prev => {
          const next = new Set(prev);
          next.delete(subStepId);
          return next;
        });
      } else {
        // Add completion
        const insertData: any = {
          user_id: user.id,
          completion_date: today,
        };
        if (isUserCreated) {
          insertData.user_substep_id = subStepId;
        } else {
          insertData.substep_id = subStepId;
        }

        const { error } = await supabase
          .from("user_substep_completions")
          .insert(insertData);

        if (error) throw error;
        setCompletions(prev => new Set(prev).add(subStepId));
      }
    } catch (e: any) {
      console.error("Error toggling sub-step:", e);
    }
  };

  const isSubStepCompleted = (subStepId: string): boolean => completions.has(subStepId);

  return {
    loading,
    getSubSteps,
    addUserSubStep,
    editSubStep,
    deleteSubStep,
    toggleSubStepComplete,
    isSubStepCompleted,
    refetch: fetchSubSteps,
  };
}
