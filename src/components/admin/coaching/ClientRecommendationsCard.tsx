import { useState } from "react";
import { Dumbbell, Utensils, Sparkles, Eye, Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useProgramTemplates, useTemplateCategories } from "@/hooks/useProgramTemplates";
import { useNutritionTemplates, useNutritionTemplateCategories } from "@/hooks/useNutritionTemplates";
import { useTemplateSuggestion } from "@/hooks/useTemplateSuggestion";
import { useNutritionTemplateSuggestion } from "@/hooks/useNutritionSuggestion";
import type { ClientWithSubscription } from "@/hooks/useClientAnalytics";

interface ClientRecommendationsCardProps {
  client: ClientWithSubscription;
  onViewWorkout?: (templateId: string) => void;
  onViewNutrition?: (templateId: string) => void;
  onTemplateAssigned?: () => void;
}

export default function ClientRecommendationsCard({
  client,
  onViewWorkout,
  onViewNutrition,
  onTemplateAssigned,
}: ClientRecommendationsCardProps) {
  const [assigningWorkout, setAssigningWorkout] = useState(false);
  const [assigningNutrition, setAssigningNutrition] = useState(false);

  // Fetch client's intake profile
  const { data: intakeProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["client-intake-profile", client.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("experience, body_fat_estimate, activity_level, training_days_per_week, injuries, goal, goal_type, weight, height, age, dietary_restrictions")
        .eq("user_id", client.user_id)
        .single();
      if (error) return null;
      return data;
    },
  });

  // Get template categories and templates
  const { data: workoutCategories, isLoading: categoriesLoading } = useTemplateCategories();
  const { data: workoutTemplates, isLoading: templatesLoading } = useProgramTemplates();
  const { data: nutritionCategories, isLoading: nutritionCategoriesLoading } = useNutritionTemplateCategories();
  const { data: nutritionTemplates, isLoading: nutritionTemplatesLoading } = useNutritionTemplates();

  // Get template suggestions
  const { recommendedCategory, scoredCategories } = useTemplateSuggestion(workoutCategories, intakeProfile);
  const { recommendation: nutritionRecommendation } = useNutritionTemplateSuggestion(
    nutritionTemplates,
    nutritionCategories,
    intakeProfile
  );

  // Find best matching workout template in recommended category
  const matchedWorkout = recommendedCategory && workoutTemplates
    ? workoutTemplates.find(t => t.category_id === recommendedCategory.category.id)
    : null;

  // Assign workout template
  const handleAssignWorkout = async () => {
    if (!matchedWorkout) return;
    
    setAssigningWorkout(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("client_template_assignments")
        .upsert({
          client_id: client.user_id,
          template_id: matchedWorkout.id,
          match_score: recommendedCategory?.score || 0,
          assigned_by: user?.id,
        }, { onConflict: 'client_id' });

      if (error) throw error;

      toast.success("Workout template assigned successfully");
      onTemplateAssigned?.();
    } catch (error) {
      console.error("Error assigning workout:", error);
      toast.error("Failed to assign workout template");
    } finally {
      setAssigningWorkout(false);
    }
  };

  // Assign nutrition template
  const handleAssignNutrition = async () => {
    if (!nutritionRecommendation?.template) return;
    
    setAssigningNutrition(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("client_nutrition_assignments")
        .upsert({
          client_id: client.user_id,
          template_id: nutritionRecommendation.template.id,
          assigned_by: user?.id,
        }, { onConflict: 'client_id' });

      if (error) throw error;

      toast.success("Nutrition template assigned successfully");
      onTemplateAssigned?.();
    } catch (error) {
      console.error("Error assigning nutrition:", error);
      toast.error("Failed to assign nutrition template");
    } finally {
      setAssigningNutrition(false);
    }
  };

  const isLoading = profileLoading || categoriesLoading || templatesLoading || 
                    nutritionCategoriesLoading || nutritionTemplatesLoading;

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/20">
        <CardContent className="py-6 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-purple-400 mr-2" />
          <span className="text-sm text-muted-foreground">Analyzing best matches...</span>
        </CardContent>
      </Card>
    );
  }

  if (!matchedWorkout && !nutritionRecommendation?.template) {
    return (
      <Card className="bg-muted/30 border-border">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            Complete client intake to get template recommendations
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-400" />
          Recommended Templates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Workout Recommendation */}
        {matchedWorkout && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-charcoal border border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Dumbbell className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium">{matchedWorkout.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {matchedWorkout.days_per_week || 4} days/week
                  </span>
                  {recommendedCategory?.score && (
                    <Badge variant="outline" className="text-xs h-5 text-green-400 border-green-400/30">
                      {Math.round(recommendedCategory.score)}% match
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => onViewWorkout?.(matchedWorkout.id)}
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                View
              </Button>
              <Button
                variant="goldOutline"
                size="sm"
                className="h-8"
                onClick={handleAssignWorkout}
                disabled={assigningWorkout}
              >
                {assigningWorkout ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Assign
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Nutrition Recommendation */}
        {nutritionRecommendation?.template && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-charcoal border border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Utensils className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium">{nutritionRecommendation.template.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {nutritionRecommendation.template.calorie_range_min}-{nutritionRecommendation.template.calorie_range_max} cal
                  </span>
                  {nutritionRecommendation.score && (
                    <Badge variant="outline" className="text-xs h-5 text-green-400 border-green-400/30">
                      {Math.round(nutritionRecommendation.score)}% match
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => onViewNutrition?.(nutritionRecommendation.template.id)}
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                View
              </Button>
              <Button
                variant="goldOutline"
                size="sm"
                className="h-8"
                onClick={handleAssignNutrition}
                disabled={assigningNutrition}
              >
                {assigningNutrition ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Assign
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
