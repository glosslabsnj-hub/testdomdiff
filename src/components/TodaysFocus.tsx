import { Link } from "react-router-dom";
import { 
  Dumbbell, 
  ClipboardCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Flame,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import { useCheckIns } from "@/hooks/useCheckIns";
import { useDailyDiscipline } from "@/hooks/useDailyDiscipline";
import { calculateCurrentWeek } from "@/lib/weekCalculator";
import { useMemo } from "react";

export function TodaysFocus() {
  const { subscription, isCoaching, isMembership } = useEffectiveSubscription();
  const { checkIns, getCurrentWeekNumber } = useCheckIns();
  const { getTodayCompliance, streak, loading: disciplineLoading } = useDailyDiscipline();
  const firstName = "Warrior"; // Simplified - could add profile context if needed
  
  // Calculate current week
  const currentWeek = useMemo(() => {
    if (subscription?.started_at) {
      return calculateCurrentWeek(subscription.started_at);
    }
    return 1;
  }, [subscription?.started_at]);

  // Get today's day of week (1-7, Monday = 1)
  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // Convert Sunday from 0 to 7
  
  // Day names for display
  const dayNames = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const todayName = dayNames[dayOfWeek];

  // Check if weekly check-in is pending
  const checkInPending = useMemo(() => {
    const currentWeekNum = getCurrentWeekNumber();
    const hasThisWeekCheckIn = checkIns.some(c => c.week_number === currentWeekNum);
    // Show reminder on Friday-Sunday if not submitted
    return !hasThisWeekCheckIn && dayOfWeek >= 5;
  }, [checkIns, getCurrentWeekNumber, dayOfWeek]);

  // Get discipline compliance - wait for loading to complete
  const compliance = disciplineLoading 
    ? { completed: 0, total: 0, percent: 0 } 
    : getTodayCompliance();
  const compliancePercent = compliance.percent;

  // Get greeting based on time
  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  

  return (
    <div className="cell-block p-6 mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-muted-foreground text-sm mb-1">{getGreeting()},</p>
          <h2 className="headline-card text-foreground">
            {firstName} <span className="text-muted-foreground font-normal text-lg">— Week {currentWeek}</span>
          </h2>
        </div>
        
        {/* Streak badge */}
        {streak > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <Flame className="w-5 h-5 text-primary" />
            <span className="text-primary font-bold">{streak} Day Streak</span>
          </div>
        )}
      </div>

      {/* Focus Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Today's Workout */}
        <div className="p-4 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-primary/10">
                <Dumbbell className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {isMembership ? "Yard Time" : isCoaching ? "Training Sessions" : "The Sentence"}
              </span>
            </div>
            <Target className="w-4 h-4 text-muted-foreground/50" />
          </div>
          
          {isMembership ? (
            <div>
              <p className="font-semibold text-foreground mb-2">Choose Your Workout</p>
              <Button variant="goldOutline" size="sm" asChild className="w-full">
                <Link to="/dashboard/workouts" className="flex items-center justify-center gap-2">
                  Browse Templates <ArrowRight className="w-3 h-3" />
                </Link>
              </Button>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-foreground mb-1">
                {todayName} — Day {dayOfWeek}
              </p>
              <p className="text-xs text-muted-foreground mb-3">Week {currentWeek} of 12</p>
              <Button variant="gold" size="sm" asChild className="w-full">
                <Link to="/dashboard/program" className="flex items-center justify-center gap-2">
                  Start Workout <ArrowRight className="w-3 h-3" />
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Daily Discipline */}
        <div className="p-4 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-primary/10">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {isCoaching ? "Daily Structure" : "Routines"}
              </span>
            </div>
            {compliancePercent === 100 ? (
              <CheckCircle2 className="w-4 h-4 text-success" />
            ) : (
              <span className="text-xs text-muted-foreground">{compliance.completed}/{compliance.total}</span>
            )}
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Today's Progress</span>
              <span className="text-primary font-medium">
                {disciplineLoading ? "..." : `${compliancePercent}%`}
              </span>
            </div>
            <Progress value={disciplineLoading ? 0 : compliancePercent} className="h-2" />
          </div>
          
          <Button 
            variant={compliancePercent === 100 ? "steel" : "goldOutline"} 
            size="sm" 
            asChild 
            className="w-full"
          >
            <Link to="/dashboard/discipline" className="flex items-center justify-center gap-2">
              {compliancePercent === 100 ? "View Routines" : "Complete Routines"}
              <ArrowRight className="w-3 h-3" />
            </Link>
          </Button>
        </div>

        {/* Weekly Check-In */}
        <div className={`p-4 rounded-lg border ${
          checkInPending 
            ? "bg-primary/5 border-primary/30" 
            : "bg-muted/30 border-border"
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-md ${checkInPending ? "bg-primary/20" : "bg-primary/10"}`}>
                <ClipboardCheck className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {isCoaching ? "Weekly Report" : "Roll Call"}
              </span>
            </div>
            {checkInPending ? (
              <AlertCircle className="w-4 h-4 text-primary animate-pulse" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-success" />
            )}
          </div>
          
          <div>
            {checkInPending ? (
              <>
                <p className="font-semibold text-foreground mb-1">Check-In Due</p>
                <p className="text-xs text-muted-foreground mb-3">Submit your weekly report</p>
                <Button variant="gold" size="sm" asChild className="w-full">
                  <Link to="/dashboard/check-in" className="flex items-center justify-center gap-2">
                    Submit Now <ArrowRight className="w-3 h-3" />
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <p className="font-semibold text-foreground mb-1">Week {Math.max(1, getCurrentWeekNumber() - 1)} Complete</p>
                <p className="text-xs text-muted-foreground mb-3">Next check-in due Friday</p>
                <Button variant="steel" size="sm" asChild className="w-full">
                  <Link to="/dashboard/check-in" className="flex items-center justify-center gap-2">
                    View History <ArrowRight className="w-3 h-3" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TodaysFocus;
