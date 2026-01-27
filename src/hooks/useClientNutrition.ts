import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNutritionTemplateCategories, useNutritionTemplates, useNutritionTemplateDetails } from "./useNutritionTemplates";
import { useNutritionTemplateSuggestion } from "./useNutritionSuggestion";
import { useMemo } from "react";

export interface NutritionAssignment {
  id: string;
  client_id: string;
  template_id: string;
  assigned_by: string | null;
  assigned_at: string;
  notes: string | null;
}

export interface NutritionDayCompletion {
  id: string;
  user_id: string;
  day_id: string;
  completed_at: string;
}

/**
 * Hook for fetching a client's assigned or auto-matched nutrition template
 * with completion tracking for the 4-week view
 */
export function useClientNutrition(clientId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const effectiveClientId = clientId || user?.id;

  // Fetch client profile for auto-matching
  const { data: profile } = useQuery({
    queryKey: ["client-profile-nutrition", effectiveClientId],
    queryFn: async () => {
      if (!effectiveClientId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("goal, goal_type, activity_level, weight, height, age, dietary_restrictions, meal_prep_preference")
        .eq("user_id", effectiveClientId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!effectiveClientId,
  });

  // Check for admin-assigned template
  const { data: assignment } = useQuery({
    queryKey: ["client-nutrition-assignment", effectiveClientId],
    queryFn: async () => {
      if (!effectiveClientId) return null;
      const { data, error } = await supabase
        .from("client_nutrition_assignments")
        .select("*")
        .eq("client_id", effectiveClientId)
        .maybeSingle();
      if (error) throw error;
      return data as NutritionAssignment | null;
    },
    enabled: !!effectiveClientId,
  });

  // Fetch templates and categories for auto-matching
  const { data: categories } = useNutritionTemplateCategories();
  const { data: templates } = useNutritionTemplates();

  // Get recommendation based on profile
  const { recommendation } = useNutritionTemplateSuggestion(
    templates,
    categories,
    profile ? {
      goal: profile.goal,
      goal_type: profile.goal_type,
      activity_level: profile.activity_level,
      weight: profile.weight,
      height: profile.height,
      age: profile.age,
      dietary_restrictions: profile.dietary_restrictions,
      meal_prep_preference: profile.meal_prep_preference,
    } : null
  );

  // Determine which template to use
  const effectiveTemplateId = assignment?.template_id || recommendation?.template?.id || null;

  // Fetch full template details with days and meals
  const { data: templateDetails, isLoading: templateLoading } = useNutritionTemplateDetails(effectiveTemplateId);

  // Fetch day completions
  const { data: completions } = useQuery({
    queryKey: ["client-nutrition-completions", effectiveClientId],
    queryFn: async () => {
      if (!effectiveClientId) return [];
      const { data, error } = await supabase
        .from("client_nutrition_completions")
        .select("*")
        .eq("user_id", effectiveClientId);
      if (error) throw error;
      return data as NutritionDayCompletion[];
    },
    enabled: !!effectiveClientId,
  });

  // Organize days into weeks (7 days each)
  const weeks = useMemo(() => {
    if (!templateDetails?.days) return [];
    
    const weekMap: Record<number, typeof templateDetails.days> = {};
    templateDetails.days.forEach((day) => {
      const weekNum = Math.ceil(day.day_number / 7);
      if (!weekMap[weekNum]) weekMap[weekNum] = [];
      weekMap[weekNum].push(day);
    });

    return Object.entries(weekMap).map(([weekNum, days]) => ({
      weekNumber: parseInt(weekNum),
      days: days.sort((a, b) => a.day_number - b.day_number),
    }));
  }, [templateDetails?.days]);

  // Get meals for a specific day
  const getMealsForDay = (dayId: string) => {
    if (!templateDetails?.meals) return [];
    return templateDetails.meals
      .filter((m) => m.day_id === dayId)
      .sort((a, b) => {
        const order = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
        return (order[a.meal_type as keyof typeof order] ?? 4) - (order[b.meal_type as keyof typeof order] ?? 4);
      });
  };

  // Check if a day is completed
  const isDayCompleted = (dayId: string) => {
    return completions?.some((c) => c.day_id === dayId) ?? false;
  };

  // Toggle day completion mutation
  const toggleCompletionMutation = useMutation({
    mutationFn: async (dayId: string) => {
      if (!effectiveClientId) throw new Error("No client ID");
      
      const isCompleted = isDayCompleted(dayId);
      
      if (isCompleted) {
        // Remove completion
        const { error } = await supabase
          .from("client_nutrition_completions")
          .delete()
          .eq("user_id", effectiveClientId)
          .eq("day_id", dayId);
        if (error) throw error;
      } else {
        // Add completion
        const { error } = await supabase
          .from("client_nutrition_completions")
          .insert({
            user_id: effectiveClientId,
            day_id: dayId,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-nutrition-completions", effectiveClientId] });
    },
    onError: (error) => {
      toast.error("Failed to update completion: " + error.message);
    },
  });

  const toggleDayCompletion = (dayId: string) => {
    toggleCompletionMutation.mutate(dayId);
  };

  // Calculate completion stats
  const completionStats = useMemo(() => {
    if (!templateDetails?.days || !completions) {
      return { totalDays: 0, completedDays: 0, isPhaseComplete: false };
    }
    
    const totalDays = templateDetails.days.length;
    const completedDays = completions.length;
    const isPhaseComplete = totalDays > 0 && completedDays >= totalDays;
    
    return { totalDays, completedDays, isPhaseComplete };
  }, [templateDetails?.days, completions]);

  // Calculate week stats
  const getWeekStats = (weekNumber: number) => {
    const week = weeks.find((w) => w.weekNumber === weekNumber);
    if (!week) return { total: 0, completed: 0, isComplete: false };
    
    const total = week.days.length;
    const completed = week.days.filter((d) => isDayCompleted(d.id)).length;
    
    return { total, completed, isComplete: total > 0 && completed >= total };
  };

  return {
    template: templateDetails?.template || null,
    weeks,
    getMealsForDay,
    isDayCompleted,
    toggleDayCompletion,
    hasNutritionProgram: !!effectiveTemplateId,
    isAssigned: !!assignment,
    assignment,
    recommendation,
    completionStats,
    getWeekStats,
    loading: templateLoading,
  };
}

/**
 * Hook for admins to assign nutrition templates to clients
 */
export function useAssignClientNutrition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      templateId,
      assignedBy,
      notes,
    }: {
      clientId: string;
      templateId: string;
      assignedBy?: string;
      notes?: string;
    }) => {
      // Upsert the assignment
      const { data, error } = await supabase
        .from("client_nutrition_assignments")
        .upsert(
          {
            client_id: clientId,
            template_id: templateId,
            assigned_by: assignedBy,
            notes,
            assigned_at: new Date().toISOString(),
          },
          { onConflict: "client_id" }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["client-nutrition-assignment", variables.clientId] });
      toast.success("Nutrition template assigned to client");
    },
    onError: (error) => {
      toast.error("Failed to assign template: " + error.message);
    },
  });
}
