import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  calculateDailyCalories, 
  parseHeight, 
  parseWeight,
  findMatchingTemplate,
  CalorieCalculationResult 
} from "@/lib/calorieCalculator";

export interface MealPlanTemplate {
  id: string;
  name: string;
  goal_type: string;
  calorie_range_min: number;
  calorie_range_max: number;
  daily_protein_g: number;
  daily_carbs_g: number;
  daily_fats_g: number;
  description: string | null;
  is_active: boolean;
  display_order: number;
}

export interface MealPlanDay {
  id: string;
  template_id: string;
  day_number: number;
  day_name: string;
}

export interface MealIngredient {
  item: string;
  amount: string;
  notes?: string;
}

export interface MealPlanMeal {
  id: string;
  day_id: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  meal_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  prep_time_min: number;
  cook_time_min: number;
  servings: number;
  ingredients: MealIngredient[];
  instructions: string | null;
  notes: string | null;
  image_url: string | null;
  display_order: number;
}

export interface AssignedMealPlan {
  template: MealPlanTemplate;
  days: (MealPlanDay & { meals: MealPlanMeal[] })[];
  userCalories: CalorieCalculationResult;
}

export function useMealPlanAssignment() {
  const { profile } = useAuth();
  const [templates, setTemplates] = useState<MealPlanTemplate[]>([]);
  const [assignedPlan, setAssignedPlan] = useState<AssignedMealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate user's calorie needs from profile
  const userCalories = useMemo(() => {
    if (!profile) return null;
    
    const { feet, inches } = parseHeight(profile.height || "");
    const weight = parseWeight(profile.weight || "");
    const age = profile.age || 30; // Default age if not set
    const goal = profile.goal || "Both - lose fat and build muscle";
    
    return calculateDailyCalories({
      weightLbs: weight,
      heightFeet: feet,
      heightInches: inches,
      age,
      goal
    });
  }, [profile]);

  // Fetch all active templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from("meal_plan_templates")
          .select("*")
          .eq("is_active", true)
          .order("display_order");

        if (error) throw error;
        setTemplates(data || []);
      } catch (e: any) {
        console.error("Error fetching meal plan templates:", e);
        setError(e.message);
      }
    };

    fetchTemplates();
  }, []);

  // Find and load the assigned meal plan
  useEffect(() => {
    const loadAssignedPlan = async () => {
      if (!profile || !userCalories || templates.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const goal = profile.goal || "Both - lose fat and build muscle";
        const matchedTemplate = findMatchingTemplate(
          templates,
          userCalories.targetCalories,
          goal
        );

        if (!matchedTemplate) {
          setLoading(false);
          return;
        }

        // Fetch days for the matched template
        const { data: daysData, error: daysError } = await supabase
          .from("meal_plan_days")
          .select("*")
          .eq("template_id", matchedTemplate.id)
          .order("day_number");

        if (daysError) throw daysError;

        if (!daysData || daysData.length === 0) {
          setAssignedPlan({
            template: matchedTemplate,
            days: [],
            userCalories
          });
          setLoading(false);
          return;
        }

        // Fetch meals for all days
        const dayIds = daysData.map(d => d.id);
        const { data: mealsData, error: mealsError } = await supabase
          .from("meal_plan_meals")
          .select("*")
          .in("day_id", dayIds)
          .order("display_order");

        if (mealsError) throw mealsError;

        // Organize meals by day
        const daysWithMeals = daysData.map(day => ({
          ...day,
          meals: (mealsData || [])
            .filter(meal => meal.day_id === day.id)
            .map(meal => ({
              ...meal,
              meal_type: meal.meal_type as "breakfast" | "lunch" | "dinner" | "snack",
              ingredients: Array.isArray(meal.ingredients) 
                ? (meal.ingredients as unknown as MealIngredient[])
                : []
            }))
        }));

        setAssignedPlan({
          template: matchedTemplate,
          days: daysWithMeals,
          userCalories
        });
      } catch (e: any) {
        console.error("Error loading assigned meal plan:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    loadAssignedPlan();
  }, [profile, userCalories, templates]);

  return {
    assignedPlan,
    userCalories,
    templates,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
    }
  };
}
