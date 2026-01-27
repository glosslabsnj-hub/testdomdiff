import { useState } from "react";
import {
  Dumbbell,
  Utensils,
  Check,
  Loader2,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Eye,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useProgramTemplates,
  useTemplateCategories,
  useAssignTemplate,
} from "@/hooks/useProgramTemplates";
import {
  useNutritionTemplates,
  useNutritionTemplateCategories,
  useAssignNutritionTemplate,
} from "@/hooks/useNutritionTemplates";
import { useTemplateSuggestion } from "@/hooks/useTemplateSuggestion";
import { useNutritionTemplateSuggestion } from "@/hooks/useNutritionSuggestion";
import { useWorkoutTemplateSuggestion } from "@/hooks/useWorkoutSuggestion";
import type { ClientWithSubscription } from "@/hooks/useClientAnalytics";

interface ClientProgramsTabProps {
  client: ClientWithSubscription;
  onTemplateAssigned?: () => void;
  onBrowseWorkouts?: () => void;
  onBrowseNutrition?: () => void;
}

export default function ClientProgramsTab({
  client,
  onTemplateAssigned,
  onBrowseWorkouts,
  onBrowseNutrition,
}: ClientProgramsTabProps) {
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
          template:meal_plan_templates(id, name, calorie_range_min, calorie_range_max, daily_protein_g)
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
  const { recommendedCategory: categoryRecommendation } = useTemplateSuggestion(
    workoutCategories,
    clientWorkoutProfile
  );
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

  const hasWorkoutAssigned = !!workoutAssignment?.template;
  const hasNutritionAssigned = !!nutritionAssignment?.template;

  return (
    <div className="space-y-6">
      {/* Quick Actions Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Program Assignments</h3>
          <p className="text-sm text-muted-foreground">
            Assign training & nutrition programs to {client.first_name || "this client"}
          </p>
        </div>
      </div>

      <Tabs defaultValue="workout" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="workout" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            Training
            {hasWorkoutAssigned && <Check className="h-3 w-3 text-success" />}
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Nutrition
            {hasNutritionAssigned && <Check className="h-3 w-3 text-success" />}
          </TabsTrigger>
        </TabsList>

        {/* WORKOUT TAB */}
        <TabsContent value="workout" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : hasWorkoutAssigned ? (
            /* Assigned State */
            <Card className="border-success/30 bg-success/5">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                    <Check className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-success font-medium uppercase tracking-wide">
                      Currently Assigned
                    </p>
                    <p className="font-semibold text-lg">
                      {workoutAssignment.template.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">
                    {workoutAssignment.template.days_per_week || 4} days/week
                  </Badge>
                  <Badge variant="outline">
                    {workoutAssignment.template.difficulty || "Standard"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={onBrowseWorkouts}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Change Program
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Unassigned State - Show AI Recommendation */
            <div className="space-y-4">
              {workoutRecommendation ? (
                <Card className="border-primary/40 bg-gradient-to-br from-primary/10 to-transparent">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                          <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-primary font-semibold uppercase tracking-wide">
                              AI Recommended
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {workoutRecommendation.score}% Match
                            </Badge>
                          </div>
                          <p className="font-bold text-lg">
                            {workoutRecommendation.template.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">
                        {workoutRecommendation.template.days_per_week || 4} days/week
                      </Badge>
                      <Badge variant="outline">
                        {workoutRecommendation.template.difficulty || "Standard"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4 text-xs text-muted-foreground">
                      {workoutRecommendation.reasons.slice(0, 3).map((reason, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <Check className="h-3 w-3 text-primary" />
                          {reason}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 pt-2 border-t border-border">
                      <Button
                        onClick={handleAssignWorkout}
                        disabled={assigningWorkout}
                        className="flex-1"
                        size="lg"
                      >
                        {assigningWorkout ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Assign This Program
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="lg" onClick={onBrowseWorkouts}>
                        <Search className="h-4 w-4 mr-2" />
                        Browse All
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center">
                    <Dumbbell className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">
                      No AI recommendation available. Browse templates to assign manually.
                    </p>
                    <Button onClick={onBrowseWorkouts}>
                      <Search className="h-4 w-4 mr-2" />
                      Browse Workout Templates
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* NUTRITION TAB */}
        <TabsContent value="nutrition" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : hasNutritionAssigned ? (
            /* Assigned State */
            <Card className="border-success/30 bg-success/5">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                    <Check className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-success font-medium uppercase tracking-wide">
                      Currently Assigned
                    </p>
                    <p className="font-semibold text-lg">
                      {nutritionAssignment.template.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">
                    {nutritionAssignment.template.calorie_range_min}-
                    {nutritionAssignment.template.calorie_range_max} cal
                  </Badge>
                  {nutritionAssignment.template.daily_protein_g && (
                    <Badge variant="outline">
                      {nutritionAssignment.template.daily_protein_g}g protein
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={onBrowseNutrition}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Change Plan
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Unassigned State - Show AI Recommendation */
            <div className="space-y-4">
              {nutritionRecommendation ? (
                <Card className="border-accent/40 bg-gradient-to-br from-accent/10 to-transparent">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                          <Sparkles className="h-6 w-6 text-accent" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-accent font-semibold uppercase tracking-wide">
                              AI Recommended
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {nutritionRecommendation.score}% Match
                            </Badge>
                          </div>
                          <p className="font-bold text-lg">
                            {nutritionRecommendation.template.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">
                        {nutritionRecommendation.template.calorie_range_min}-
                        {nutritionRecommendation.template.calorie_range_max} cal
                      </Badge>
                      <Badge variant="outline">
                        {nutritionRecommendation.template.daily_protein_g}g protein
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-3 mb-4 text-sm text-muted-foreground">
                      <span>
                        TDEE: <strong>{nutritionRecommendation.tdee}</strong> cal
                      </span>
                      <ChevronRight className="h-4 w-4" />
                      <span>
                        Target: <strong>{nutritionRecommendation.targetCalories}</strong> cal
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-2 border-t border-border">
                      <Button
                        onClick={handleAssignNutrition}
                        disabled={assigningNutrition}
                        className="flex-1"
                        variant="gold"
                        size="lg"
                      >
                        {assigningNutrition ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Assign This Plan
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="lg" onClick={onBrowseNutrition}>
                        <Search className="h-4 w-4 mr-2" />
                        Browse All
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center">
                    <Utensils className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">
                      No AI recommendation available. Browse templates to assign manually.
                    </p>
                    <Button onClick={onBrowseNutrition}>
                      <Search className="h-4 w-4 mr-2" />
                      Browse Nutrition Templates
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground text-center">
        Assigned programs sync automatically to the client's dashboard
      </p>
    </div>
  );
}
