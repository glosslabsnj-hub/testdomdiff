import { Link } from "react-router-dom";
import { 
  Flame, 
  Dumbbell, 
  ChevronRight,
  Sparkles,
  Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import { useDailyDiscipline } from "@/hooks/useDailyDiscipline";
import { useWorkoutCompletions } from "@/hooks/useWorkoutCompletions";
import { calculateCurrentWeek } from "@/lib/weekCalculator";
import CountingNumber from "@/components/CountingNumber";

interface DashboardWelcomeCardProps {
  userName?: string;
}

export function DashboardWelcomeCard({ userName }: DashboardWelcomeCardProps) {
  const { subscription, isCoaching, isMembership } = useEffectiveSubscription();
  const { streak, getTodayCompliance } = useDailyDiscipline();
  
  const currentWeek = subscription?.started_at 
    ? calculateCurrentWeek(subscription.started_at)
    : 1;
  
  const { completions } = useWorkoutCompletions(currentWeek);
  const compliance = getTodayCompliance();
  
  // Count unique workout days this week
  const workoutsThisWeek = new Set(completions.map(c => c.day_of_week)).size;
  
  // Get tier-specific greeting
  const getGreeting = () => {
    if (isCoaching) return "Welcome back";
    if (currentWeek === 1) return "Welcome to the block";
    if (currentWeek === 12) return "Final week";
    return `Week ${currentWeek}`;
  };
  
  // Get tier-specific CTA
  const getPrimaryCTA = () => {
    if (isMembership) {
      return { label: "Yard Time", href: "/dashboard/workouts" };
    }
    if (isCoaching) {
      return { label: "Your Program", href: "/dashboard/custom-program" };
    }
    return { label: "The Sentence", href: "/dashboard/program" };
  };
  
  const primaryCTA = getPrimaryCTA();
  
  return (
    <div className="mb-6 p-4 sm:p-5 rounded-xl bg-gradient-to-r from-primary/10 via-charcoal to-charcoal border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Greeting + Stats */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="hidden sm:flex w-12 h-12 rounded-lg bg-primary/20 items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-lg sm:text-xl text-foreground truncate">
                {getGreeting()}{userName ? `, ${userName}` : ""}
              </h2>
              {!isMembership && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  Week {currentWeek}/12
                </Badge>
              )}
            </div>
            {/* Inline stats row */}
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-primary" />
                <CountingNumber value={workoutsThisWeek} />/6 workouts
              </span>
              <span className="flex items-center gap-1">
                <Flame className={`w-3.5 h-3.5 ${streak > 0 ? "text-primary" : "text-muted-foreground"}`} />
                <CountingNumber value={streak} /> day streak
              </span>
              <span className="hidden sm:flex items-center gap-1">
                {compliance.percent}% today
              </span>
            </div>
          </div>
        </div>
        
        {/* Right: Primary CTA */}
        <Link
          to={primaryCTA.href}
          className="flex items-center justify-between sm:justify-end gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 hover:border-primary/50 hover:bg-primary/20 transition-all group flex-shrink-0"
        >
          <span className="font-medium text-foreground group-hover:text-primary transition-colors">
            {primaryCTA.label}
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>
    </div>
  );
}

export default DashboardWelcomeCard;
