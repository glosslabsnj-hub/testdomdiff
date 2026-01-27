import { useMemo } from "react";
import type { TemplateCategory, ProgramTemplate } from "./useProgramTemplates";

interface ClientWorkoutProfile {
  experience?: string | null;
  body_fat_estimate?: string | null;
  activity_level?: string | null;
  training_days_per_week?: number | null;
  injuries?: string | null;
  equipment?: string | null;
  training_style?: string | null;
  session_length_preference?: string | null;
}

interface WorkoutTemplateScore {
  template: ProgramTemplate;
  score: number;
  reasons: string[];
}

interface WorkoutRecommendation {
  category: TemplateCategory;
  template: ProgramTemplate;
  score: number;
  reasons: string[];
}

// Scoring weights
const WEIGHTS = {
  trainingDays: 0.35,
  equipment: 0.30,
  intensity: 0.25,
  injuries: 0.10,
};

// Category to experience/intensity mapping
const CATEGORY_INTENSITY: Record<string, number> = {
  "Beginner Basics": 1,
  "Foundation Builder": 1.5,
  "Intermediate Growth": 2,
  "Advanced Performance": 3,
  "Athletic Conditioning": 2.5,
};

function normalizeExperience(experience: string | null | undefined): number {
  if (!experience) return 1;
  const lower = experience.toLowerCase();
  if (lower.includes("beginner") || lower.includes("0-1")) return 1;
  if (lower.includes("intermediate") || lower.includes("1-3")) return 2;
  if (lower.includes("advanced") || lower.includes("3+")) return 3;
  return 1;
}

function getBodyFatIntensityModifier(bodyFat: string | null | undefined): number {
  if (!bodyFat) return 0;
  const lower = bodyFat.toLowerCase();
  if (lower === "lean") return 0.5;
  if (lower === "average") return 0;
  if (lower === "overweight") return -0.3;
  if (lower === "obese") return -0.5;
  return 0;
}

/**
 * Calculate the recommended workout template based on client profile
 * Uses a scoring algorithm considering training days, equipment, and intensity
 */
export function useWorkoutTemplateSuggestion(
  templates: ProgramTemplate[] | undefined,
  categories: TemplateCategory[] | undefined,
  recommendedCategory: TemplateCategory | null,
  profile: ClientWorkoutProfile | null
): {
  recommendation: WorkoutRecommendation | null;
  scoredTemplates: WorkoutTemplateScore[];
  isLoading: boolean;
} {
  const result = useMemo(() => {
    if (!templates || !categories || !recommendedCategory || !profile) {
      return { recommendation: null, scoredTemplates: [], isLoading: false };
    }

    // Filter templates in the recommended category
    const categoryTemplates = templates.filter(
      (t) => t.category_id === recommendedCategory.id
    );

    if (categoryTemplates.length === 0) {
      return { recommendation: null, scoredTemplates: [], isLoading: false };
    }

    const clientDays = profile.training_days_per_week || 4;
    const clientEquipment = (profile.equipment || "").toLowerCase().split(",").map(e => e.trim()).filter(Boolean);
    const clientIntensity = normalizeExperience(profile.experience) + getBodyFatIntensityModifier(profile.body_fat_estimate);

    // Score each template
    const scoredTemplates: WorkoutTemplateScore[] = categoryTemplates.map((template) => {
      const reasons: string[] = [];
      let totalScore = 0;

      // Training days match (35%)
      const templateDays = template.days_per_week || 4;
      const daysDiff = Math.abs(clientDays - templateDays);
      const daysScore = daysDiff === 0 ? 100 : daysDiff === 1 ? 80 : daysDiff === 2 ? 50 : 20;
      totalScore += daysScore * WEIGHTS.trainingDays;
      
      if (daysDiff === 0) {
        reasons.push(`Perfect match: ${templateDays} days/week`);
      } else if (daysDiff <= 1) {
        reasons.push(`Good fit: ${templateDays} days/week (you prefer ${clientDays})`);
      }

      // Equipment match (30%)
      const templateEquipment = (template.equipment || []).map(e => e.toLowerCase());
      let equipmentScore = 100;
      
      if (templateEquipment.length > 0 && clientEquipment.length > 0) {
        const matchCount = templateEquipment.filter(te => 
          clientEquipment.some(ce => ce.includes(te) || te.includes(ce))
        ).length;
        equipmentScore = templateEquipment.length > 0 
          ? (matchCount / templateEquipment.length) * 100 
          : 100;
        
        if (equipmentScore >= 80) {
          reasons.push("Equipment requirements met");
        }
      } else if (templateEquipment.length === 0 || templateEquipment.includes("bodyweight")) {
        reasons.push("Minimal equipment needed");
      }
      
      totalScore += equipmentScore * WEIGHTS.equipment;

      // Intensity match (25%)
      const categoryIntensity = CATEGORY_INTENSITY[recommendedCategory.name] || 2;
      const intensityDiff = Math.abs(clientIntensity - categoryIntensity);
      const intensityScore = intensityDiff <= 0.5 ? 100 : intensityDiff <= 1 ? 75 : 50;
      totalScore += intensityScore * WEIGHTS.intensity;

      // Injury consideration (10%)
      const hasInjuries = profile.injuries && profile.injuries.trim().length > 0;
      let injuryScore = 100;
      if (hasInjuries) {
        // Prefer lower intensity templates for clients with injuries
        if (categoryIntensity <= 1.5) {
          injuryScore = 100;
          reasons.push("Injury-friendly programming");
        } else {
          injuryScore = 60;
        }
      }
      totalScore += injuryScore * WEIGHTS.injuries;

      return {
        template,
        score: Math.round(totalScore),
        reasons,
      };
    }).sort((a, b) => b.score - a.score);

    const bestMatch = scoredTemplates[0];

    return {
      recommendation: {
        category: recommendedCategory,
        template: bestMatch.template,
        score: bestMatch.score,
        reasons: bestMatch.reasons,
      },
      scoredTemplates,
      isLoading: false,
    };
  }, [templates, categories, recommendedCategory, profile]);

  return {
    recommendation: result.recommendation,
    scoredTemplates: result.scoredTemplates,
    isLoading: !templates || !categories,
  };
}

/**
 * Get match quality label and color based on score
 */
export function getWorkoutMatchQuality(score: number): {
  label: string;
  color: string;
} {
  if (score >= 85) return { label: "Excellent Match", color: "text-green-400" };
  if (score >= 70) return { label: "Good Match", color: "text-primary" };
  if (score >= 50) return { label: "Fair Match", color: "text-yellow-400" };
  return { label: "Possible Fit", color: "text-muted-foreground" };
}
