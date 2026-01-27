import { useState } from "react";
import { ChevronDown, ChevronRight, Clock, Flame } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

interface SolitaryMeal {
  type: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  prepTime?: number;
  ingredients: { amount: string; item: string }[];
  instructions: string;
}

interface SolitaryMealCardProps {
  meal: SolitaryMeal;
}

const MEAL_TYPE_COLORS: Record<string, string> = {
  Breakfast: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Lunch: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Dinner: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Snack: "bg-green-500/20 text-green-400 border-green-500/30",
};

export default function SolitaryMealCard({ meal }: SolitaryMealCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-charcoal/50">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors min-h-[56px]">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            )}
            
            <Badge className={`text-xs ${MEAL_TYPE_COLORS[meal.type] || "bg-muted"}`}>
              {meal.type}
            </Badge>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{meal.name}</p>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-primary" />
                {meal.calories}
              </span>
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <span className="hidden sm:inline">{meal.protein}g protein</span>
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="border-t border-border p-4 space-y-4">
            {/* Prep Time */}
            {meal.prepTime && (
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {meal.prepTime} min prep
              </Badge>
            )}

            {/* Macros Grid */}
            <div className="grid grid-cols-4 gap-2">
              <div className="p-2 rounded-lg bg-muted/30 text-center">
                <p className="text-lg font-bold text-orange-400">{meal.calories}</p>
                <p className="text-xs text-muted-foreground">Calories</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/30 text-center">
                <p className="text-lg font-bold text-blue-400">{meal.protein}g</p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/30 text-center">
                <p className="text-lg font-bold text-amber-400">{meal.carbs}g</p>
                <p className="text-xs text-muted-foreground">Carbs</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/30 text-center">
                <p className="text-lg font-bold text-green-400">{meal.fats}g</p>
                <p className="text-xs text-muted-foreground">Fat</p>
              </div>
            </div>

            {/* Ingredients */}
            {meal.ingredients.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                  Ingredients
                </h5>
                <ul className="space-y-1">
                  {meal.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-0.5">•</span>
                      <span>
                        <span className="font-medium text-primary">{ing.amount}</span>{" "}
                        {ing.item}
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
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
