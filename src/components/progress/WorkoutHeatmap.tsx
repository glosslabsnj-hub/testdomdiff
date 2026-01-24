import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { format, startOfWeek, addDays, differenceInWeeks } from "date-fns";
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

interface DayData {
  date: string;
  count: number;
  weekNumber: number;
}

interface WorkoutHeatmapProps {
  className?: string;
}

export function WorkoutHeatmap({ className }: WorkoutHeatmapProps) {
  const { user, subscription } = useAuth();
  const [heatmapData, setHeatmapData] = useState<Map<string, DayData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [maxCount, setMaxCount] = useState(1);

  useEffect(() => {
    const fetchCompletions = async () => {
      if (!user || !subscription) {
        setLoading(false);
        return;
      }

      try {
        const startDate = new Date(subscription.started_at);
        const { data, error } = await supabase
          .from("workout_completions")
          .select("completed_at, week_number")
          .eq("user_id", user.id)
          .gte("completed_at", startDate.toISOString());

        if (error) throw error;

        // Group completions by date
        const dataMap = new Map<string, DayData>();
        let max = 1;

        (data || []).forEach((completion) => {
          const dateKey = format(new Date(completion.completed_at), "yyyy-MM-dd");
          const existing = dataMap.get(dateKey);
          const count = (existing?.count || 0) + 1;
          max = Math.max(max, count);
          
          dataMap.set(dateKey, {
            date: dateKey,
            count,
            weekNumber: completion.week_number,
          });
        });

        setHeatmapData(dataMap);
        setMaxCount(max);
      } catch (e) {
        console.error("Error fetching heatmap data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletions();
  }, [user, subscription]);

  // Generate 12 weeks of dates starting from subscription start
  const generateWeeks = () => {
    if (!subscription) return [];
    
    const startDate = startOfWeek(new Date(subscription.started_at), { weekStartsOn: 0 });
    const weeks: Date[][] = [];
    
    for (let week = 0; week < 12; week++) {
      const weekStart = addDays(startDate, week * 7);
      const days: Date[] = [];
      for (let day = 0; day < 7; day++) {
        days.push(addDays(weekStart, day));
      }
      weeks.push(days);
    }
    
    return weeks;
  };

  const getIntensity = (count: number): string => {
    if (count === 0) return "bg-charcoal/50";
    const ratio = count / maxCount;
    if (ratio <= 0.25) return "bg-primary/30";
    if (ratio <= 0.5) return "bg-primary/50";
    if (ratio <= 0.75) return "bg-primary/75";
    return "bg-primary";
  };

  const weeks = generateWeeks();
  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  if (loading) {
    return (
      <div className={cn("bg-card p-6 rounded-lg border border-border", className)}>
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-muted rounded mb-4" />
          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 84 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-sm bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalWorkouts = Array.from(heatmapData.values()).reduce((sum, d) => sum + d.count, 0);
  const activeDays = heatmapData.size;

  return (
    <div className={cn("bg-card p-6 rounded-lg border border-border", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">Workout Consistency</h3>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{totalWorkouts}</p>
            <p className="text-xs text-muted-foreground">Exercises</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{activeDays}</p>
            <p className="text-xs text-muted-foreground">Active Days</p>
          </div>
        </div>
      </div>

      {/* Day labels */}
      <div className="flex gap-1 mb-2">
        <div className="w-6" /> {/* Spacer for week labels */}
        {dayLabels.map((label, i) => (
          <div key={i} className="flex-1 text-center text-[10px] text-muted-foreground">
            {label}
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex gap-1 items-center">
            <div className="w-6 text-[10px] text-muted-foreground text-right pr-1">
              W{weekIndex + 1}
            </div>
            {week.map((date, dayIndex) => {
              const dateKey = format(date, "yyyy-MM-dd");
              const dayData = heatmapData.get(dateKey);
              const count = dayData?.count || 0;
              const isFuture = date > new Date();

              return (
                <Tooltip key={dayIndex}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "flex-1 aspect-square rounded-sm transition-all duration-200",
                        isFuture 
                          ? "bg-muted/30 cursor-default" 
                          : cn(getIntensity(count), "hover:ring-2 hover:ring-primary/50 cursor-pointer")
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p className="font-semibold">{format(date, "MMM d, yyyy")}</p>
                    <p className="text-muted-foreground">
                      {isFuture ? "Future" : count === 0 ? "No exercises" : `${count} exercise${count > 1 ? "s" : ""} completed`}
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-0.5">
          <div className="w-3 h-3 rounded-sm bg-charcoal/50" />
          <div className="w-3 h-3 rounded-sm bg-primary/30" />
          <div className="w-3 h-3 rounded-sm bg-primary/50" />
          <div className="w-3 h-3 rounded-sm bg-primary/75" />
          <div className="w-3 h-3 rounded-sm bg-primary" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

export default WorkoutHeatmap;
