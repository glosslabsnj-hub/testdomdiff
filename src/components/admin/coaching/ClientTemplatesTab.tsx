import { useState } from "react";
import { Dumbbell, Utensils, Eye, Check, Loader2, ArrowRight, Sparkles, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useProgramTemplates, useTemplateCategories, useAssignTemplate } from "@/hooks/useProgramTemplates";
import { useNutritionTemplates, useNutritionTemplateCategories, useAssignNutritionTemplate } from "@/hooks/useNutritionTemplates";
import { useTemplateSuggestion, getMatchQuality } from "@/hooks/useTemplateSuggestion";
import { useNutritionTemplateSuggestion, getNutritionMatchQuality } from "@/hooks/useNutritionSuggestion";
import { useWorkoutTemplateSuggestion, getWorkoutMatchQuality } from "@/hooks/useWorkoutSuggestion";
import type { ClientWithSubscription } from "@/hooks/useClientAnalytics";

interface ClientTemplatesTabProps {
  client: ClientWithSubscription;
  onTemplateAssigned?: () => void;
  onBrowseWorkouts?: () => void;
  onBrowseNutrition?: () => void;
}

export default function ClientTemplatesTab({
  client,
  onTemplateAssigned,
  onBrowseWorkouts,
  onBrowseNutrition,
}: ClientTemplatesTabProps) {
  const queryClient = useQueryClient();
  const [assigningWorkout, setAssigningWorkout] = useState(false);
  const [assigningNutrition, setAssigningNutrition] = useState(false);

  // Fetch current assignments
  const { data: workoutAssignment, isLoading: loadingWorkoutAssignment } = useQuery({
    queryKey: ["client-workout-assignment", client.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_template_assignments")
        .select(`
          *,
          template:program_templates(id, name, days_per_week, difficulty)
        `)
        .eq("client_id", client.user_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: nutritionAssignment, isLoading: loadingNutritionAssignment } = useQuery({
    queryKey: ["client-nutrition-assignment", client.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_nutrition_assignments")
        .select(`
          *,
          template:meal_plan_templates(id, name, calorie_range_min, calorie_range_max)
        `)
        .eq("client_id", client.user_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Get template categories and templates for recommendations
  const { data: workoutCategories } = useTemplateCategories();
  const { data: workoutTemplates } = useProgramTemplates();
  const { data: nutritionCategories } = useNutritionTemplateCategories();
  const { data: nutritionTemplates } = useNutritionTemplates();

  // Client profile for workout suggestion
  const clientWorkoutProfile = {
    experience: client.experience,
    body_fat_estimate: client.body_fat_estimate,
    activity_level: client.activity_level,
    training_days_per_week: client.training_days_per_week,
    injuries: client.injuries,
    goal: client.goal,
    equipment: client.equipment,
    training_style: client.training_style,
    session_length_preference: client.session_length_preference,
  };

  // Client profile for nutrition suggestion
  const clientNutritionProfile = {
    goal: client.goal,
    goal_type: client.goal_type,
    activity_level: client.activity_level,
    weight: client.weight,
    height: client.height,
    age: client.age,
    dietary_restrictions: client.dietary_restrictions,
    meal_prep_preference: client.meal_prep_preference,
  };

  // Get recommendations
  const { recommendedCategory: categoryRecommendation } = useTemplateSuggestion(workoutCategories, clientWorkoutProfile);
  const { recommendation: workoutRecommendation } = useWorkoutTemplateSuggestion(
    workoutTemplates,
    workoutCategories,
    categoryRecommendation?.category || null,
    clientWorkoutProfile
  );
  const { recommendation: nutritionRecommendation } = useNutritionTemplateSuggestion(
    nutritionTemplates,
    nutritionCategories,
    clientNutritionProfile
  );

  const assignWorkoutMutation = useAssignTemplate();
  const assignNutritionMutation = useAssignNutritionTemplate();

  // Assign workout template
  const handleAssignWorkout = async () => {
    if (!workoutRecommendation) return;
    
    setAssigningWorkout(true);
    try {
      await assignWorkoutMutation.mutateAsync({
        clientId: client.user_id,
        templateId: workoutRecommendation.template.id,
        suggestedCategoryId: workoutRecommendation.category.id,
        matchScore: workoutRecommendation.score,
        trainingDaysPerWeek: client.training_days_per_week || 4,
      });

      queryClient.invalidateQueries({ queryKey: ["client-workout-assignment"] });
      queryClient.invalidateQueries({ queryKey: ["client-program"] });
      onTemplateAssigned?.();
    } catch (error) {
      console.error("Error assigning workout:", error);
    } finally {
      setAssigningWorkout(false);
    }
  };

  // Assign nutrition template
  const handleAssignNutrition = async () => {
    if (!nutritionRecommendation) return;
    
    setAssigningNutrition(true);
    try {
      await assignNutritionMutation.mutateAsync({
        clientId: client.user_id,
        templateId: nutritionRecommendation.template.id,
      });

      queryClient.invalidateQueries({ queryKey: ["client-nutrition-assignment"] });
      onTemplateAssigned?.();
    } catch (error) {
      console.error("Error assigning nutrition:", error);
    } finally {
      setAssigningNutrition(false);
    }
  };

  const isLoading = loadingWorkoutAssignment || loadingNutritionAssignment;

  return (
    <div className="space-y-6">
      {/* Workout Section */}
      <Card className="bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-blue-400" />
            Workout Program
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Assignment */}
          <div className="p-3 rounded-lg bg-charcoal border border-border">
            <p className="text-xs text-muted-foreground mb-1">Current Assignment</p>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : workoutAssignment?.template ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{workoutAssignment.template.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {workoutAssignment.template.days_per_week || 4} days/week
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={onBrowseWorkouts}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  Change
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">No workout program assigned</p>
            )}
          </div>

          {/* Recommendation */}
          {workoutRecommendation && !workoutAssignment?.template && (
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium">Recommended Template</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-400">{workoutRecommendation.template.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {workoutRecommendation.template.days_per_week || 4} days/week
                    </Badge>
                    <Badge className={`text-xs ${getWorkoutMatchQuality(workoutRecommendation.score).color} bg-transparent border`}>
                      {getWorkoutMatchQuality(workoutRecommendation.score).label}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 text-xs text-muted-foreground mt-2">
                    {workoutRecommendation.reasons.slice(0, 2).map((reason, i) => (
                      <span key={i}>• {reason}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                  onClick={onBrowseWorkouts}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  View All
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleAssignWorkout}
                  disabled={assigningWorkout}
                >
                  {assigningWorkout ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Assign Program
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Browse All Button when no recommendation */}
          {!workoutRecommendation && !workoutAssignment?.template && (
            <Button variant="outline" className="w-full" onClick={onBrowseWorkouts}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Browse Workout Templates
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Nutrition Section */}
      <Card className="bg-gradient-to-br from-green-500/5 to-transparent border-green-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Utensils className="h-5 w-5 text-green-400" />
            Nutrition Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Assignment */}
          <div className="p-3 rounded-lg bg-charcoal border border-border">
            <p className="text-xs text-muted-foreground mb-1">Current Assignment</p>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : nutritionAssignment?.template ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{nutritionAssignment.template.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {nutritionAssignment.template.calorie_range_min}-{nutritionAssignment.template.calorie_range_max} cal
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={onBrowseNutrition}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  Change
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">No nutrition plan assigned</p>
            )}
          </div>

          {/* Recommendation */}
          {nutritionRecommendation && !nutritionAssignment?.template && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium">Recommended Template</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-400">{nutritionRecommendation.template.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {nutritionRecommendation.template.calorie_range_min}-{nutritionRecommendation.template.calorie_range_max} cal
                    </Badge>
                    <Badge className={`text-xs ${getNutritionMatchQuality(nutritionRecommendation.score).color} bg-transparent border`}>
                      {getNutritionMatchQuality(nutritionRecommendation.score).label}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-2">
                    <span>TDEE: {nutritionRecommendation.tdee} cal</span>
                    <span>→</span>
                    <span>Target: {nutritionRecommendation.targetCalories} cal</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                  onClick={onBrowseNutrition}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  View All
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleAssignNutrition}
                  disabled={assigningNutrition}
                >
                  {assigningNutrition ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Assign Plan
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Browse All Button when no recommendation */}
          {!nutritionRecommendation && !nutritionAssignment?.template && (
            <Button variant="outline" className="w-full" onClick={onBrowseNutrition}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Browse Nutrition Templates
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
