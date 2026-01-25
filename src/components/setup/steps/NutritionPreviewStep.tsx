import { useState, useEffect } from "react";
import { Utensils, Check, Flame, Droplets, Wheat, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMealPlanAssignment } from "@/hooks/useMealPlanAssignment";
import { cn } from "@/lib/utils";

interface NutritionPreviewStepProps {
  onReady: () => void;
}

export default function NutritionPreviewStep({ onReady }: NutritionPreviewStepProps) {
  const { assignedPlan, loading } = useMealPlanAssignment();
  const [confirmed, setConfirmed] = useState(false);

  // Enable proceed when confirmed
  useEffect(() => {
    if (confirmed) {
      onReady();
    }
  }, [confirmed, onReady]);

  const handleConfirm = () => {
    setConfirmed(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Fallback macros if no plan assigned
  const macros = assignedPlan?.template ? {
    calories: `${assignedPlan.template.calorie_range_min}-${assignedPlan.template.calorie_range_max}`,
    protein: assignedPlan.template.daily_protein_g,
    carbs: assignedPlan.template.daily_carbs_g,
    fats: assignedPlan.template.daily_fats_g,
    name: assignedPlan.template.name,
    goal: assignedPlan.template.goal_type,
  } : {
    calories: "2000-2500",
    protein: 180,
    carbs: 200,
    fats: 65,
    name: "Balanced Nutrition",
    goal: "maintenance",
  };

  const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Review Your Nutrition</h2>
        <p className="text-muted-foreground">
          Based on your goals, here's your recommended meal plan.
        </p>
      </div>

      {/* Plan Overview */}
      <div className="bg-charcoal rounded-xl border border-border overflow-hidden mb-6">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Utensils className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{macros.name}</h3>
              <p className="text-sm text-muted-foreground capitalize">
                Goal: {macros.goal.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>

        {/* Macro Breakdown */}
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-background/50">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{macros.calories}</p>
            <p className="text-xs text-muted-foreground">Calories</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50">
            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-1">
              <span className="text-xs font-bold text-red-500">P</span>
            </div>
            <p className="text-lg font-bold text-foreground">{macros.protein}g</p>
            <p className="text-xs text-muted-foreground">Protein</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50">
            <Wheat className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{macros.carbs}g</p>
            <p className="text-xs text-muted-foreground">Carbs</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50">
            <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{macros.fats}g</p>
            <p className="text-xs text-muted-foreground">Fats</p>
          </div>
        </div>

        {/* Meal Structure */}
        <div className="p-4 border-t border-border">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Daily Meal Structure</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {mealTypes.map((meal, idx) => (
              <div 
                key={meal}
                className="p-3 rounded-lg bg-background/50 text-center border border-border"
              >
                <p className="font-medium text-foreground">{meal}</p>
                <p className="text-xs text-muted-foreground">
                  {idx === 3 ? "~300 cal" : `~${Math.round((parseInt(macros.calories.split("-")[1]) - 300) / 3)} cal`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation */}
      <div className="bg-charcoal rounded-xl border border-primary/30 p-6 text-center">
        <h3 className="font-semibold mb-2">
          {confirmed ? "Nutrition Plan Confirmed!" : "Ready to Follow This Plan?"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {confirmed 
            ? "You'll find meal templates and recipes in Chow Hall."
            : "You can adjust your goals and recalculate anytime."}
        </p>
        
        <Button 
          variant={confirmed ? "steel" : "gold"} 
          onClick={handleConfirm}
          className="gap-2"
          disabled={confirmed}
        >
          {confirmed ? (
            <>
              <Check className="w-4 h-4" />
              Plan Confirmed
            </>
          ) : (
            "Confirm Nutrition Plan"
          )}
        </Button>
      </div>

      {/* Why This Matters */}
      <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <h4 className="font-medium text-foreground text-sm mb-1">💡 Why This Matters</h4>
        <p className="text-sm text-muted-foreground">
          You can't out-train a bad diet. These macros are calculated based on your goals. 
          Follow the plan, fuel the machine, and watch your body transform.
        </p>
      </div>
    </div>
  );
}
