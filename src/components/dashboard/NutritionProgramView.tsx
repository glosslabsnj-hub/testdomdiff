import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Trophy,
  MessageCircle,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import NutritionDayCard from "./NutritionDayCard";
import { useClientNutrition } from "@/hooks/useClientNutrition";
import NutritionGroceryList from "@/components/admin/coaching/NutritionGroceryList";
import type { NutritionMealPlanMeal } from "@/hooks/useNutritionTemplates";

interface NutritionProgramViewProps {
  clientId?: string | null;
}

export default function NutritionProgramView({ clientId }: NutritionProgramViewProps) {
  const {
    template,
    weeks,
    getMealsForDay,
    isDayCompleted,
    toggleDayCompletion,
    hasNutritionProgram,
    completionStats,
    getWeekStats,
    loading,
  } = useClientNutrition(clientId || null);

  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([]);
  const [showGroceryList, setShowGroceryList] = useState<number | null>(null);

  const toggleWeek = (weekNum: number) => {
    setExpandedWeeks((prev) =>
      prev.includes(weekNum)
        ? prev.filter((w) => w !== weekNum)
        : [...prev, weekNum]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasNutritionProgram) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Nutrition Plan Yet</h3>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            Your personalized nutrition plan hasn't been assigned yet. Dom is working on 
            matching you with the perfect meal plan based on your goals and preferences.
          </p>
          <Button variant="goldOutline" asChild>
            <Link to="/dashboard/messages">
              <MessageCircle className="w-4 h-4 mr-2" />
              Message Dom
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (completionStats.isPhaseComplete) {
    return (
      <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center">
              <Trophy className="w-7 h-7 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Nutrition Phase Complete!</h3>
              <p className="text-muted-foreground">
                You've followed all 4 weeks of your nutrition plan
              </p>
            </div>
          </div>
          <p className="text-muted-foreground mb-4">
            Amazing discipline! Message Dom to discuss your results and get your next phase 
            of nutrition programming.
          </p>
          <Button variant="gold" asChild>
            <Link to="/dashboard/messages">
              <MessageCircle className="w-4 h-4 mr-2" />
              Message Dom for Next Phase
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Template Info */}
      {template && (
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{template.name}</h3>
                {template.description && (
                  <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                )}
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                {template.calorie_range_min}-{template.calorie_range_max} cal/day
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weeks */}
      {weeks.map((week) => {
        const isExpanded = expandedWeeks.includes(week.weekNumber);
        const weekStats = getWeekStats(week.weekNumber);

        // Collect all meals for grocery list
        const weekMeals: NutritionMealPlanMeal[] = week.days.flatMap((day) => getMealsForDay(day.id));

        return (
          <Card
            key={week.weekNumber}
            className={weekStats.isComplete ? "border-green-500/30 bg-green-500/5" : ""}
          >
            <Collapsible open={isExpanded} onOpenChange={() => toggleWeek(week.weekNumber)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                      <CardTitle className="text-lg">Week {week.weekNumber}</CardTitle>
                    </div>
                    <div className="flex items-center gap-3">
                      {weekStats.isComplete ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          {weekStats.completed}/{weekStats.total} days
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-3">
                  {/* Grocery List Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowGroceryList(showGroceryList === week.weekNumber ? null : week.weekNumber);
                    }}
                    className="w-full border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {showGroceryList === week.weekNumber ? "Hide" : "View"} Week {week.weekNumber} Grocery List
                  </Button>

                  {/* Grocery List */}
                  {showGroceryList === week.weekNumber && (
                    <div className="border border-border rounded-lg p-4 bg-charcoal">
                      <NutritionGroceryList 
                        meals={weekMeals} 
                        weekNumber={week.weekNumber}
                        days={week.days}
                      />
                    </div>
                  )}

                  {/* Days */}
                  {week.days.map((day) => (
                    <NutritionDayCard
                      key={day.id}
                      day={day}
                      meals={getMealsForDay(day.id)}
                      isCompleted={isDayCompleted(day.id)}
                      onComplete={() => toggleDayCompletion(day.id)}
                    />
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}

      {/* Help Card */}
      <Card className="bg-charcoal border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-primary" />
              <div>
                <h4 className="font-semibold text-foreground">Questions about your nutrition?</h4>
                <p className="text-sm text-muted-foreground">Send Dom a message anytime</p>
              </div>
            </div>
            <Button variant="goldOutline" asChild>
              <Link to="/dashboard/messages">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message Dom
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
