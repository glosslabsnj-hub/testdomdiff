import { Crown, ArrowRight, Dumbbell, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type ClientWithSubscription } from "@/hooks/useClientAnalytics";
import { useTemplateCategories } from "@/hooks/useProgramTemplates";
import { useNutritionTemplateCategories, calculateNutritionCategory } from "@/hooks/useNutritionTemplates";
import { useTemplateSuggestion, getMatchQuality } from "@/hooks/useTemplateSuggestion";
import { useMemo } from "react";

interface ClientRecommendationBannerProps {
  client: ClientWithSubscription;
  type: "workout" | "nutrition";
  onViewRecommended: (categoryId: string | null) => void;
}

export default function ClientRecommendationBanner({
  client,
  type,
  onViewRecommended,
}: ClientRecommendationBannerProps) {
  const { data: workoutCategories } = useTemplateCategories();
  const { data: nutritionCategories } = useNutritionTemplateCategories();

  // Workout recommendation using existing hook
  // ClientWithSubscription extends ClientProfile, so fields are directly on client
  const clientProfile = useMemo(() => ({
    experience: client.experience,
    body_fat_estimate: client.body_fat_estimate,
    activity_level: client.activity_level,
    training_days_per_week: client.training_days_per_week,
    injuries: client.injuries,
    goal: client.goal,
  }), [client.experience, client.body_fat_estimate, client.activity_level, client.training_days_per_week, client.injuries, client.goal]);

  const { recommendedCategory: workoutRecommendation } = useTemplateSuggestion(
    workoutCategories,
    clientProfile
  );

  // Nutrition recommendation using existing function
  const nutritionRecommendation = useMemo(() => {
    // Map goal to the format expected by calculateNutritionCategory
    const goalMapping: Record<string, string> = {
      "Lose fat": "fat_loss",
      "Build muscle": "muscle_gain",
      "Both - lose fat and build muscle": "recomposition",
    };
    
    const mappedGoal = goalMapping[client.goal || ""] || "recomposition";
    
    return calculateNutritionCategory({
      goal: mappedGoal,
      activity_level: client.activity_level,
      weight: client.weight,
      height: client.height,
      age: client.age,
    });
  }, [client.goal, client.activity_level, client.weight, client.height, client.age]);

  // Find matching nutrition category ID
  const nutritionCategoryMatch = useMemo(() => {
    if (!nutritionCategories || !nutritionRecommendation) return null;
    return nutritionCategories.find(
      (c) => c.name === nutritionRecommendation.recommendedCategory
    );
  }, [nutritionCategories, nutritionRecommendation]);

  // Get display info based on type
  const displayInfo = useMemo(() => {
    if (type === "workout" && workoutRecommendation) {
      const quality = getMatchQuality(workoutRecommendation.score);
      return {
        categoryName: workoutRecommendation.category.name,
        categoryId: workoutRecommendation.category.id,
        score: workoutRecommendation.score,
        qualityLabel: quality.label,
        qualityColor: quality.color,
        icon: Dumbbell,
        subtitle: `${workoutRecommendation.reasons.slice(0, 2).join(" • ")}`,
      };
    }
    
    if (type === "nutrition" && nutritionRecommendation) {
      // Determine match quality based on how well the TDEE aligns
      const targetDiff = Math.abs(nutritionRecommendation.targetCalories - nutritionRecommendation.tdee);
      let qualityLabel = "Good Match";
      let qualityColor = "text-primary";
      if (targetDiff <= 300) {
        qualityLabel = "Excellent Match";
        qualityColor = "text-green-400";
      } else if (targetDiff > 500) {
        qualityLabel = "Aggressive";
        qualityColor = "text-amber-400";
      }
      
      return {
        categoryName: nutritionRecommendation.recommendedCategory,
        categoryId: nutritionCategoryMatch?.id || null,
        tdee: nutritionRecommendation.tdee,
        targetCalories: nutritionRecommendation.targetCalories,
        qualityLabel,
        qualityColor,
        icon: Utensils,
        subtitle: `TDEE: ${nutritionRecommendation.tdee} cal → Target: ${nutritionRecommendation.targetCalories} cal`,
      };
    }
    
    return null;
  }, [type, workoutRecommendation, nutritionRecommendation, nutritionCategoryMatch]);

  if (!displayInfo) return null;

  const Icon = displayInfo.icon;
  const clientName = client.first_name || client.email?.split("@")[0] || "Client";
  const initials = clientName.slice(0, 2).toUpperCase();

  return (
    <div className="mb-4 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {/* Client Avatar */}
        <Avatar className="h-10 w-10 border border-purple-500/50">
          <AvatarImage src={client.avatar_url || undefined} />
          <AvatarFallback className="bg-purple-500/20 text-purple-400 text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Recommendation Info */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium">
              Recommended for {clientName}:
            </span>
            <span className="font-semibold text-purple-400">
              {displayInfo.categoryName}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={displayInfo.qualityColor}>{displayInfo.qualityLabel}</span>
            <span>•</span>
            <span>{displayInfo.subtitle}</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Button
        variant="outline"
        size="sm"
        className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
        onClick={() => onViewRecommended(displayInfo.categoryId)}
      >
        <Icon className="w-4 h-4 mr-2" />
        View Recommended
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
