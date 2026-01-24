import { useState, useMemo } from "react";
import { Flame, Beef, Wheat, Droplet, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import type { MealPlanMeal } from "@/hooks/useMealPlanAssignment";

interface MealSwapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMeal: MealPlanMeal;
  availableMeals: MealPlanMeal[];
  onSwap: (newMealId: string) => Promise<void>;
  targetCalories: number;
  targetProtein: number;
}

export function MealSwapDialog({
  open,
  onOpenChange,
  currentMeal,
  availableMeals,
  onSwap,
  targetCalories,
  targetProtein
}: MealSwapDialogProps) {
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [swapping, setSwapping] = useState(false);

  // Filter to same meal type and similar macros
  const compatibleMeals = useMemo(() => {
    return availableMeals
      .filter(meal => 
        meal.meal_type === currentMeal.meal_type && 
        meal.id !== currentMeal.id
      )
      .map(meal => ({
        ...meal,
        calorieDiff: Math.abs(meal.calories - currentMeal.calories),
        proteinDiff: Math.abs(meal.protein_g - currentMeal.protein_g),
        withinRange: 
          Math.abs(meal.calories - currentMeal.calories) <= 100 &&
          Math.abs(meal.protein_g - currentMeal.protein_g) <= 10
      }))
      .sort((a, b) => {
        // Sort by compatibility (within range first, then by calorie difference)
        if (a.withinRange && !b.withinRange) return -1;
        if (!a.withinRange && b.withinRange) return 1;
        return a.calorieDiff - b.calorieDiff;
      });
  }, [availableMeals, currentMeal]);

  const handleSwap = async () => {
    if (!selectedMealId) return;
    
    setSwapping(true);
    try {
      await onSwap(selectedMealId);
      toast.success("Meal swapped successfully!");
      onOpenChange(false);
    } catch (e) {
      toast.error("Failed to swap meal");
    } finally {
      setSwapping(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Swap Meal</DialogTitle>
          <DialogDescription>
            Choose a replacement for <strong>{currentMeal.meal_name}</strong>. 
            Meals with similar calories and protein are shown first.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 p-3 rounded bg-muted/50 border border-border">
          <p className="text-sm font-medium mb-1">Current Meal</p>
          <p className="text-foreground">{currentMeal.meal_name}</p>
          <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-500" />
              {currentMeal.calories} cal
            </span>
            <span className="flex items-center gap-1">
              <Beef className="h-3 w-3 text-red-500" />
              {currentMeal.protein_g}g protein
            </span>
          </div>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {compatibleMeals.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No compatible meals found for this meal type.
              </p>
            ) : (
              compatibleMeals.map(meal => (
                <div
                  key={meal.id}
                  onClick={() => setSelectedMealId(meal.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedMealId === meal.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">{meal.meal_name}</h4>
                        {meal.withinRange && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            Good Match
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3 text-orange-500" />
                          {meal.calories} cal
                          {meal.calorieDiff > 0 && (
                            <span className={meal.calories > currentMeal.calories ? "text-red-400" : "text-green-400"}>
                              ({meal.calories > currentMeal.calories ? "+" : "-"}{meal.calorieDiff})
                            </span>
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Beef className="h-3 w-3 text-red-500" />
                          {meal.protein_g}g
                          {meal.proteinDiff > 0 && (
                            <span className={meal.protein_g > currentMeal.protein_g ? "text-green-400" : "text-red-400"}>
                              ({meal.protein_g > currentMeal.protein_g ? "+" : "-"}{meal.proteinDiff})
                            </span>
                          )}
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
                    {selectedMealId === meal.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="gold"
            onClick={handleSwap}
            disabled={!selectedMealId || swapping}
          >
            {swapping ? "Swapping..." : "Confirm Swap"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
