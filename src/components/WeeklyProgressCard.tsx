import { useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Dumbbell, 
  Check, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ChevronRight
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useDailyDiscipline } from "@/hooks/useDailyDiscipline";
import { useProgressEntries } from "@/hooks/useProgressEntries";
import { useWorkoutCompletions } from "@/hooks/useWorkoutCompletions";
import { calculateCurrentWeek } from "@/lib/weekCalculator";

export function WeeklyProgressCard() {
  const { subscription, profile } = useAuth();
  const { streak, getTodayCompliance, loading: disciplineLoading } = useDailyDiscipline();
  const { entries, loading: progressLoading } = useProgressEntries();
  
  // Calculate current week
  const currentWeek = useMemo(() => {
    if (!subscription?.started_at) return 1;
    return calculateCurrentWeek(subscription.started_at);
  }, [subscription?.started_at]);
  
  const { completions, loading: workoutsLoading } = useWorkoutCompletions(currentWeek);
  
  const isCoaching = subscription?.plan_type === "coaching";
  const compliance = getTodayCompliance();
  
  // Calculate weight trend
  const weightTrend = useMemo(() => {
    if (entries.length < 2) return null;
    
    const sortedEntries = [...entries]
      .filter(e => e.weight !== null)
      .sort((a, b) => b.week_number - a.week_number);
    
    if (sortedEntries.length < 2) return null;
    
    const latest = sortedEntries[0].weight!;
    const previous = sortedEntries[1].weight!;
    const diff = latest - previous;
    
    if (Math.abs(diff) < 0.5) return { direction: "stable" as const, value: 0 };
    return { 
      direction: diff > 0 ? "up" as const : "down" as const, 
      value: Math.abs(diff) 
    };
  }, [entries]);
  
  // Calculate workouts this week (simple count based on unique days with completions)
  const workoutsThisWeek = useMemo(() => {
    const uniqueDays = new Set(
      completions.map(c => c.day_of_week)
    );
    return uniqueDays.size;
  }, [completions]);
  
  const loading = disciplineLoading || progressLoading || workoutsLoading;
  
  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-4 animate-pulse">
        <div className="h-5 bg-muted rounded w-1/3 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg tracking-wider text-foreground">
            Week {currentWeek} {isCoaching ? "Summary" : "Roll Call"}
          </h3>
          <p className="text-xs text-muted-foreground">Your weekly progress at a glance</p>
        </div>
        <Link 
          to="/dashboard/progress" 
          className="text-primary text-xs flex items-center gap-1 hover:underline"
        >
          View Full Report <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Workouts This Week */}
        <div className="bg-charcoal rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-display text-foreground">{workoutsThisWeek}/6</p>
          <p className="text-xs text-muted-foreground">Workouts</p>
          <Progress value={(workoutsThisWeek / 6) * 100} className="h-1 mt-2" />
        </div>
        
        {/* Discipline Compliance */}
        <div className="bg-charcoal rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-4 h-4 text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-display text-foreground">{compliance.percent}%</p>
          <p className="text-xs text-muted-foreground">Today's Tasks</p>
          <Progress value={compliance.percent} className="h-1 mt-2" />
        </div>
        
        {/* Weight Trend */}
        <div className="bg-charcoal rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              !weightTrend ? "bg-muted" : 
              weightTrend.direction === "down" ? "bg-green-500/20" : 
              weightTrend.direction === "up" ? "bg-amber-500/20" : 
              "bg-muted"
            }`}>
              {!weightTrend || weightTrend.direction === "stable" ? (
                <Minus className="w-4 h-4 text-muted-foreground" />
              ) : weightTrend.direction === "down" ? (
                <TrendingDown className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingUp className="w-4 h-4 text-amber-400" />
              )}
            </div>
          </div>
          <p className="text-2xl font-display text-foreground">
            {weightTrend ? (
              weightTrend.direction === "stable" ? "Stable" : 
              `${weightTrend.direction === "down" ? "-" : "+"}${weightTrend.value.toFixed(1)}`
            ) : "--"}
          </p>
          <p className="text-xs text-muted-foreground">Weight Trend</p>
        </div>
        
        {/* Streak */}
        <div className="bg-charcoal rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              streak > 0 ? "bg-primary/20" : "bg-muted"
            }`}>
              <Flame className={`w-4 h-4 ${streak > 0 ? "text-primary animate-flame" : "text-muted-foreground"}`} />
            </div>
          </div>
          <p className="text-2xl font-display text-foreground">{streak}</p>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </div>
      </div>
    </div>
  );
}

export default WeeklyProgressCard;
