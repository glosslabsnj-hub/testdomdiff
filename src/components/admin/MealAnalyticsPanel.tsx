import { Heart, SkipForward, RefreshCw, TrendingUp, TrendingDown, Star, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMealAnalytics, type MealAnalytics } from "@/hooks/useMealAnalytics";
import { formatDistanceToNow } from "date-fns";

export default function MealAnalyticsPanel() {
  const { analytics, loading, error } = useMealAnalytics();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-8 text-center text-destructive">
          Failed to load meal analytics: {error}
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No meal feedback data available yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-charcoal border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <p className="text-2xl font-bold text-foreground">{analytics.totalFeedback}</p>
              <p className="text-xs text-muted-foreground">Total Feedback</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-charcoal border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">{analytics.totalSwaps}</p>
              <p className="text-xs text-muted-foreground">Total Swaps</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-charcoal border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold text-foreground">{analytics.mostLikedMeals.length}</p>
              <p className="text-xs text-muted-foreground">Liked Meals</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-charcoal border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingDown className="h-8 w-8 mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold text-foreground">{analytics.mostSkippedMeals.length}</p>
              <p className="text-xs text-muted-foreground">Skipped Meals</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Most Liked Meals */}
        <Card className="bg-charcoal border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Most Liked Meals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {analytics.mostLikedMeals.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No liked meals yet</p>
              ) : (
                <div className="space-y-3">
                  {analytics.mostLikedMeals.map((meal, i) => (
                    <MealAnalyticsRow key={meal.mealId} meal={meal} rank={i + 1} type="likes" />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Most Skipped Meals */}
        <Card className="bg-charcoal border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <SkipForward className="h-5 w-5 text-amber-500" />
              Most Skipped Meals
              <Badge variant="outline" className="ml-2 text-xs">Needs Improvement</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {analytics.mostSkippedMeals.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No skipped meals yet</p>
              ) : (
                <div className="space-y-3">
                  {analytics.mostSkippedMeals.map((meal, i) => (
                    <MealAnalyticsRow key={meal.mealId} meal={meal} rank={i + 1} type="skips" />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Most Swapped Out */}
        <Card className="bg-charcoal border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Most Swapped Out
              <Badge variant="outline" className="ml-2 text-xs">Consider Replacing</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {analytics.mostSwappedOut.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No swapped meals yet</p>
              ) : (
                <div className="space-y-3">
                  {analytics.mostSwappedOut.map((meal, i) => (
                    <MealAnalyticsRow key={meal.mealId} meal={meal} rank={i + 1} type="swaps" />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Feedback */}
        <Card className="bg-charcoal border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Recent Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {analytics.recentFeedback.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent feedback</p>
              ) : (
                <div className="space-y-3">
                  {analytics.recentFeedback.map((fb) => (
                    <div key={fb.id} className="p-3 rounded bg-background border border-border">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground text-sm">{fb.meal_name}</span>
                        <Badge 
                          variant="outline"
                          className={
                            fb.feedback_type === "like" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                            fb.feedback_type === "made" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                            "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          }
                        >
                          {fb.feedback_type === "like" && <Heart className="h-3 w-3 mr-1" />}
                          {fb.feedback_type === "skip" && <SkipForward className="h-3 w-3 mr-1" />}
                          {fb.feedback_type === "made" && "✓ "}
                          {fb.feedback_type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{formatDistanceToNow(new Date(fb.created_at), { addSuffix: true })}</span>
                        {fb.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                            {fb.rating}/5
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MealAnalyticsRow({ meal, rank, type }: { meal: MealAnalytics; rank: number; type: "likes" | "skips" | "swaps" }) {
  const count = type === "likes" ? meal.likes : type === "skips" ? meal.skips : meal.swapOutCount;
  
  return (
    <div className="p-3 rounded bg-background border border-border">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-muted-foreground w-6">#{rank}</span>
        <div className="flex-1">
          <p className="font-medium text-foreground text-sm">{meal.mealName}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs capitalize">{meal.mealType}</Badge>
            <span className="text-xs text-muted-foreground">{meal.templateName}</span>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${
            type === "likes" ? "text-red-500" : 
            type === "skips" ? "text-amber-500" : "text-primary"
          }`}>
            {count}
          </p>
          <p className="text-xs text-muted-foreground">
            {type === "likes" ? "likes" : type === "skips" ? "skips" : "swaps"}
          </p>
        </div>
      </div>
      {meal.avgRating && (
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
          {meal.avgRating.toFixed(1)} avg rating
        </div>
      )}
    </div>
  );
}
