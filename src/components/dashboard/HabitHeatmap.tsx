import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays, eachDayOfInterval, startOfWeek, getDay } from "date-fns";
import { cn } from "@/lib/utils";

interface DayData {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export function HabitHeatmap() {
  const { user } = useAuth();
  const [activityByDate, setActivityByDate] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchActivity = async () => {
      const startDate = format(subDays(new Date(), 90), "yyyy-MM-dd");

      // Fetch all habit logs in the last 90 days
      const { data } = await supabase
        .from("habit_logs")
        .select("log_date")
        .eq("user_id", user.id)
        .gte("log_date", startDate);

      const counts: Record<string, number> = {};
      (data || []).forEach((log: any) => {
        counts[log.log_date] = (counts[log.log_date] || 0) + 1;
      });

      // Also count workout completions
      const { data: workouts } = await supabase
        .from("workout_completions")
        .select("created_at")
        .eq("user_id", user.id)
        .gte("created_at", new Date(startDate).toISOString());

      (workouts || []).forEach((w: any) => {
        const date = format(new Date(w.created_at), "yyyy-MM-dd");
        counts[date] = (counts[date] || 0) + 1;
      });

      setActivityByDate(counts);
      setLoading(false);
    };

    fetchActivity();
  }, [user]);

  const heatmapData = useMemo(() => {
    const today = new Date();
    const start = subDays(today, 83); // ~12 weeks
    const days = eachDayOfInterval({ start, end: today });

    const maxCount = Math.max(1, ...Object.values(activityByDate));

    return days.map((day): DayData => {
      const dateStr = format(day, "yyyy-MM-dd");
      const count = activityByDate[dateStr] || 0;
      const ratio = count / maxCount;
      const level: 0 | 1 | 2 | 3 | 4 = count === 0 ? 0 :
        ratio <= 0.25 ? 1 :
        ratio <= 0.5 ? 2 :
        ratio <= 0.75 ? 3 : 4;
      return { date: dateStr, count, level };
    });
  }, [activityByDate]);

  // Organize into weeks (columns) and days (rows)
  const weeks = useMemo(() => {
    const result: DayData[][] = [];
    let currentWeek: DayData[] = [];

    heatmapData.forEach((day, i) => {
      const dayOfWeek = getDay(new Date(day.date));
      if (i === 0) {
        // Pad first week
        for (let j = 0; j < dayOfWeek; j++) {
          currentWeek.push({ date: "", count: 0, level: 0 });
        }
      }
      currentWeek.push(day);
      if (dayOfWeek === 6) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }
    return result;
  }, [heatmapData]);

  const totalActiveDays = Object.keys(activityByDate).length;

  if (loading) return null;

  const levelColors = [
    "bg-muted/30",          // 0 - no activity
    "bg-primary/20",        // 1 - low
    "bg-primary/40",        // 2 - medium
    "bg-primary/60",        // 3 - high
    "bg-primary",           // 4 - max
  ];

  return (
    <Card className="mb-6 border-border/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Activity
          </CardTitle>
          <span className="text-xs text-muted-foreground">{totalActiveDays} active days</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-[3px] overflow-x-auto pb-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => (
                <div
                  key={`${wi}-${di}`}
                  className={cn(
                    "w-3 h-3 rounded-[2px] transition-colors",
                    day.date ? levelColors[day.level] : "bg-transparent"
                  )}
                  title={day.date ? `${day.date}: ${day.count} activities` : ""}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 mt-2 justify-end">
          <span className="text-[10px] text-muted-foreground mr-1">Less</span>
          {levelColors.map((color, i) => (
            <div key={i} className={cn("w-2.5 h-2.5 rounded-[2px]", color)} />
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">More</span>
        </div>
      </CardContent>
    </Card>
  );
}
