import { useMemo } from "react";
import type { TemplateCategory } from "./useProgramTemplates";

interface ClientProfile {
  experience?: string | null;
  body_fat_estimate?: string | null;
  activity_level?: string | null;
  training_days_per_week?: number | null;
  injuries?: string | null;
  goal?: string | null;
}

interface CategoryScore {
  category: TemplateCategory;
  score: number;
  reasons: string[];
}

// Scoring weights
const WEIGHTS = {
  experience: 0.35,
  bodyFat: 0.20,
  activityLevel: 0.20,
  trainingDays: 0.15,
  injuries: 0.10,
};

// Category mappings
const CATEGORY_MAPPINGS: Record<string, {
  experience: string[];
  bodyFat: string[];
  activityLevel: string[];
  minDays: number;
  maxDays: number;
  injuryFriendly: boolean;
}> = {
  "Beginner Basics": {
    experience: ["beginner", "none"],
    bodyFat: ["obese", "overweight", "average"],
    activityLevel: ["sedentary", "lightly_active"],
    minDays: 3,
    maxDays: 4,
    injuryFriendly: true,
  },
  "Foundation Builder": {
    experience: ["beginner", "intermediate"],
    bodyFat: ["overweight", "average"],
    activityLevel: ["lightly_active", "moderately_active"],
    minDays: 3,
    maxDays: 5,
    injuryFriendly: true,
  },
  "Intermediate Growth": {
    experience: ["intermediate"],
    bodyFat: ["average", "lean"],
    activityLevel: ["moderately_active", "very_active"],
    minDays: 4,
    maxDays: 6,
    injuryFriendly: false,
  },
  "Advanced Performance": {
    experience: ["advanced"],
    bodyFat: ["lean", "average"],
    activityLevel: ["very_active"],
    minDays: 5,
    maxDays: 7,
    injuryFriendly: false,
  },
  "Athletic Conditioning": {
    experience: ["beginner", "intermediate", "advanced"],
    bodyFat: ["lean", "average", "overweight"],
    activityLevel: ["moderately_active", "very_active"],
    minDays: 3,
    maxDays: 6,
    injuryFriendly: false,
  },
};

function normalizeExperience(experience: string | null | undefined): string {
  if (!experience) return "beginner";
  const lower = experience.toLowerCase();
  if (lower.includes("never") || lower.includes("0-1") || lower.includes("beginner")) {
    return "beginner";
  }
  if (lower.includes("1-3") || lower.includes("intermediate") || lower.includes("some")) {
    return "intermediate";
  }
  if (lower.includes("3+") || lower.includes("advanced") || lower.includes("expert")) {
    return "advanced";
  }
  return "beginner";
}

function scoreCategory(
  category: TemplateCategory,
  profile: ClientProfile
): CategoryScore {
  const mapping = CATEGORY_MAPPINGS[category.name];
  if (!mapping) {
    return { category, score: 0, reasons: ["Unknown category"] };
  }

  const reasons: string[] = [];
  let totalScore = 0;

  // Experience score (35%)
  const normalizedExp = normalizeExperience(profile.experience);
  const expMatch = mapping.experience.includes(normalizedExp);
  const expScore = expMatch ? 100 : 30;
  totalScore += expScore * WEIGHTS.experience;
  if (expMatch) {
    reasons.push(`Experience level matches (${normalizedExp})`);
  }

  // Body fat score (20%)
  const bodyFat = profile.body_fat_estimate?.toLowerCase() || "average";
  const bodyFatMatch = mapping.bodyFat.includes(bodyFat);
  const bodyFatScore = bodyFatMatch ? 100 : 40;
  totalScore += bodyFatScore * WEIGHTS.bodyFat;
  if (bodyFatMatch) {
    reasons.push(`Body composition aligns (${bodyFat})`);
  }

  // Activity level score (20%)
  const activityLevel = profile.activity_level?.toLowerCase() || "sedentary";
  const activityMatch = mapping.activityLevel.includes(activityLevel);
  const activityScore = activityMatch ? 100 : 35;
  totalScore += activityScore * WEIGHTS.activityLevel;
  if (activityMatch) {
    reasons.push(`Activity level compatible (${activityLevel.replace("_", " ")})`);
  }

  // Training days score (15%)
  const trainingDays = profile.training_days_per_week || 3;
  const daysInRange = trainingDays >= mapping.minDays && trainingDays <= mapping.maxDays;
  const daysScore = daysInRange ? 100 : Math.max(0, 100 - Math.abs(trainingDays - mapping.minDays) * 20);
  totalScore += daysScore * WEIGHTS.trainingDays;
  if (daysInRange) {
    reasons.push(`${trainingDays} training days fits well`);
  }

  // Injury consideration (10%)
  const hasInjuries = profile.injuries && profile.injuries.trim().length > 0;
  let injuryScore = 100;
  if (hasInjuries) {
    injuryScore = mapping.injuryFriendly ? 100 : 50;
    if (mapping.injuryFriendly) {
      reasons.push("Injury-friendly programming");
    }
  }
  totalScore += injuryScore * WEIGHTS.injuries;

  return {
    category,
    score: Math.round(totalScore),
    reasons,
  };
}

export function useTemplateSuggestion(
  categories: TemplateCategory[] | undefined,
  profile: ClientProfile | null
) {
  const scoredCategories = useMemo(() => {
    if (!categories || !profile) return [];

    return categories
      .map((category) => scoreCategory(category, profile))
      .sort((a, b) => b.score - a.score);
  }, [categories, profile]);

  const recommendedCategory = scoredCategories[0] || null;

  return {
    scoredCategories,
    recommendedCategory,
    isLoading: !categories,
  };
}

export function getMatchQuality(score: number): {
  label: string;
  color: string;
} {
  if (score >= 85) return { label: "Excellent Match", color: "text-green-400" };
  if (score >= 70) return { label: "Good Match", color: "text-primary" };
  if (score >= 50) return { label: "Fair Match", color: "text-yellow-400" };
  return { label: "Possible Fit", color: "text-muted-foreground" };
}
