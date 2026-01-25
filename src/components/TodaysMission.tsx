import { Link } from "react-router-dom";
import { 
  Dumbbell, 
  Clock, 
  Utensils, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  Target
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import { useDailyDiscipline } from "@/hooks/useDailyDiscipline";
import { calculateCurrentWeek } from "@/lib/weekCalculator";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface TodaysMissionProps {
  className?: string;
}

export function TodaysMission({ className }: TodaysMissionProps) {
  const { subscription, isCoaching, isMembership } = useEffectiveSubscription();
  const { getTodayCompliance, streak, loading: disciplineLoading } = useDailyDiscipline();
  
  // Track if today's workout is done (simplified check)
  const hasCompletedTodayWorkout = false; // Will be enhanced later with real tracking

  // Calculate current week and day
  const currentWeek = useMemo(() => {
    if (subscription?.started_at) {
      return calculateCurrentWeek(subscription.started_at);
    }
    return 1;
  }, [subscription?.started_at]);

  // Get today's day of week
  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
  const dayNames = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Get discipline compliance
  const compliance = disciplineLoading 
    ? { completed: 0, total: 0, percent: 0 } 
    : getTodayCompliance();

  // Today's missions
  const missions = [
    {
      id: "routine",
      title: isCoaching ? "Complete Daily Structure" : "Complete Routines",
      subtitle: `${compliance.completed}/${compliance.total} items done`,
      href: "/dashboard/discipline",
      icon: Clock,
      isComplete: compliance.percent === 100,
      progress: compliance.percent,
    },
    {
      id: "workout",
      title: isMembership ? "Hit Yard Time" : `${dayNames[dayOfWeek]} Workout`,
      subtitle: isMembership ? "Choose a template" : `Week ${currentWeek}, Day ${dayOfWeek}`,
      href: isMembership ? "/dashboard/workouts" : "/dashboard/program",
      icon: Dumbbell,
      isComplete: hasCompletedTodayWorkout,
      progress: hasCompletedTodayWorkout ? 100 : 0,
    },
    {
      id: "nutrition",
      title: isCoaching ? "Follow Meal Plan" : "Hit Your Macros",
      subtitle: "Check today's meals",
      href: "/dashboard/nutrition",
      icon: Utensils,
      isComplete: false, // Could track with meal feedback
      progress: 0,
    },
  ];

  const completedCount = missions.filter(m => m.isComplete).length;
  const allComplete = completedCount === missions.length;
  const overallProgress = Math.round((completedCount / missions.length) * 100);

  return (
    <div className={cn("cell-block p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">
              {allComplete ? "Mission Complete" : "Today's Mission"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {allComplete 
                ? "You crushed it. Rest up." 
                : `${missions.length - completedCount} ${missions.length - completedCount === 1 ? "task" : "tasks"} remaining`}
            </p>
          </div>
        </div>
        
        {streak > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Flame className="w-4 h-4 text-primary" />
            <span className="text-primary font-bold text-sm">{streak}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-muted-foreground">Daily Progress</span>
          <span className="text-primary font-medium">{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      {/* Mission List */}
      <div className="space-y-3">
        {missions.map((mission) => {
          const MissionIcon = mission.icon;
          
          return (
            <Link
              key={mission.id}
              to={mission.href}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg border transition-all group",
                mission.isComplete
                  ? "bg-primary/5 border-primary/20"
                  : "bg-muted/30 border-border hover:border-primary/50"
              )}
            >
              {/* Status indicator */}
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                mission.isComplete 
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
              )}>
                {mission.isComplete ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <MissionIcon className="w-5 h-5" />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium",
                  mission.isComplete ? "text-muted-foreground line-through" : "text-foreground"
                )}>
                  {mission.title}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {mission.subtitle}
                </p>
              </div>
              
              {/* Action */}
              {!mission.isComplete && (
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </Link>
          );
        })}
      </div>

      {/* All Complete Message */}
      {allComplete && (
        <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/30 text-center">
          <p className="text-sm text-foreground mb-2">
            🏆 All missions complete for today!
          </p>
          <p className="text-xs text-muted-foreground">
            Tomorrow: {dayNames[dayOfWeek === 7 ? 1 : dayOfWeek + 1]}
          </p>
        </div>
      )}
    </div>
  );
}

export default TodaysMission;
