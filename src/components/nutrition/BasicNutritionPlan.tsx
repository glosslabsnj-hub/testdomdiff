import { Link } from "react-router-dom";
import { ArrowLeft, Flame, Beef, Wheat, Droplet, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";

interface BasicNutritionPlanProps {
  userGoal?: string | null;
}

interface MealPlan {
  name: string;
  targetCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  meals: {
    type: string;
    name: string;
    description: string;
    calories: number;
    protein: number;
  }[];
}

const mealPlans: Record<string, MealPlan> = {
  fat_loss: {
    name: "Fat Loss Protocol",
    targetCalories: 1800,
    protein: 160,
    carbs: 150,
    fats: 50,
    meals: [
      {
        type: "Breakfast",
        name: "Protein Power Start",
        description: "3 eggs scrambled, 2 slices turkey bacon, 1 cup spinach sautéed",
        calories: 400,
        protein: 35,
      },
      {
        type: "Lunch",
        name: "Lean & Clean",
        description: "6oz grilled chicken breast, 1 cup white rice, steamed broccoli",
        calories: 550,
        protein: 50,
      },
      {
        type: "Dinner",
        name: "Evening Fuel",
        description: "6oz tilapia, medium sweet potato, mixed green salad with olive oil",
        calories: 500,
        protein: 45,
      },
      {
        type: "Snack",
        name: "Protein Hit",
        description: "Greek yogurt with a handful of almonds",
        calories: 350,
        protein: 30,
      },
    ],
  },
  muscle_building: {
    name: "Muscle Building Protocol",
    targetCalories: 2500,
    protein: 200,
    carbs: 250,
    fats: 75,
    meals: [
      {
        type: "Breakfast",
        name: "Mass Builder",
        description: "4 eggs, 1.5 cups oatmeal with banana, glass of whole milk",
        calories: 700,
        protein: 45,
      },
      {
        type: "Lunch",
        name: "Yard Fuel",
        description: "8oz chicken thighs, 2 cups white rice, mixed vegetables",
        calories: 750,
        protein: 55,
      },
      {
        type: "Dinner",
        name: "Iron Plate",
        description: "8oz ribeye steak, large baked potato with butter, side salad",
        calories: 800,
        protein: 60,
      },
      {
        type: "Snack",
        name: "Growth Window",
        description: "Protein shake with peanut butter and banana",
        calories: 450,
        protein: 40,
      },
    ],
  },
  recomposition: {
    name: "Recomposition Protocol",
    targetCalories: 2100,
    protein: 175,
    carbs: 200,
    fats: 60,
    meals: [
      {
        type: "Breakfast",
        name: "Balanced Start",
        description: "3 eggs, 1 cup oatmeal with berries, coffee black",
        calories: 500,
        protein: 35,
      },
      {
        type: "Lunch",
        name: "Steady State",
        description: "6oz ground beef (90% lean), 1.5 cups rice, roasted vegetables",
        calories: 650,
        protein: 45,
      },
      {
        type: "Dinner",
        name: "Recovery Meal",
        description: "6oz salmon fillet, quinoa, asparagus with lemon",
        calories: 600,
        protein: 50,
      },
      {
        type: "Snack",
        name: "Maintenance Fuel",
        description: "Cottage cheese with walnuts and honey",
        calories: 350,
        protein: 30,
      },
    ],
  },
};

const BasicNutritionPlan = ({ userGoal }: BasicNutritionPlanProps) => {
  // Map user goal to meal plan key
  const getPlanKey = (goal: string | null | undefined): string => {
    if (!goal) return "recomposition";
    const goalLower = goal.toLowerCase();
    if (goalLower.includes("lose") || goalLower.includes("fat") || goalLower.includes("cut")) {
      return "fat_loss";
    }
    if (goalLower.includes("build") || goalLower.includes("muscle") || goalLower.includes("bulk") || goalLower.includes("gain")) {
      return "muscle_building";
    }
    return "recomposition";
  };

  const planKey = getPlanKey(userGoal);
  const plan = mealPlans[planKey];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader />
      <main className="flex-1 section-container py-8 pt-24">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cell Block
        </Link>

        <div className="mb-8">
          <h1 className="headline-section mb-2">
            Chow <span className="text-primary">Hall</span>
          </h1>
          <p className="text-muted-foreground">
            Your basic meal template for Solitary. One plan, no choices, no excuses.
          </p>
        </div>

        {/* Solitary Notice */}
        <div className="bg-charcoal p-6 rounded-lg border border-primary/30 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Solitary Confinement Nutrition</h3>
              <p className="text-sm text-muted-foreground mb-3">
                You get one meal template based on your goal. Follow it exactly. 
                Upgrade to Gen Pop for full meal planning with swaps and customization.
              </p>
              <Button variant="goldOutline" size="sm" asChild>
                <Link to="/programs/transformation" className="inline-flex items-center gap-2">
                  Upgrade to Gen Pop <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Your Plan */}
        <Card className="bg-charcoal border-border mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              {plan.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg bg-background border border-border">
                <Flame className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold text-foreground">{plan.targetCalories}</p>
                <p className="text-xs text-muted-foreground">Daily Calories</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background border border-border">
                <Beef className="h-6 w-6 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold text-foreground">{plan.protein}g</p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background border border-border">
                <Wheat className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                <p className="text-2xl font-bold text-foreground">{plan.carbs}g</p>
                <p className="text-xs text-muted-foreground">Carbs</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background border border-border">
                <Droplet className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold text-foreground">{plan.fats}g</p>
                <p className="text-xs text-muted-foreground">Fats</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Based on your goal: {userGoal || "Recomposition"}
            </p>
          </CardContent>
        </Card>

        {/* Daily Meals */}
        <div className="space-y-4 mb-8">
          <h2 className="headline-card">Your Daily Meals</h2>
          {plan.meals.map((meal, index) => (
            <Card key={index} className="bg-card border-border">
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-primary uppercase tracking-wider font-semibold">
                        {meal.type}
                      </span>
                    </div>
                    <h3 className="font-semibold mb-1">{meal.name}</h3>
                    <p className="text-sm text-muted-foreground">{meal.description}</p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="text-lg font-bold text-primary">{meal.calories}</p>
                    <p className="text-xs text-muted-foreground">{meal.protein}g protein</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Guidelines */}
        <Card className="bg-charcoal border-border mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Solitary Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Follow this exact meal plan every day. No substitutions.</li>
              <li>• Prep your meals in advance. Discipline starts in the kitchen.</li>
              <li>• Drink at least 1 gallon of water daily.</li>
              <li>• Eat at consistent times to build routine.</li>
              <li>• No cheat meals. You're in Solitary for a reason.</li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button variant="gold" asChild>
            <Link to="/dashboard/check-in">Go to Weekly Check-In</Link>
          </Button>
          <Button variant="goldOutline" asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BasicNutritionPlan;
