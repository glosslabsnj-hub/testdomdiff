import { Link } from "react-router-dom";
import { 
  Calendar, 
  Dumbbell, 
  Moon, 
  BookOpen, 
  Clock, 
  ClipboardCheck,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWeekPlan, WeekDayPlan } from "@/hooks/useWeekPlan";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import { cn } from "@/lib/utils";

const getActivityIcon = (type: WeekDayPlan["primary"]["type"]) => {
  switch (type) {
    case "workout":
      return Dumbbell;
    case "rest":
      return Moon;
    case "active-recovery":
      return Clock;
    case "faith":
      return BookOpen;
    default:
      return Calendar;
  }
};

const getActivityColor = (type: WeekDayPlan["primary"]["type"]) => {
  switch (type) {
    case "workout":
      return "bg-primary/20 text-primary border-primary/30";
    case "rest":
      return "bg-muted/20 text-muted-foreground border-muted/30";
    case "active-recovery":
      return "bg-success/20 text-success border-success/30";
    case "faith":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    default:
      return "bg-muted/20 text-muted-foreground border-muted/30";
  }
};

export function WeekSentenceCard() {
  const { weekPlan, currentWeek } = useWeekPlan();
  const { isCoaching, isMembership } = useEffectiveSubscription();
  
  return (
    <Card className="mb-8 bg-charcoal/50 border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-primary" />
            {isCoaching 
              ? `Week ${currentWeek} Schedule` 
              : isMembership 
                ? "This Week's Yard Time" 
                : `Week ${currentWeek} of The Sentence`}
          </CardTitle>
          {weekPlan.theme && (
            <Badge variant="outline" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              {weekPlan.theme.split(" - ")[0]}
            </Badge>
          )}
        </div>
        {weekPlan.theme && (
          <p className="text-sm text-muted-foreground mt-1">
            {weekPlan.theme.split(" - ")[1]}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {weekPlan.days.map((day) => {
            const Icon = getActivityIcon(day.primary.type);
            const colorClass = getActivityColor(day.primary.type);
            
            return (
              <Link
                key={day.date}
                to={day.primary.href}
                className={cn(
                  "flex flex-col items-center p-2 sm:p-3 rounded-lg border transition-all hover:scale-105",
                  colorClass,
                  day.isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
              >
                <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider opacity-70">
                  {day.dayName.slice(0, 3)}
                </span>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 my-1" />
                <span className="text-[9px] sm:text-xs text-center line-clamp-2 hidden sm:block">
                  {day.primary.type === "workout" 
                    ? (isMembership ? "Train" : day.primary.title.split(" - ")[1] || "Train")
                    : day.primary.type === "rest" ? "Rest" : "Recovery"
                  }
                </span>
                {day.isToday && (
                  <Badge className="mt-1 text-[8px] px-1.5 py-0 h-4 hidden sm:flex">
                    TODAY
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
        
        {/* Today's Detail */}
        {weekPlan.days.find(d => d.isToday) && (
          <div className="mt-4 pt-4 border-t border-border">
            {(() => {
              const today = weekPlan.days.find(d => d.isToday)!;
              const Icon = getActivityIcon(today.primary.type);
              
              return (
                <Link 
                  to={today.primary.href}
                  className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20 hover:border-primary/40 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        Today: {today.primary.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {today.primary.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {today.primary.duration}
                          </span>
                        )}
                        {today.secondary && (
                          <span className="flex items-center gap-1">
                            + {today.secondary.title}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WeekSentenceCard;
