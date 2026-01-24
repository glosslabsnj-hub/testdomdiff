import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { MealPlanTemplate, MealPlanDay, MealPlanMeal, MealIngredient } from "./useMealPlanAssignment";

export function useMealPlanTemplates() {
  const [templates, setTemplates] = useState<MealPlanTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("meal_plan_templates")
        .select("*")
        .order("display_order");

      if (error) throw error;
      setTemplates(data || []);
    } catch (e: any) {
      console.error("Error fetching templates:", e);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (template: Omit<MealPlanTemplate, "id">) => {
    try {
      const { data, error } = await supabase
        .from("meal_plan_templates")
        .insert(template)
        .select()
        .single();

      if (error) throw error;
      await fetchTemplates();
      toast({ title: "Success", description: "Template created" });
      return data;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return null;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<MealPlanTemplate>) => {
    try {
      const { error } = await supabase
        .from("meal_plan_templates")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      await fetchTemplates();
      toast({ title: "Success", description: "Template updated" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from("meal_plan_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchTemplates();
      toast({ title: "Success", description: "Template deleted" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return { templates, loading, fetchTemplates, createTemplate, updateTemplate, deleteTemplate };
}

export function useMealPlanDays(templateId: string | null) {
  const [days, setDays] = useState<MealPlanDay[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchDays = async () => {
    if (!templateId) {
      setDays([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("meal_plan_days")
        .select("*")
        .eq("template_id", templateId)
        .order("day_number");

      if (error) throw error;
      setDays(data || []);
    } catch (e: any) {
      console.error("Error fetching days:", e);
    } finally {
      setLoading(false);
    }
  };

  const createDay = async (day: Omit<MealPlanDay, "id">) => {
    try {
      const { data, error } = await supabase
        .from("meal_plan_days")
        .insert(day)
        .select()
        .single();

      if (error) throw error;
      await fetchDays();
      return data;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return null;
    }
  };

  const createAllDays = async (templateId: string) => {
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
    try {
      const daysToCreate = dayNames.map((name, index) => ({
        template_id: templateId,
        day_number: index + 1,
        day_name: name
      }));

      const { error } = await supabase
        .from("meal_plan_days")
        .insert(daysToCreate);

      if (error) throw error;
      await fetchDays();
      toast({ title: "Success", description: "7 days created" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  useEffect(() => {
    fetchDays();
  }, [templateId]);

  return { days, loading, fetchDays, createDay, createAllDays };
}

export function useMealPlanMeals(dayId: string | null) {
  const [meals, setMeals] = useState<MealPlanMeal[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMeals = async () => {
    if (!dayId) {
      setMeals([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("meal_plan_meals")
        .select("*")
        .eq("day_id", dayId)
        .order("display_order");

      if (error) throw error;
      setMeals((data || []).map(meal => ({
        ...meal,
        meal_type: meal.meal_type as "breakfast" | "lunch" | "dinner" | "snack",
        ingredients: Array.isArray(meal.ingredients) 
          ? (meal.ingredients as unknown as MealIngredient[])
          : []
      })));
    } catch (e: any) {
      console.error("Error fetching meals:", e);
    } finally {
      setLoading(false);
    }
  };

  const createMeal = async (meal: Omit<MealPlanMeal, "id">) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mealToInsert: any = {
        day_id: meal.day_id,
        meal_type: meal.meal_type,
        meal_name: meal.meal_name,
        calories: meal.calories,
        protein_g: meal.protein_g,
        carbs_g: meal.carbs_g,
        fats_g: meal.fats_g,
        prep_time_min: meal.prep_time_min,
        cook_time_min: meal.cook_time_min,
        servings: meal.servings,
        ingredients: meal.ingredients,
        instructions: meal.instructions,
        notes: meal.notes,
        image_url: meal.image_url,
        display_order: meal.display_order
      };
      const { data, error } = await supabase
        .from("meal_plan_meals")
        .insert(mealToInsert)
        .select()
        .single();

      if (error) throw error;
      await fetchMeals();
      toast({ title: "Success", description: "Meal created" });
      return data;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return null;
    }
  };

  const updateMeal = async (id: string, updates: Partial<MealPlanMeal>) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatesToApply: any = { ...updates };
      const { error } = await supabase
        .from("meal_plan_meals")
        .update(updatesToApply)
        .eq("id", id);

      if (error) throw error;
      await fetchMeals();
      toast({ title: "Success", description: "Meal updated" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const deleteMeal = async (id: string) => {
    try {
      const { error } = await supabase
        .from("meal_plan_meals")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchMeals();
      toast({ title: "Success", description: "Meal deleted" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  useEffect(() => {
    fetchMeals();
  }, [dayId]);

  return { meals, loading, fetchMeals, createMeal, updateMeal, deleteMeal };
}
