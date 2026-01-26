import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import { useDailyDiscipline } from "@/hooks/useDailyDiscipline";
import { format, addDays, startOfWeek } from "date-fns";

export interface WeekDayPlan {
  date: string;
  dayName: string;
  dayNumber: number;
  primary: {
    type: "workout" | "rest" | "active-recovery" | "faith";
    title: string;
    href: string;
    duration?: string;
  };
  secondary?: {
    type: "routine" | "lesson" | "checkin";
    title: string;
    href: string;
  };
  isToday: boolean;
  isComplete: boolean;
}

export interface WeekPlan {
  weekNumber: number;
  startDate: string;
  endDate: string;
  days: WeekDayPlan[];
  theme?: string;
}

export function useWeekPlan() {
  const { profile, subscription } = useAuth();
  const { isCoaching, isMembership, isTransformation } = useEffectiveSubscription();
  const { morningRoutines, eveningRoutines, completions } = useDailyDiscipline();
  
  // Calculate current week based on subscription start
  const currentWeek = useMemo(() => {
    if (subscription?.started_at) {
      const startDate = new Date(subscription.started_at);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      return Math.min(12, Math.max(1, Math.floor(diffDays / 7) + 1));
    }
    return 1;
  }, [subscription]);
  
  // Get week start date
  const weekStartDate = useMemo(() => {
    if (subscription?.started_at) {
      const startDate = new Date(subscription.started_at);
      return addDays(startDate, (currentWeek - 1) * 7);
    }
    return startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  }, [subscription, currentWeek]);
  
  // Generate week plan based on tier and profile
  const weekPlan = useMemo((): WeekPlan => {
    const today = format(new Date(), "yyyy-MM-dd");
    const goal = profile?.goal || "Both - lose fat and build muscle";
    
    // Determine workout days based on tier
    const workoutDays = isMembership 
      ? [1, 3, 5] // Mon, Wed, Fri for Solitary (3-day)
      : [1, 2, 4, 5, 6]; // Mon, Tue, Thu, Fri, Sat for Gen Pop/Coaching (5-day)
    
    const days: WeekDayPlan[] = [];
    
    for (let i = 0; i < 7; i++) {
      const dayDate = addDays(weekStartDate, i);
      const dateStr = format(dayDate, "yyyy-MM-dd");
      const dayOfWeek = dayDate.getDay();
      const dayName = format(dayDate, "EEEE");
      
      // Determine primary activity
      let primary: WeekDayPlan["primary"];
      
      if (dayOfWeek === 0) {
        // Sunday - Rest/Faith
        primary = isMembership 
          ? { type: "rest", title: "Rest Day", href: "/dashboard/discipline" }
          : { type: "faith", title: "Faith Reflection", href: "/dashboard/faith", duration: "15 min" };
      } else if (workoutDays.includes(dayOfWeek)) {
        // Workout day
        const dayLabels = {
          1: isMembership ? "Full Body A" : `W${currentWeek}D1 - Push`,
          2: isMembership ? "" : `W${currentWeek}D2 - Pull`,
          3: isMembership ? "Full Body B" : "",
          4: isMembership ? "" : `W${currentWeek}D3 - Legs`,
          5: isMembership ? "Full Body C" : `W${currentWeek}D4 - Upper`,
          6: isMembership ? "" : `W${currentWeek}D5 - Conditioning`,
        };
        
        primary = {
          type: "workout",
          title: isCoaching 
            ? `Training Day ${workoutDays.indexOf(dayOfWeek) + 1}`
            : (dayLabels[dayOfWeek as keyof typeof dayLabels] || "Workout"),
          href: isMembership ? "/dashboard/workouts" : "/dashboard/program",
          duration: "45 min",
        };
      } else {
        // Active recovery
        primary = {
          type: "active-recovery",
          title: isCoaching ? "Active Recovery" : "Recovery Day",
          href: "/dashboard/discipline",
          duration: "20 min",
        };
      }
      
      // Determine secondary activity
      let secondary: WeekDayPlan["secondary"] | undefined;
      
      if (morningRoutines.length > 0 || eveningRoutines.length > 0) {
        secondary = {
          type: "routine",
          title: isCoaching ? "Daily Structure" : "Lights On/Out",
          href: "/dashboard/discipline",
        };
      }
      
      // Check-in on Saturday
      if (dayOfWeek === 6) {
        secondary = {
          type: "checkin",
          title: isCoaching ? "Weekly Report Due" : "Roll Call Due",
          href: "/dashboard/check-in",
        };
      }
      
      days.push({
        date: dateStr,
        dayName,
        dayNumber: i + 1,
        primary,
        secondary,
        isToday: dateStr === today,
        isComplete: false, // Would need to track this from completions
      });
    }
    
    // Week themes based on week number
    const weekThemes: Record<number, string> = {
      1: "Foundation Week - Build the Base",
      2: "Consistency Week - Lock In Habits",
      3: "Push Week - Increase Intensity",
      4: "Recovery Week - Active Deload",
      5: "Strength Week - Heavy Focus",
      6: "Conditioning Week - Cardio Push",
      7: "Power Week - Explosive Training",
      8: "Endurance Week - High Volume",
      9: "Peak Week - Maximum Effort",
      10: "Refinement Week - Perfect Form",
      11: "Challenge Week - Test Limits",
      12: "Victory Week - Finish Strong",
    };
    
    return {
      weekNumber: currentWeek,
      startDate: format(weekStartDate, "yyyy-MM-dd"),
      endDate: format(addDays(weekStartDate, 6), "yyyy-MM-dd"),
      days,
      theme: isTransformation || isCoaching ? weekThemes[currentWeek] : undefined,
    };
  }, [
    profile, subscription, currentWeek, weekStartDate, 
    isMembership, isCoaching, isTransformation,
    morningRoutines, eveningRoutines
  ]);
  
  return {
    weekPlan,
    currentWeek,
    isLoading: false,
  };
}

export default useWeekPlan;
