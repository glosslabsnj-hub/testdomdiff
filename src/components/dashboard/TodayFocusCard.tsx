import { useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Dumbbell, 
  Clock, 
  ClipboardCheck, 
  Sunrise,
  Moon,
  Target,
  Calendar
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDailyDiscipline } from "@/hooks/useDailyDiscipline";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { useCheckIns } from "@/hooks/useCheckIns";
import { useWeekPlan } from "@/hooks/useWeekPlan";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function TodayFocusCard() {
  const { profile, subscription: authSubscription } = useAuth();
  const { isCoaching, isMembership } = useEffectiveSubscription();
  const { morningRoutines, eveningRoutines, completions } = useDailyDiscipline();
  const { checkIns, getCurrentWeekNumber } = useCheckIns();
  const { weekPlan, currentWeek } = useWeekPlan();
  
  const currentHour = new Date().getHours();
  const isMorning = currentHour < 12;
  const isEvening = currentHour >= 18;
  
  // Calculate routine status
  const morningComplete = morningRoutines.every(r => completions.has(r.id));
  const eveningComplete = eveningRoutines.every(r => completions.has(r.id));
  const morningRemaining = morningRoutines.filter(r => !completions.has(r.id)).length;
  const eveningRemaining = eveningRoutines.filter(r => !completions.has(r.id)).length;
  
  // Check-in status
  const dayOfWeek = new Date().getDay();
  const isCheckInDue = dayOfWeek >= 5 || dayOfWeek === 0;
  const hasSubmittedThisWeek = checkIns.some(c => c.week_number === currentWeek);
  
  // Today's workout from week plan
  const todayPlan = weekPlan.days.find(d => d.isToday);
  const todayName = format(new Date(), "EEEE");
  
  // Build action pills
  const actionPills = useMemo(() => {
    const pills: Array<{
      id: string;
      label: string;
      subLabel: string;
      href: string;
      icon: React.ElementType;
      isComplete: boolean;
      priority: number;
    }> = [];
    
    // Workout pill
    if (todayPlan && todayPlan.primary.type !== "rest") {
      pills.push({
        id: "workout",
        label: todayPlan.primary.type === "workout" 
          ? (isCoaching ? "Training" : isMembership ? "Yard Time" : "The Sentence")
          : "Recovery",
        subLabel: todayPlan.primary.duration || "",
        href: todayPlan.primary.href,
        icon: Dumbbell,
        isComplete: false,
        priority: 1,
      });
    }
    
    // Routine pill (context-aware)
    if (isMorning && morningRoutines.length > 0) {
      pills.push({
        id: "morning",
        label: isCoaching ? "Morning" : "Lights On",
        subLabel: morningComplete ? "Done" : `${morningRemaining} left`,
        href: "/dashboard/discipline",
        icon: Sunrise,
        isComplete: morningComplete,
        priority: 2,
      });
    } else if (isEvening && eveningRoutines.length > 0) {
      pills.push({
        id: "evening",
        label: isCoaching ? "Evening" : "Lights Out",
        subLabel: eveningComplete ? "Done" : `${eveningRemaining} left`,
        href: "/dashboard/discipline",
        icon: Moon,
        isComplete: eveningComplete,
        priority: 2,
      });
    } else if (morningRoutines.length > 0 || eveningRoutines.length > 0) {
      // Default routine pill during mid-day
      pills.push({
        id: "routine",
        label: isCoaching ? "Routines" : "Discipline",
        subLabel: `${completions.size} done`,
        href: "/dashboard/discipline",
        icon: Clock,
        isComplete: morningComplete && eveningComplete,
        priority: 2,
      });
    }
    
    // Check-in pill (only show if due)
    if (isCheckInDue) {
      pills.push({
        id: "checkin",
        label: isCoaching ? "Report" : "Roll Call",
        subLabel: hasSubmittedThisWeek ? "Submitted" : "Due",
        href: "/dashboard/check-in",
        icon: ClipboardCheck,
        isComplete: hasSubmittedThisWeek,
        priority: 3,
      });
    }
    
    return pills.sort((a, b) => {
      if (a.isComplete !== b.isComplete) return a.isComplete ? 1 : -1;
      return a.priority - b.priority;
    });
  }, [
    todayPlan, isCoaching, isMembership, isMorning, isEvening,
    morningRoutines, eveningRoutines, morningComplete, eveningComplete,
    morningRemaining, eveningRemaining, isCheckInDue, hasSubmittedThisWeek, completions
  ]);
  
  // Day icons for compact week strip
  const getDayIcon = (type: string) => {
    switch (type) {
      case "workout": return Dumbbell;
      case "rest": return Moon;
      case "active-recovery": return Clock;
      case "faith": return Target;
      default: return Calendar;
    }
  };
  
  return (
    <Card className="mb-6 bg-card/50 border-border overflow-hidden">
      <CardContent className="p-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground text-sm">Today's Focus</span>
          </div>
          <Badge variant="outline" className="text-xs">
            Week {currentWeek} • {todayName.slice(0, 3)}
          </Badge>
        </div>
        
        {/* Action pills row */}
        <div className="flex flex-wrap gap-2 mb-4">
          {actionPills.map((pill) => (
            <Link
              key={pill.id}
              to={pill.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:scale-[1.02]",
                pill.isComplete 
                  ? "bg-success/10 border-success/30 text-success"
                  : "bg-primary/10 border-primary/30 hover:border-primary/50"
              )}
            >
              <pill.icon className={cn(
                "w-4 h-4",
                pill.isComplete ? "text-success" : "text-primary"
              )} />
              <div className="flex flex-col">
                <span className={cn(
                  "text-sm font-medium leading-tight",
                  pill.isComplete ? "text-success" : "text-foreground"
                )}>
                  {pill.label}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {pill.subLabel}
                </span>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Compact week strip */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Week at a glance</span>
          <div className="flex items-center gap-1">
            {weekPlan.days.map((day, idx) => {
              const DayIcon = getDayIcon(day.primary.type);
              return (
                <Link
                  key={day.date}
                  to={day.primary.href}
                  className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center transition-all",
                    day.isToday 
                      ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1 ring-offset-background"
                      : day.primary.type === "rest"
                        ? "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                        : "bg-muted/50 text-muted-foreground hover:bg-primary/20 hover:text-primary"
                  )}
                  title={`${day.dayName}: ${day.primary.title}`}
                >
                  <DayIcon className="w-3.5 h-3.5" />
                </Link>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TodayFocusCard;
