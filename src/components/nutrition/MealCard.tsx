import { useState } from "react";
import {
  Flame, Beef, Wheat, Droplet, Clock, Users,
  ChevronDown, ChevronUp, Heart, SkipForward,
  Check, RefreshCw, Star, Lightbulb, ChefHat, ShoppingCart as ShoppingCartIcon
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import type { MealPlanMeal } from "@/hooks/useMealPlanAssignment";

const MEAL_TYPE_ICONS: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snack: "🍎"
};

interface MealCardProps {
  meal: MealPlanMeal;
  isExpanded: boolean;
  onToggle: () => void;
  userFeedback?: { type: string }[];
  onLike?: () => Promise<unknown>;
  onSkip?: () => Promise<unknown>;
  onMade?: () => Promise<unknown>;
  onSwap?: () => void;
  isSwapped?: boolean;
  onRevert?: () => Promise<unknown>;
}

export function MealCard({ 
  meal, 
  isExpanded, 
  onToggle,
  userFeedback = [],
  onLike,
  onSkip,
  onMade,
  onSwap,
  isSwapped,
  onRevert
}: MealCardProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const hasLiked = userFeedback.some(f => f.type === "like");
  const hasSkipped = userFeedback.some(f => f.type === "skip");
  const hasMade = userFeedback.some(f => f.type === "made");

  const handleAction = async (action: (() => Promise<unknown>) | undefined, actionType: string) => {
    if (!action) return;
    setActionLoading(actionType);
    try {
      await action();
      const messages: Record<string, string> = {
        like: "Added to favorites! 💪",
        skip: "Meal marked as skipped",
        made: "Nice work making this meal! 🔥",
        revert: "Reverted to original meal"
      };
      toast.success(messages[actionType] || "Action completed");
    } catch (e) {
      toast.error("Failed to save feedback");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Card className={`bg-card border-border overflow-hidden ${isSwapped ? 'ring-2 ring-primary/50' : ''}`}>
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <div className="p-4 cursor-pointer hover:bg-muted/20 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{MEAL_TYPE_ICONS[meal.meal_type]}</span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {meal.meal_type}
                  </Badge>
                  {isSwapped && (
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                      Swapped
                    </Badge>
                  )}
                </div>
                <h4 className="font-semibold text-foreground">{meal.meal_name}</h4>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    {meal.calories} cal
                  </span>
                  <span className="flex items-center gap-1">
                    <Beef className="h-3 w-3 text-red-500" />
                    {meal.protein_g}g
                  </span>
                  <span className="flex items-center gap-1">
                    <Wheat className="h-3 w-3 text-amber-500" />
                    {meal.carbs_g}g
                  </span>
                  <span className="flex items-center gap-1">
                    <Droplet className="h-3 w-3 text-blue-500" />
                    {meal.fats_g}g
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                {(meal.prep_time_min > 0 || meal.cook_time_min > 0) && (
                  <span className="text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {meal.prep_time_min + meal.cook_time_min} min
                  </span>
                )}
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
            {/* Tip / Coach Notes — shown first for visibility */}
            {meal.notes && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-foreground flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span><span className="font-semibold text-primary">Tip:</span> {meal.notes}</span>
                </p>
              </div>
            )}

            {/* Prep & Cook Time Visual */}
            {(meal.prep_time_min > 0 || meal.cook_time_min > 0 || meal.servings > 1) && (
              <div className="grid grid-cols-3 gap-2">
                {meal.prep_time_min > 0 && (
                  <div className="text-center p-2.5 rounded-lg bg-charcoal border border-border">
                    <Clock className="h-4 w-4 mx-auto mb-1 text-blue-400" />
                    <p className="text-sm font-bold">{meal.prep_time_min} min</p>
                    <p className="text-[10px] text-muted-foreground">Prep</p>
                  </div>
                )}
                {meal.cook_time_min > 0 && (
                  <div className="text-center p-2.5 rounded-lg bg-charcoal border border-border">
                    <Flame className="h-4 w-4 mx-auto mb-1 text-orange-400" />
                    <p className="text-sm font-bold">{meal.cook_time_min} min</p>
                    <p className="text-[10px] text-muted-foreground">Cook</p>
                  </div>
                )}
                {meal.servings > 0 && (
                  <div className="text-center p-2.5 rounded-lg bg-charcoal border border-border">
                    <Users className="h-4 w-4 mx-auto mb-1 text-green-400" />
                    <p className="text-sm font-bold">{meal.servings}</p>
                    <p className="text-[10px] text-muted-foreground">{meal.servings === 1 ? "Serving" : "Servings"}</p>
                  </div>
                )}
              </div>
            )}

            {/* Ingredients */}
            {meal.ingredients.length > 0 && (
              <div>
                <h5 className="font-medium text-foreground mb-2 text-sm flex items-center gap-1.5">
                  <ShoppingCartIcon className="h-4 w-4 text-primary" />
                  Ingredients
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {meal.ingredients.map((ing, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded bg-charcoal border border-border text-sm"
                    >
                      <span className="font-medium text-primary min-w-fit">{ing.amount}</span>
                      <span className="flex-1">{ing.item}</span>
                      {ing.notes && (
                        <span className="text-xs text-muted-foreground italic">({ing.notes})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step-by-Step Instructions */}
            {meal.instructions && (
              <div>
                <h5 className="font-medium text-foreground mb-2 text-sm flex items-center gap-1.5">
                  <ChefHat className="h-4 w-4 text-primary" />
                  Step-by-Step Instructions
                </h5>
                <div className="space-y-2">
                  {meal.instructions.split('\n').filter(l => l.trim()).map((step, i) => {
                    // Strip existing numbering like "1.", "1)", "Step 1:" etc.
                    const cleaned = step.replace(/^\s*(?:step\s*)?\d+[.):\-]\s*/i, '').trim();
                    return (
                      <div key={i} className="flex items-start gap-2.5 text-sm">
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-muted-foreground pt-0.5">{cleaned}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
              <Button
                variant={hasMade ? "default" : "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(onMade!, "made");
                }}
                disabled={actionLoading !== null}
                className={`min-h-[44px] ${hasMade ? "bg-green-600 hover:bg-green-700" : ""}`}
              >
                <Check className="h-4 w-4 mr-1" />
                {hasMade ? "Made It!" : "I Made This"}
              </Button>

              <Button
                variant={hasLiked ? "default" : "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(onLike!, "like");
                }}
                disabled={actionLoading !== null}
                className={`min-h-[44px] ${hasLiked ? "bg-red-500 hover:bg-red-600" : ""}`}
              >
                <Heart className={`h-4 w-4 mr-1 ${hasLiked ? "fill-current" : ""}`} />
                {hasLiked ? "Liked" : "Like"}
              </Button>

              {onSwap && !isSwapped && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSwap();
                  }}
                  className="min-h-[44px]"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Swap Meal
                </Button>
              )}

              <Button
                variant={hasSkipped ? "secondary" : "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(onSkip!, "skip");
                }}
                disabled={actionLoading !== null}
                className="min-h-[44px]"
              >
                <SkipForward className="h-4 w-4 mr-1" />
                {hasSkipped ? "Skipped" : "Skip"}
              </Button>

              {isSwapped && onRevert && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction(onRevert, "revert");
                  }}
                  disabled={actionLoading !== null}
                  className="min-h-[44px]"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Revert to Original
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
