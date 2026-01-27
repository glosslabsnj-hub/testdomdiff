import { useMemo } from "react";
import type { NutritionTemplateWithCategory, NutritionTemplateCategory } from "./useNutritionTemplates";
import { calculateNutritionCategory } from "./useNutritionTemplates";

interface ClientNutritionProfile {
  goal?: string | null;
  goal_type?: string | null;
  activity_level?: string | null;
  weight?: string | null;
  height?: string | null;
  age?: number | null;
  dietary_restrictions?: string | null;
  meal_prep_preference?: string | null;
}

/**
 * Parse dietary restrictions from comma-separated string to array
 */
function parseDietaryRestrictions(restrictions: string | null | undefined): string[] {
  if (!restrictions) return [];
  return restrictions
    .split(",")
    .map((r) => r.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Map intake form values to dietary tags used in templates
 */
function mapRestrictionToTag(restriction: string): string | null {
  const mapping: Record<string, string> = {
    "gluten-free": "gluten-free",
    "gluten free": "gluten-free",
    "dairy-free": "dairy-free",
    "dairy free": "dairy-free",
    "vegetarian": "vegetarian",
    "keto": "keto",
    "keto/low-carb": "keto",
    "low-carb": "keto",
  };
  return mapping[restriction.toLowerCase()] || null;
}

interface NutritionTemplateScore {
  template: NutritionTemplateWithCategory;
  score: number;
  reasons: string[];
  calorieMatch: number;
}

interface NutritionRecommendation {
  category: NutritionTemplateCategory;
  template: NutritionTemplateWithCategory;
  score: number;
  reasons: string[];
  tdee: number;
  targetCalories: number;
}

/**
 * Calculate the recommended nutrition template based on client profile
 * Uses calorie proximity to find the best-matching template within the recommended category
 */
export function useNutritionTemplateSuggestion(
  templates: NutritionTemplateWithCategory[] | undefined,
  categories: NutritionTemplateCategory[] | undefined,
  profile: ClientNutritionProfile | null
): {
  recommendation: NutritionRecommendation | null;
  scoredTemplates: NutritionTemplateScore[];
  isLoading: boolean;
} {
  const result = useMemo(() => {
    if (!templates || !categories || !profile) {
      return { recommendation: null, scoredTemplates: [], isLoading: false };
    }

    // Map goal to the format expected by calculateNutritionCategory
    const goalMapping: Record<string, string> = {
      "Lose fat": "fat_loss",
      "Build muscle": "muscle_gain",
      "Both - lose fat and build muscle": "recomposition",
      "fat_loss": "fat_loss",
      "muscle_gain": "muscle_gain",
      "recomposition": "recomposition",
    };

    const mappedGoal = goalMapping[profile.goal_type || profile.goal || ""] || "recomposition";

    // Get category recommendation and TDEE
    const categoryResult = calculateNutritionCategory({
      goal: mappedGoal,
      activity_level: profile.activity_level,
      weight: profile.weight,
      height: profile.height,
      age: profile.age,
    });

    // Find the matching category
    const recommendedCategory = categories.find(
      (c) => c.name === categoryResult.recommendedCategory
    );

    if (!recommendedCategory) {
      return { recommendation: null, scoredTemplates: [], isLoading: false };
    }

    // Parse dietary restrictions from profile
    const clientRestrictions = parseDietaryRestrictions(profile.dietary_restrictions);
    const clientDietaryTags = clientRestrictions
      .map(mapRestrictionToTag)
      .filter((tag): tag is string => tag !== null);

    // Filter templates in the recommended category
    let categoryTemplates = templates.filter(
      (t) => t.category_id === recommendedCategory.id
    );

    // If client has dietary restrictions, prefer templates with matching dietary_tags
    if (clientDietaryTags.length > 0) {
      const dietaryMatches = categoryTemplates.filter((t) => {
        const templateTags = (t as NutritionTemplateWithCategory & { dietary_tags?: string[] }).dietary_tags || [];
        return clientDietaryTags.some((tag) => templateTags.includes(tag));
      });
      
      // Use dietary matches if available, otherwise fall back to all templates
      if (dietaryMatches.length > 0) {
        categoryTemplates = dietaryMatches;
      }
    }

    if (categoryTemplates.length === 0) {
      return { recommendation: null, scoredTemplates: [], isLoading: false };
    }

    // Score each template by calorie proximity
    const scoredTemplates: NutritionTemplateScore[] = categoryTemplates.map((template) => {
      const templateMidpoint = (template.calorie_range_min + template.calorie_range_max) / 2;
      const calorieDistance = Math.abs(categoryResult.targetCalories - templateMidpoint);
      
      // Score: 100 at perfect match, loses points as distance increases
      // Every 10 calories of distance loses 1 point
      const calorieScore = Math.max(0, 100 - (calorieDistance / 10));
      
      const reasons: string[] = [];
      
      if (calorieDistance <= 50) {
        reasons.push(`Excellent calorie match (${templateMidpoint} cal)`);
      } else if (calorieDistance <= 150) {
        reasons.push(`Good calorie range (${template.calorie_range_min}-${template.calorie_range_max} cal)`);
      } else {
        reasons.push(`Calorie range: ${template.calorie_range_min}-${template.calorie_range_max} cal`);
      }
      
      reasons.push(`Target: ${categoryResult.targetCalories} cal/day`);
      reasons.push(`TDEE: ${categoryResult.tdee} cal`);

      return {
        template,
        score: Math.round(calorieScore),
        reasons,
        calorieMatch: calorieDistance,
      };
    }).sort((a, b) => b.score - a.score);

    const bestMatch = scoredTemplates[0];

    return {
      recommendation: {
        category: recommendedCategory,
        template: bestMatch.template,
        score: bestMatch.score,
        reasons: bestMatch.reasons,
        tdee: categoryResult.tdee,
        targetCalories: categoryResult.targetCalories,
      },
      scoredTemplates,
      isLoading: false,
    };
  }, [templates, categories, profile]);

  return {
    recommendation: result.recommendation,
    scoredTemplates: result.scoredTemplates,
    isLoading: !templates || !categories,
  };
}

/**
 * Get match quality label and color based on score
 */
export function getNutritionMatchQuality(score: number): {
  label: string;
  color: string;
} {
  if (score >= 90) return { label: "Excellent Match", color: "text-green-400" };
  if (score >= 75) return { label: "Good Match", color: "text-primary" };
  if (score >= 50) return { label: "Fair Match", color: "text-yellow-400" };
  return { label: "Possible Fit", color: "text-muted-foreground" };
}
