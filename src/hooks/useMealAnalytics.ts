import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MealAnalytics {
  mealId: string;
  mealName: string;
  mealType: string;
  templateName: string;
  likes: number;
  skips: number;
  madeCount: number;
  avgRating: number | null;
  swapOutCount: number;
  swapInCount: number;
  popularityScore: number; // likes + made - skips
}

export interface MealAnalyticsSummary {
  totalFeedback: number;
  totalSwaps: number;
  mostLikedMeals: MealAnalytics[];
  mostSkippedMeals: MealAnalytics[];
  mostSwappedOut: MealAnalytics[];
  recentFeedback: {
    id: string;
    user_id: string;
    meal_name: string;
    feedback_type: string;
    rating: number | null;
    created_at: string;
  }[];
}

export function useMealAnalytics() {
  const [analytics, setAnalytics] = useState<MealAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch all feedback
        const { data: feedbackData, error: feedbackError } = await supabase
          .from("meal_feedback")
          .select("*")
          .order("created_at", { ascending: false });

        if (feedbackError) throw feedbackError;

        // Fetch all swaps
        const { data: swapsData, error: swapsError } = await supabase
          .from("user_meal_swaps")
          .select("*")
          .order("created_at", { ascending: false });

        if (swapsError) throw swapsError;

        // Fetch all meals with template info
        const { data: mealsData, error: mealsError } = await supabase
          .from("meal_plan_meals")
          .select(`
            id,
            meal_name,
            meal_type,
            day_id
          `);

        if (mealsError) throw mealsError;

        // Fetch days to get template info
        const { data: daysData, error: daysError } = await supabase
          .from("meal_plan_days")
          .select(`
            id,
            template_id
          `);

        if (daysError) throw daysError;

        // Fetch templates
        const { data: templatesData, error: templatesError } = await supabase
          .from("meal_plan_templates")
          .select("id, name");

        if (templatesError) throw templatesError;

        // Build meal analytics map
        const mealAnalyticsMap = new Map<string, MealAnalytics>();

        // Initialize all meals
        mealsData?.forEach(meal => {
          const day = daysData?.find(d => d.id === meal.day_id);
          const template = templatesData?.find(t => t.id === day?.template_id);
          
          mealAnalyticsMap.set(meal.id, {
            mealId: meal.id,
            mealName: meal.meal_name,
            mealType: meal.meal_type,
            templateName: template?.name || "Unknown",
            likes: 0,
            skips: 0,
            madeCount: 0,
            avgRating: null,
            swapOutCount: 0,
            swapInCount: 0,
            popularityScore: 0
          });
        });

        // Process feedback
        const ratings: Record<string, number[]> = {};
        feedbackData?.forEach(fb => {
          const analytics = mealAnalyticsMap.get(fb.meal_id);
          if (analytics) {
            if (fb.feedback_type === "like") analytics.likes++;
            if (fb.feedback_type === "skip") analytics.skips++;
            if (fb.feedback_type === "made") analytics.madeCount++;
            if (fb.rating) {
              if (!ratings[fb.meal_id]) ratings[fb.meal_id] = [];
              ratings[fb.meal_id].push(fb.rating);
            }
          }
        });

        // Calculate average ratings
        Object.entries(ratings).forEach(([mealId, mealRatings]) => {
          const analytics = mealAnalyticsMap.get(mealId);
          if (analytics && mealRatings.length > 0) {
            analytics.avgRating = mealRatings.reduce((a, b) => a + b, 0) / mealRatings.length;
          }
        });

        // Process swaps
        swapsData?.forEach(swap => {
          const originalAnalytics = mealAnalyticsMap.get(swap.original_meal_id);
          const swappedAnalytics = mealAnalyticsMap.get(swap.swapped_meal_id);
          
          if (originalAnalytics) originalAnalytics.swapOutCount++;
          if (swappedAnalytics) swappedAnalytics.swapInCount++;
        });

        // Calculate popularity scores
        mealAnalyticsMap.forEach(analytics => {
          analytics.popularityScore = analytics.likes + analytics.madeCount - analytics.skips;
        });

        // Convert to array and sort
        const allMealAnalytics = Array.from(mealAnalyticsMap.values());
        
        const mostLikedMeals = [...allMealAnalytics]
          .filter(m => m.likes > 0)
          .sort((a, b) => b.likes - a.likes)
          .slice(0, 10);

        const mostSkippedMeals = [...allMealAnalytics]
          .filter(m => m.skips > 0)
          .sort((a, b) => b.skips - a.skips)
          .slice(0, 10);

        const mostSwappedOut = [...allMealAnalytics]
          .filter(m => m.swapOutCount > 0)
          .sort((a, b) => b.swapOutCount - a.swapOutCount)
          .slice(0, 10);

        // Build recent feedback with meal names
        const recentFeedback = (feedbackData?.slice(0, 20) || []).map(fb => {
          const meal = mealsData?.find(m => m.id === fb.meal_id);
          return {
            id: fb.id,
            user_id: fb.user_id,
            meal_name: meal?.meal_name || "Unknown Meal",
            feedback_type: fb.feedback_type,
            rating: fb.rating,
            created_at: fb.created_at
          };
        });

        setAnalytics({
          totalFeedback: feedbackData?.length || 0,
          totalSwaps: swapsData?.length || 0,
          mostLikedMeals,
          mostSkippedMeals,
          mostSwappedOut,
          recentFeedback
        });
      } catch (e: any) {
        console.error("Error fetching meal analytics:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return { analytics, loading, error };
}
