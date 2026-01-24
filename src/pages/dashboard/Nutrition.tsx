import { Link } from "react-router-dom";
import { ArrowLeft, Utensils, ShoppingCart, Grid, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNutritionGuidelines, NutritionGuideline } from "@/hooks/useNutritionContent";
import { useAuth } from "@/contexts/AuthContext";
import UpgradePrompt from "@/components/UpgradePrompt";

const Nutrition = () => {
  const { guidelines, loading } = useNutritionGuidelines();
  const { subscription } = useAuth();

  // Only transformation and coaching users can access
  if (subscription?.plan_type === "membership") {
    return <UpgradePrompt feature="Nutrition Templates" upgradeTo="transformation" />;
  }

  const mealStructure = guidelines.filter((g) => g.content_type === "meal_structure" && g.is_active);
  const groceryLists = guidelines.filter((g) => g.content_type === "grocery_list" && g.is_active);
  const rules = guidelines.filter((g) => g.content_type === "rule" && g.is_active);

  const hasContent = mealStructure.length > 0 || groceryLists.length > 0 || rules.length > 0;

  // Helper to safely get content array
  const getContentArray = (content: any): string[] => {
    if (Array.isArray(content)) return content;
    if (content?.items && Array.isArray(content.items)) return content.items;
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-12">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="headline-section mb-2">
            Nutrition <span className="text-primary">Guidelines</span>
          </h1>
          <p className="text-muted-foreground">
            Simple, practical meal templates. No complicated macros unless you want them.
          </p>
        </div>

        {!hasContent ? (
          <>
            <div className="bg-charcoal p-6 rounded-lg border border-primary/30 mb-8">
              <p className="text-sm text-primary uppercase tracking-wider mb-2">Coming Soon</p>
              <p className="text-muted-foreground">
                Your personalized nutrition guidelines are being prepared. Check back soon!
              </p>
            </div>

            {/* Show default plate method */}
            <div className="bg-card p-8 rounded-lg border border-border mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Grid className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-xs text-primary uppercase tracking-wider">Simple Method</p>
                  <h2 className="headline-card">Plate Method</h2>
                </div>
              </div>

              <div className="aspect-square max-w-xs mx-auto relative">
                <div className="absolute inset-0 rounded-full border-4 border-primary/30" />
                <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-full border-b-2 border-primary/30 flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="font-semibold text-primary">50%</p>
                    <p className="text-sm text-muted-foreground">Vegetables</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 rounded-bl-full border-r-2 border-primary/30 flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="font-semibold text-primary">25%</p>
                    <p className="text-sm text-muted-foreground">Protein</p>
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-1/2 h-1/2 rounded-br-full flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="font-semibold text-primary">25%</p>
                    <p className="text-sm text-muted-foreground">Carbs</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center mt-4">
                Simple visual guide for every meal. No measuring required.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Meal Structure */}
            {mealStructure.length > 0 && (
              <div className="bg-card p-8 rounded-lg border border-border mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <Utensils className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-xs text-primary uppercase tracking-wider">Meal Plan</p>
                    <h2 className="headline-card">Meal Structure</h2>
                  </div>
                </div>

                <div className="space-y-4">
                  {mealStructure.map((meal) => (
                    <div
                      key={meal.id}
                      className="p-4 rounded bg-charcoal border border-border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{meal.title}</span>
                      </div>
                      {meal.content && typeof meal.content === "object" && (
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(meal.content as Record<string, string>).map(([key, value]) => (
                            <div key={key} className="p-2 rounded bg-background border border-border text-center">
                              <p className="text-xs text-muted-foreground capitalize">{key}</p>
                              <p className="text-sm">{value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grocery Lists */}
            {groceryLists.length > 0 && (
              <div className="bg-card p-8 rounded-lg border border-border mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <ShoppingCart className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-xs text-primary uppercase tracking-wider">Shopping</p>
                    <h2 className="headline-card">Grocery List</h2>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                  {groceryLists.map((list) => (
                    <div key={list.id}>
                      <h3 className="font-semibold text-primary mb-3">{list.title}</h3>
                      <div className="space-y-2">
                        {getContentArray(list.content).map((item: string, i: number) => (
                          <div
                            key={i}
                            className="p-2 rounded bg-charcoal border border-border text-sm text-muted-foreground"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rules */}
            {rules.length > 0 && (
              <div className="bg-card p-8 rounded-lg border border-border">
                <h2 className="headline-card mb-6">Nutrition Rules</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {rules.map((rule, index) => (
                    <div
                      key={rule.id}
                      className="p-4 rounded bg-charcoal border border-border"
                    >
                      <span className="text-primary font-bold mr-2">{index + 1}.</span>
                      <span className="text-muted-foreground">{rule.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
      </div>
    </div>
  );
};

export default Nutrition;
