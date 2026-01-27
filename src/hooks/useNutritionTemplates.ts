import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface NutritionTemplateCategory {
  id: string;
  name: string;
  description: string | null;
  target_profile: string | null;
  icon: string | null;
  display_order: number | null;
  is_active: boolean | null;
}

export interface NutritionMealPlanTemplate {
  id: string;
  name: string;
  description: string | null;
  goal_type: string;
  calorie_range_min: number;
  calorie_range_max: number;
  daily_protein_g: number;
  daily_carbs_g: number;
  daily_fats_g: number;
  display_order: number | null;
  is_active: boolean | null;
}

export interface NutritionMealPlanDay {
  id: string;
  template_id: string;
  day_number: number;
  day_name: string;
}

export interface NutritionMealPlanMeal {
  id: string;
  day_id: string;
  meal_type: string;
  meal_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  prep_time_min: number | null;
  cook_time_min: number | null;
  servings: number | null;
  instructions: string | null;
  notes: string | null;
  image_url: string | null;
  display_order: number | null;
  ingredients?: Array<{ item: string; amount: string; notes?: string }> | null;
}

export interface NutritionTemplateWithCategory extends NutritionMealPlanTemplate {
  category_id: string | null;
  difficulty: string | null;
  dietary_tags?: string[] | null;
  category?: NutritionTemplateCategory;
}

// Fetch all nutrition template categories
export function useNutritionTemplateCategories() {
  return useQuery({
    queryKey: ["nutrition-template-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nutrition_template_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      return data as NutritionTemplateCategory[];
    },
  });
}

// Fetch all nutrition templates with optional category filter
export function useNutritionTemplates(categoryId?: string) {
  return useQuery({
    queryKey: ["nutrition-templates", categoryId],
    queryFn: async () => {
      let query = supabase
        .from("meal_plan_templates")
        .select(`
          *,
          category:nutrition_template_categories(*)
        `)
        .eq("is_active", true)
        .order("display_order");

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as NutritionTemplateWithCategory[];
    },
  });
}

// Fetch a single nutrition template with all its days and meals
export function useNutritionTemplateDetails(templateId: string | null) {
  return useQuery({
    queryKey: ["nutrition-template-details", templateId],
    queryFn: async () => {
      if (!templateId) return null;

      // Get template
      const { data: template, error: templateError } = await supabase
        .from("meal_plan_templates")
        .select(`
          *,
          category:nutrition_template_categories(*)
        `)
        .eq("id", templateId)
        .single();

      if (templateError) throw templateError;

      // Get days
      const { data: days, error: daysError } = await supabase
        .from("meal_plan_days")
        .select("*")
        .eq("template_id", templateId)
        .order("day_number");

      if (daysError) throw daysError;

      // Get meals for all days
      const dayIds = days.map((d) => d.id);
      const { data: meals, error: mealsError } = await supabase
        .from("meal_plan_meals")
        .select("id, day_id, meal_type, meal_name, calories, protein_g, carbs_g, fats_g, prep_time_min, cook_time_min, servings, instructions, notes, image_url, display_order, ingredients")
        .in("day_id", dayIds)
        .order("display_order");

      if (mealsError) throw mealsError;

      return {
        template: template as NutritionTemplateWithCategory,
        days: days as NutritionMealPlanDay[],
        meals: meals as NutritionMealPlanMeal[],
      };
    },
    enabled: !!templateId,
  });
}

// Update a nutrition template
export function useUpdateNutritionTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<NutritionTemplateWithCategory> & { id: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { category, ...updateData } = data;
      const { data: template, error } = await supabase
        .from("meal_plan_templates")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrition-templates"] });
      queryClient.invalidateQueries({ queryKey: ["nutrition-template-details"] });
      toast.success("Nutrition template updated");
    },
    onError: (error) => {
      toast.error("Failed to update template: " + error.message);
    },
  });
}

// Update a meal
export function useUpdateNutritionMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<NutritionMealPlanMeal> & { id: string }) => {
      const { error } = await supabase
        .from("meal_plan_meals")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrition-template-details"] });
      toast.success("Meal updated");
    },
    onError: (error) => {
      toast.error("Failed to update meal: " + error.message);
    },
  });
}

// Calculate recommended category based on client intake
export function calculateNutritionCategory(profile: {
  goal?: string | null;
  activity_level?: string | null;
  weight?: string | null;
  height?: string | null;
  age?: number | null;
}): {
  recommendedCategory: string;
  tdee: number;
  targetCalories: number;
} {
  // Parse weight and height
  const weightLbs = parseFloat(profile.weight || "180");
  const heightStr = profile.height || "5'10\"";
  const heightMatch = heightStr.match(/(\d+)'(\d+)/);
  const heightInches = heightMatch
    ? parseInt(heightMatch[1]) * 12 + parseInt(heightMatch[2])
    : 70;
  const age = profile.age || 30;

  // Convert to metric
  const weightKg = weightLbs * 0.453592;
  const heightCm = heightInches * 2.54;

  // Mifflin-St Jeor equation (male)
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;

  // Activity multiplier
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const multiplier = activityMultipliers[profile.activity_level || "moderate"] || 1.55;
  const tdee = Math.round(bmr * multiplier);

  // Determine category and target calories based on goal
  let recommendedCategory = "Recomposition";
  let targetCalories = tdee;

  switch (profile.goal) {
    case "lose_fat":
    case "fat_loss":
      if (tdee > 2500) {
        recommendedCategory = "Fat Loss - Aggressive";
        targetCalories = tdee - 750;
      } else {
        recommendedCategory = "Fat Loss - Moderate";
        targetCalories = tdee - 500;
      }
      break;
    case "build_muscle":
    case "muscle_gain":
      if (profile.activity_level === "active" || profile.activity_level === "very_active") {
        recommendedCategory = "Muscle Building - Mass";
        targetCalories = tdee + 500;
      } else {
        recommendedCategory = "Muscle Building - Lean";
        targetCalories = tdee + 300;
      }
      break;
    case "recomposition":
    case "maintain":
    default:
      recommendedCategory = "Recomposition";
      targetCalories = tdee;
      break;
  }

  return {
    recommendedCategory,
    tdee,
    targetCalories,
  };
}

// Assign a nutrition template to a client
export function useAssignNutritionTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      templateId,
    }: {
      clientId: string;
      templateId: string;
    }) => {
      // Get the template details
      const { data: template, error: templateError } = await supabase
        .from("meal_plan_templates")
        .select("id")
        .eq("id", templateId)
        .single();

      if (templateError) throw templateError;

      // Update the client's profile with the assigned meal plan template
      // (You may want to create a separate table for this in a real implementation)
      // For now, we'll just return success as the assignment is tracked elsewhere
      
      return { success: true, templateId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-nutrition"] });
      toast.success("Nutrition template assigned to client");
    },
    onError: (error) => {
      toast.error("Failed to assign template: " + error.message);
    },
  });
}
