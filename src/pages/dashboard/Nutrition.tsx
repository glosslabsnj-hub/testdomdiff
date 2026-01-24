import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Loader2, ChefHat, Flame, Beef, Wheat, Droplet, 
  ShoppingCart, Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMealPlanAssignment } from "@/hooks/useMealPlanAssignment";
import { useMealFeedback } from "@/hooks/useMealFeedback";
import { useAuth } from "@/contexts/AuthContext";
import UpgradePrompt from "@/components/UpgradePrompt";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import { MealCard } from "@/components/nutrition/MealCard";
import { MealSwapDialog } from "@/components/nutrition/MealSwapDialog";
import type { MealPlanMeal } from "@/hooks/useMealPlanAssignment";

const MEAL_TYPE_ORDER = ["breakfast", "lunch", "dinner", "snack"] as const;

const Nutrition = () => {
  const { assignedPlan, userCalories, loading } = useMealPlanAssignment();
  const { subscription, profile } = useAuth();
  const { 
    addFeedback, 
    removeFeedback, 
    getMealFeedback, 
    createSwap, 
    removeSwap, 
    getActiveSwap,
    swaps 
  } = useMealFeedback();
  
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());
  const [selectedDay, setSelectedDay] = useState("1");
  const [swapDialogOpen, setSwapDialogOpen] = useState(false);
  const [mealToSwap, setMealToSwap] = useState<MealPlanMeal | null>(null);

  // Only transformation and coaching users can access
  if (subscription?.plan_type === "membership") {
    return <UpgradePrompt feature="Nutrition Templates" upgradeTo="transformation" />;
  }

  const toggleMealExpanded = (mealId: string) => {
    setExpandedMeals(prev => {
      const next = new Set(prev);
      if (next.has(mealId)) {
        next.delete(mealId);
      } else {
        next.add(mealId);
      }
      return next;
    });
  };

  // Get all meals from the plan for swap options
  const allMeals = useMemo(() => {
    if (!assignedPlan) return [];
    return assignedPlan.days.flatMap(day => day.meals);
  }, [assignedPlan]);

  // Generate shopping list from all meals in the week
  const generateShoppingList = () => {
    if (!assignedPlan) return [];
    
    const ingredientMap = new Map<string, { amount: string; notes?: string }>();
    
    assignedPlan.days.forEach(day => {
      day.meals.forEach(meal => {
        meal.ingredients.forEach(ing => {
          const key = ing.item.toLowerCase();
          if (!ingredientMap.has(key)) {
            ingredientMap.set(key, { amount: ing.amount, notes: ing.notes });
          }
        });
      });
    });
    
    return Array.from(ingredientMap.entries()).map(([item, details]) => ({
      item: item.charAt(0).toUpperCase() + item.slice(1),
      ...details
    }));
  };

  // Handle opening swap dialog
  const handleOpenSwap = (meal: MealPlanMeal) => {
    setMealToSwap(meal);
    setSwapDialogOpen(true);
  };

  // Handle swap confirmation
  const handleSwap = async (newMealId: string) => {
    if (!mealToSwap) return;
    const dayNumber = parseInt(selectedDay);
    await createSwap(mealToSwap.id, newMealId, dayNumber);
  };

  // Handle revert swap
  const handleRevert = async (originalMealId: string) => {
    const swap = getActiveSwap(originalMealId);
    if (swap) {
      await removeSwap(swap.id);
    }
  };

  // Get the effective meal (swapped or original)
  const getEffectiveMeal = (originalMeal: MealPlanMeal): { meal: MealPlanMeal; isSwapped: boolean } => {
    const swap = getActiveSwap(originalMeal.id);
    if (swap) {
      const swappedMeal = allMeals.find(m => m.id === swap.swapped_meal_id);
      if (swappedMeal) {
        return { meal: swappedMeal, isSwapped: true };
      }
    }
    return { meal: originalMeal, isSwapped: false };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentDay = assignedPlan?.days.find(d => d.day_number.toString() === selectedDay);
  const sortedMeals = currentDay?.meals.sort((a, b) => 
    MEAL_TYPE_ORDER.indexOf(a.meal_type) - MEAL_TYPE_ORDER.indexOf(b.meal_type)
  ) || [];

  // Calculate daily totals (using effective meals)
  const dailyTotals = sortedMeals.reduce(
    (acc, originalMeal) => {
      const { meal } = getEffectiveMeal(originalMeal);
      return {
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein_g,
        carbs: acc.carbs + meal.carbs_g,
        fats: acc.fats + meal.fats_g
      };
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader />
      <main className="flex-1 section-container py-8 pt-24">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="headline-section mb-2">
            Your <span className="text-primary">Meal Plan</span>
          </h1>
          <p className="text-muted-foreground">
            Personalized nutrition based on your goal and body composition.
          </p>
        </div>

        {/* User Stats Card */}
        {userCalories && (
          <Card className="bg-charcoal border-border mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-primary" />
                Your Daily Targets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-background border border-border">
                  <Flame className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-2xl font-bold text-foreground">{userCalories.targetCalories}</p>
                  <p className="text-xs text-muted-foreground">Daily Calories</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-background border border-border">
                  <Beef className="h-6 w-6 mx-auto mb-2 text-red-500" />
                  <p className="text-2xl font-bold text-foreground">{userCalories.protein}g</p>
                  <p className="text-xs text-muted-foreground">Protein</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-background border border-border">
                  <Wheat className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                  <p className="text-2xl font-bold text-foreground">{userCalories.carbs}g</p>
                  <p className="text-xs text-muted-foreground">Carbs</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-background border border-border">
                  <Droplet className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold text-foreground">{userCalories.fats}g</p>
                  <p className="text-xs text-muted-foreground">Fats</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Based on your goal: {profile?.goal || "Recomposition"} | 
                BMR: {userCalories.bmr} | TDEE: {userCalories.tdee}
              </p>
            </CardContent>
          </Card>
        )}

        {!assignedPlan || assignedPlan.days.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <ChefHat className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Meal Plan Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                Your personalized meal plan is being prepared based on your goals and body composition.
              </p>
              <p className="text-sm text-muted-foreground">
                In the meantime, focus on eating whole foods with a protein source at every meal.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Assigned Template Info */}
            <Card className="bg-card border-primary/30 mb-6">
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <Badge className="bg-primary/20 text-primary border-primary/30 mb-2">
                      {assignedPlan.template.name}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {assignedPlan.template.calorie_range_min}-{assignedPlan.template.calorie_range_max} cal/day | 
                      P: {assignedPlan.template.daily_protein_g}g C: {assignedPlan.template.daily_carbs_g}g F: {assignedPlan.template.daily_fats_g}g
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print Plan
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Day Tabs */}
            <Tabs value={selectedDay} onValueChange={setSelectedDay} className="mb-8">
              <TabsList className="grid grid-cols-7 bg-charcoal border border-border">
                {assignedPlan.days.map(day => (
                  <TabsTrigger 
                    key={day.id} 
                    value={day.day_number.toString()}
                    className="text-xs sm:text-sm"
                  >
                    {day.day_name.slice(0, 3)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {assignedPlan.days.map(day => (
                <TabsContent key={day.id} value={day.day_number.toString()} className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{day.day_name}</h3>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <span>{dailyTotals.calories} cal</span>
                      <span>•</span>
                      <span>{dailyTotals.protein}g P</span>
                    </div>
                  </div>

                  {sortedMeals.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No meals added for this day yet.
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {sortedMeals.map(originalMeal => {
                        const { meal, isSwapped } = getEffectiveMeal(originalMeal);
                        const feedback = getMealFeedback(meal.id);
                        
                        return (
                          <MealCard 
                            key={originalMeal.id} 
                            meal={meal} 
                            isExpanded={expandedMeals.has(meal.id)}
                            onToggle={() => toggleMealExpanded(meal.id)}
                            userFeedback={feedback.map(f => ({ type: f.feedback_type }))}
                            onLike={() => addFeedback(meal.id, "like")}
                            onSkip={() => addFeedback(meal.id, "skip")}
                            onMade={() => addFeedback(meal.id, "made")}
                            onSwap={() => handleOpenSwap(originalMeal)}
                            isSwapped={isSwapped}
                            onRevert={isSwapped ? () => handleRevert(originalMeal.id) : undefined}
                          />
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>

            {/* Shopping List */}
            <Card className="bg-charcoal border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Weekly Shopping List
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generateShoppingList().length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Shopping list will appear once meals are added.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {generateShoppingList().map((item, i) => (
                      <div 
                        key={i} 
                        className="p-2 rounded bg-background border border-border text-sm"
                      >
                        <span className="font-medium">{item.item}</span>
                        {item.amount && (
                          <span className="text-muted-foreground ml-1">({item.amount})</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        <div className="mt-8 flex gap-4">
          <Button variant="gold" asChild>
            <Link to="/dashboard/check-in">Go to Weekly Check-In</Link>
          </Button>
          <Button variant="goldOutline" asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </main>
      <Footer />

      {/* Swap Dialog */}
      {mealToSwap && userCalories && (
        <MealSwapDialog
          open={swapDialogOpen}
          onOpenChange={setSwapDialogOpen}
          currentMeal={mealToSwap}
          availableMeals={allMeals}
          onSwap={handleSwap}
          targetCalories={userCalories.targetCalories}
          targetProtein={userCalories.protein}
        />
      )}
    </div>
  );
};

export default Nutrition;
