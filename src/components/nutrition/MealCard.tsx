import { useState } from "react";
import { 
  Flame, Beef, Wheat, Droplet, Clock, Users, 
  ChevronDown, ChevronUp, Heart, SkipForward, 
  Check, RefreshCw, Star
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
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={hasLiked ? "default" : "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(onLike!, "like");
                }}
                disabled={actionLoading !== null}
                className={hasLiked ? "bg-red-500 hover:bg-red-600" : ""}
              >
                <Heart className={`h-4 w-4 mr-1 ${hasLiked ? "fill-current" : ""}`} />
                {hasLiked ? "Liked" : "Like"}
              </Button>
              
              <Button
                variant={hasMade ? "default" : "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(onMade!, "made");
                }}
                disabled={actionLoading !== null}
                className={hasMade ? "bg-green-600 hover:bg-green-700" : ""}
              >
                <Check className="h-4 w-4 mr-1" />
                {hasMade ? "Made It!" : "Made It"}
              </Button>
              
              <Button
                variant={hasSkipped ? "secondary" : "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(onSkip!, "skip");
                }}
                disabled={actionLoading !== null}
              >
                <SkipForward className="h-4 w-4 mr-1" />
                {hasSkipped ? "Skipped" : "Skip"}
              </Button>

              {onSwap && !isSwapped && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSwap();
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Swap Meal
                </Button>
              )}

              {isSwapped && onRevert && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction(onRevert, "revert");
                  }}
                  disabled={actionLoading !== null}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Revert to Original
                </Button>
              )}
            </div>

            {/* Prep Info */}
            <div className="flex flex-wrap gap-4 text-sm">
              {meal.prep_time_min > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Prep: {meal.prep_time_min} min</span>
                </div>
              )}
              {meal.cook_time_min > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Cook: {meal.cook_time_min} min</span>
                </div>
              )}
              {meal.servings > 1 && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Servings: {meal.servings}</span>
                </div>
              )}
            </div>

            {/* Ingredients */}
            {meal.ingredients.length > 0 && (
              <div>
                <h5 className="font-medium text-foreground mb-2">Ingredients</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {meal.ingredients.map((ing, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-2 p-2 rounded bg-charcoal border border-border text-sm"
                    >
                      <span className="font-medium text-primary">{ing.amount}</span>
                      <span>{ing.item}</span>
                      {ing.notes && (
                        <span className="text-muted-foreground">({ing.notes})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            {meal.instructions && (
              <div>
                <h5 className="font-medium text-foreground mb-2">Instructions</h5>
                <div className="text-sm text-muted-foreground whitespace-pre-line">
                  {meal.instructions}
                </div>
              </div>
            )}

            {/* Notes */}
            {meal.notes && (
              <div className="p-3 rounded bg-primary/10 border border-primary/20">
                <p className="text-sm text-foreground">
                  <span className="font-medium">💡 Tip:</span> {meal.notes}
                </p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
