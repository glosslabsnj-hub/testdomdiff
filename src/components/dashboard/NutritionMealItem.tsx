import { useState } from "react";
import { ChevronDown, ChevronRight, Clock, Users, Flame } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import type { NutritionMealPlanMeal } from "@/hooks/useNutritionTemplates";

interface NutritionMealItemProps {
  meal: NutritionMealPlanMeal;
}

const MEAL_TYPE_COLORS: Record<string, string> = {
  breakfast: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  lunch: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  dinner: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  snack: "bg-green-500/20 text-green-400 border-green-500/30",
};

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export default function NutritionMealItem({ meal }: NutritionMealItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Parse ingredients from JSONB
  const ingredients = Array.isArray(meal.ingredients) 
    ? meal.ingredients
    : [];

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-charcoal/50">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
            
            <Badge className={`text-xs ${MEAL_TYPE_COLORS[meal.meal_type] || ""}`}>
              {MEAL_TYPE_LABELS[meal.meal_type] || meal.meal_type}
            </Badge>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{meal.meal_name}</p>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3" />
                {meal.calories}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:flex items-center gap-1">
                P{meal.protein_g}g C{meal.carbs_g}g F{meal.fats_g}g
              </span>
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="border-t border-border p-4 space-y-4">
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-3">
              {meal.prep_time_min && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Prep: {meal.prep_time_min} min
                </Badge>
              )}
              {meal.cook_time_min && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Cook: {meal.cook_time_min} min
                </Badge>
              )}
              {meal.servings && (
                <Badge variant="outline" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {meal.servings} serving{meal.servings > 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            {/* Macros Detail */}
            <div className="grid grid-cols-4 gap-2">
              <div className="p-2 rounded-lg bg-muted/30 text-center">
                <p className="text-lg font-bold text-primary">{meal.calories}</p>
                <p className="text-xs text-muted-foreground">Calories</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/30 text-center">
                <p className="text-lg font-bold text-blue-400">{meal.protein_g}g</p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/30 text-center">
                <p className="text-lg font-bold text-amber-400">{meal.carbs_g}g</p>
                <p className="text-xs text-muted-foreground">Carbs</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/30 text-center">
                <p className="text-lg font-bold text-green-400">{meal.fats_g}g</p>
                <p className="text-xs text-muted-foreground">Fat</p>
              </div>
            </div>

            {/* Ingredients */}
            {ingredients.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                  Ingredients ({ingredients.length})
                </h5>
                <ul className="space-y-1">
                  {ingredients.map((ing, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-1">•</span>
                      <span>
                        <span className="font-medium">{ing.amount}</span> {ing.item}
                        {ing.notes && (
                          <span className="text-muted-foreground"> ({ing.notes})</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructions */}
            {meal.instructions && (
              <div>
                <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                  Instructions
                </h5>
                <div className="text-sm text-muted-foreground whitespace-pre-line">
                  {meal.instructions}
                </div>
              </div>
            )}

            {/* Notes */}
            {meal.notes && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-foreground italic">{meal.notes}</p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
