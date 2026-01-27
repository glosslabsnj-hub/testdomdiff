import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle, Flame } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NutritionMealItem from "./NutritionMealItem";
import type { NutritionMealPlanDay, NutritionMealPlanMeal } from "@/hooks/useNutritionTemplates";

interface NutritionDayCardProps {
  day: NutritionMealPlanDay;
  meals: NutritionMealPlanMeal[];
  isCompleted: boolean;
  onComplete: () => void;
}

const DAY_ABBREVIATIONS: Record<string, string> = {
  Monday: "Mo",
  Tuesday: "Tu",
  Wednesday: "We",
  Thursday: "Th",
  Friday: "Fr",
  Saturday: "Sa",
  Sunday: "Su",
};

export default function NutritionDayCard({
  day,
  meals,
  isCompleted,
  onComplete,
}: NutritionDayCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate daily totals
  const dailyTotals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein_g,
      carbs: acc.carbs + meal.carbs_g,
      fats: acc.fats + meal.fats_g,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const dayAbbr = DAY_ABBREVIATIONS[day.day_name] || day.day_name.slice(0, 2);

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-colors ${
        isCompleted
          ? "border-green-500/30 bg-green-500/5"
          : "border-border"
      }`}
    >
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted
                  ? "bg-green-500/20"
                  : "bg-green-500/10"
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  isCompleted ? "text-green-400" : "text-green-500"
                }`}
              >
                {dayAbbr}
              </span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{day.day_name}</span>
                {isCompleted && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {meals.length} meals
              </p>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="gap-1">
                <Flame className="w-3 h-3" />
                {dailyTotals.calories} cal
              </Badge>
              <Badge variant="outline">
                P{dailyTotals.protein}g
              </Badge>
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="border-t border-border p-4 space-y-4">
            {/* Daily Macro Summary */}
            <div className="grid grid-cols-4 gap-2 p-3 rounded-lg bg-muted/30">
              <div className="text-center">
                <p className="text-sm font-bold text-primary">{dailyTotals.calories}</p>
                <p className="text-xs text-muted-foreground">Calories</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-blue-400">{dailyTotals.protein}g</p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-amber-400">{dailyTotals.carbs}g</p>
                <p className="text-xs text-muted-foreground">Carbs</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-green-400">{dailyTotals.fats}g</p>
                <p className="text-xs text-muted-foreground">Fat</p>
              </div>
            </div>

            {/* Meals */}
            <div className="space-y-2">
              {meals.map((meal) => (
                <NutritionMealItem key={meal.id} meal={meal} />
              ))}
            </div>

            {/* Complete Button */}
            <Button
              variant={isCompleted ? "outline" : "default"}
              className={`w-full ${
                isCompleted
                  ? "border-green-500/50 text-green-400 hover:bg-green-500/10"
                  : "bg-green-600 hover:bg-green-700"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onComplete();
              }}
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Day Followed — Tap to Undo
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Day Complete
                </>
              )}
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
