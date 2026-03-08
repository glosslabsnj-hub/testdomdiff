import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import { startOfDay, subDays, differenceInCalendarDays, format } from "date-fns";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  category: "streak" | "workout" | "discipline" | "faith" | "community" | "milestone";
  earnedAt: string | null;
  requirement: string;
}

export interface GamificationData {
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
  earnedCount: number;
  totalCount: number;
  accountabilityScore: number; // 0-100 weekly score
  scoreBreakdown: {
    discipline: number;    // 0-25
    workouts: number;      // 0-25
    checkIn: number;       // 0-25
    nutrition: number;     // 0-25
  };
}

export function useGamification() {
  const { user } = useAuth();
  const { subscription } = useEffectiveSubscription();
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState({ current: 0, longest: 0 });
  const [activityData, setActivityData] = useState<{
    totalWorkouts: number;
    totalCheckIns: number;
    totalCommunityMessages: number;
    totalFaithLessons: number;
    disciplineStreakDays: number;
    currentWeekDiscipline: number;
    currentWeekWorkouts: number;
    currentWeekCheckIn: boolean;
    currentWeekNutrition: number;
    programWeeksCompleted: number;
    hasPartner: boolean;
  }>({
    totalWorkouts: 0,
    totalCheckIns: 0,
    totalCommunityMessages: 0,
    totalFaithLessons: 0,
    disciplineStreakDays: 0,
    currentWeekDiscipline: 0,
    currentWeekWorkouts: 0,
    currentWeekCheckIn: false,
    currentWeekNutrition: 0,
    programWeeksCompleted: 0,
    hasPartner: false,
  });

  const fetchActivityData = useCallback(async () => {
    if (!user) return;

    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const weekStart = format(subDays(new Date(), new Date().getDay()), "yyyy-MM-dd");

      // Parallel fetch all activity data
      const [
        workoutRes,
        checkInRes,
        communityRes,
        faithRes,
        habitRes,
        weekHabitRes,
        weekWorkoutRes,
        weekCheckInRes,
        dayCompletionsRes,
      ] = await Promise.all([
        // Total workout completions
        supabase
          .from("workout_completions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        // Total check-ins
        supabase
          .from("check_ins")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        // Total community messages
        supabase
          .from("community_messages")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        // Faith journal entries (discipline_journals used for faith reflections too)
        supabase
          .from("discipline_journals")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        // All habit logs for streak calculation
        supabase
          .from("habit_logs")
          .select("log_date")
          .eq("user_id", user.id)
          .like("habit_name", "routine_%")
          .order("log_date", { ascending: false }),
        // This week's discipline habits
        supabase
          .from("habit_logs")
          .select("id")
          .eq("user_id", user.id)
          .like("habit_name", "routine_%")
          .gte("log_date", weekStart)
          .lte("log_date", today),
        // This week's workout completions
        supabase
          .from("workout_completions")
          .select("id")
          .eq("user_id", user.id)
          .gte("created_at", new Date(weekStart).toISOString()),
        // This week's check-in
        supabase
          .from("check_ins")
          .select("id")
          .eq("user_id", user.id)
          .gte("submitted_at", new Date(weekStart).toISOString()),
        // Day completions for program progress
        supabase
          .from("day_completions")
          .select("week_number")
          .eq("user_id", user.id),
      ]);

      // Calculate streak from habit logs
      const habitDates = [...new Set((habitRes.data || []).map(d => d.log_date))];
      let currentStreak = 0;
      let longestStreak = 0;
      const todayDate = startOfDay(new Date());

      for (let i = 0; i < habitDates.length; i++) {
        const logDate = startOfDay(new Date(habitDates[i]));
        const expectedDate = subDays(todayDate, i);
        if (differenceInCalendarDays(expectedDate, logDate) === 0) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Calculate longest streak
      let tempStreak = 0;
      for (let i = 0; i < habitDates.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const prev = startOfDay(new Date(habitDates[i - 1]));
          const curr = startOfDay(new Date(habitDates[i]));
          if (differenceInCalendarDays(prev, curr) === 1) {
            tempStreak++;
          } else {
            tempStreak = 1;
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      }

      // Calculate discipline streak (consecutive days with both morning+evening)
      let disciplineStreakDays = 0;
      // Simplified: use habit log dates count

      // Program weeks completed
      const completedWeeks = new Set((dayCompletionsRes.data || []).map(d => d.week_number));

      setStreakData({ current: currentStreak, longest: Math.max(longestStreak, currentStreak) });
      setActivityData({
        totalWorkouts: workoutRes.count || 0,
        totalCheckIns: checkInRes.count || 0,
        totalCommunityMessages: communityRes.count || 0,
        totalFaithLessons: faithRes.count || 0,
        disciplineStreakDays: currentStreak,
        currentWeekDiscipline: (weekHabitRes.data || []).length,
        currentWeekWorkouts: (weekWorkoutRes.data || []).length,
        currentWeekCheckIn: (weekCheckInRes.data || []).length > 0,
        currentWeekNutrition: 0, // Will be enhanced later
        programWeeksCompleted: completedWeeks.size,
        hasPartner: false,
      });
    } catch (e) {
      console.error("Error fetching gamification data:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActivityData();
  }, [fetchActivityData]);

  // Calculate badges from activity data
  const badges: Badge[] = useMemo(() => {
    const d = activityData;
    const now = new Date().toISOString();

    return [
      // Streak badges
      {
        id: "first_day",
        name: "First Day In",
        description: "Complete your first activity",
        icon: "Star",
        category: "streak" as const,
        earnedAt: (d.totalWorkouts > 0 || streakData.current > 0 || d.totalCheckIns > 0) ? now : null,
        requirement: "Complete any activity",
      },
      {
        id: "week_survivor",
        name: "Week Survivor",
        description: "7-day streak of good behavior",
        icon: "Shield",
        category: "streak" as const,
        earnedAt: streakData.longest >= 7 ? now : null,
        requirement: "7-day streak",
      },
      {
        id: "iron_will",
        name: "Iron Will",
        description: "14 consecutive days locked in",
        icon: "Swords",
        category: "streak" as const,
        earnedAt: streakData.longest >= 14 ? now : null,
        requirement: "14-day streak",
      },
      {
        id: "unbreakable",
        name: "Unbreakable",
        description: "30 days without breaking the chain",
        icon: "ShieldCheck",
        category: "streak" as const,
        earnedAt: streakData.longest >= 30 ? now : null,
        requirement: "30-day streak",
      },
      {
        id: "lifer",
        name: "Lifer",
        description: "60 days of relentless discipline",
        icon: "Crown",
        category: "streak" as const,
        earnedAt: streakData.longest >= 60 ? now : null,
        requirement: "60-day streak",
      },
      {
        id: "good_behavior",
        name: "Good Behavior",
        description: "90 days of exemplary conduct",
        icon: "Award",
        category: "streak" as const,
        earnedAt: streakData.longest >= 90 ? now : null,
        requirement: "90-day streak",
      },
      // Workout badges
      {
        id: "first_roll_call",
        name: "First Roll Call",
        description: "Submit your first weekly check-in",
        icon: "ClipboardCheck",
        category: "workout" as const,
        earnedAt: d.totalCheckIns > 0 ? now : null,
        requirement: "Submit 1 check-in",
      },
      {
        id: "iron_regular",
        name: "Iron Pile Regular",
        description: "Complete 10 workout exercises",
        icon: "Dumbbell",
        category: "workout" as const,
        earnedAt: d.totalWorkouts >= 10 ? now : null,
        requirement: "10 exercises completed",
      },
      {
        id: "iron_beast",
        name: "Iron Pile Beast",
        description: "Complete 25 workout exercises",
        icon: "Flame",
        category: "workout" as const,
        earnedAt: d.totalWorkouts >= 25 ? now : null,
        requirement: "25 exercises completed",
      },
      {
        id: "iron_legend",
        name: "Iron Legend",
        description: "Complete 100 workout exercises",
        icon: "Trophy",
        category: "workout" as const,
        earnedAt: d.totalWorkouts >= 100 ? now : null,
        requirement: "100 exercises completed",
      },
      // Discipline badges
      {
        id: "discipline_machine",
        name: "Discipline Machine",
        description: "Complete routines 7 days straight",
        icon: "Cog",
        category: "discipline" as const,
        earnedAt: streakData.longest >= 7 ? now : null,
        requirement: "7-day routine streak",
      },
      {
        id: "full_send",
        name: "Full Send",
        description: "Hit 100% weekly accountability score",
        icon: "Zap",
        category: "discipline" as const,
        earnedAt: null, // Calculated separately
        requirement: "100% weekly score",
      },
      // Faith badges
      {
        id: "chapel_regular",
        name: "Chapel Regular",
        description: "Complete 4 faith lessons",
        icon: "BookOpen",
        category: "faith" as const,
        earnedAt: d.totalFaithLessons >= 4 ? now : null,
        requirement: "4 faith lessons",
      },
      {
        id: "chapel_devoted",
        name: "Chapel Devoted",
        description: "Complete all 12 faith lessons",
        icon: "Heart",
        category: "faith" as const,
        earnedAt: d.totalFaithLessons >= 12 ? now : null,
        requirement: "12 faith lessons",
      },
      // Community badges
      {
        id: "community_voice",
        name: "Community Voice",
        description: "Post 10 messages in the community",
        icon: "MessageCircle",
        category: "community" as const,
        earnedAt: d.totalCommunityMessages >= 10 ? now : null,
        requirement: "10 community messages",
      },
      {
        id: "cellmate",
        name: "Cellmate",
        description: "Get matched with an accountability partner",
        icon: "Users",
        category: "community" as const,
        earnedAt: d.hasPartner ? now : null,
        requirement: "Find your cellmate",
      },
      // Milestone badges
      {
        id: "phase_1",
        name: "Phase 1 Complete",
        description: "Survive the first 4 weeks",
        icon: "Target",
        category: "milestone" as const,
        earnedAt: d.programWeeksCompleted >= 4 ? now : null,
        requirement: "Complete week 4",
      },
      {
        id: "phase_2",
        name: "Phase 2 Complete",
        description: "Push through weeks 5-8",
        icon: "TrendingUp",
        category: "milestone" as const,
        earnedAt: d.programWeeksCompleted >= 8 ? now : null,
        requirement: "Complete week 8",
      },
      {
        id: "released",
        name: "Released",
        description: "Complete all 12 weeks. You're free.",
        icon: "KeyRound",
        category: "milestone" as const,
        earnedAt: d.programWeeksCompleted >= 12 ? now : null,
        requirement: "Complete all 12 weeks",
      },
    ];
  }, [activityData, streakData]);

  // Calculate weekly accountability score from REAL data
  const accountabilityScore = useMemo(() => {
    const d = activityData;

    // Discipline: 25 points max
    // Based on routines completed this week (target: ~14 per week = 7 days * 2 routines)
    const disciplineTarget = 14;
    const disciplineScore = Math.min(25, Math.round((d.currentWeekDiscipline / disciplineTarget) * 25));

    // Workouts: 25 points max
    // Target: 4 workout sessions per week
    const workoutTarget = 4;
    const workoutScore = Math.min(25, Math.round((d.currentWeekWorkouts / workoutTarget) * 25));

    // Check-in: 25 points max (binary - submitted or not)
    const checkInScore = d.currentWeekCheckIn ? 25 : 0;

    // Nutrition: 25 points max
    // For now, give partial credit based on discipline (meal-related habits)
    const nutritionScore = Math.min(25, Math.round((d.currentWeekDiscipline / disciplineTarget) * 15));

    return {
      total: Math.min(100, disciplineScore + workoutScore + checkInScore + nutritionScore),
      breakdown: {
        discipline: disciplineScore,
        workouts: workoutScore,
        checkIn: checkInScore,
        nutrition: nutritionScore,
      },
    };
  }, [activityData]);

  const earnedBadges = badges.filter(b => b.earnedAt !== null);

  return {
    loading,
    currentStreak: streakData.current,
    longestStreak: streakData.longest,
    badges,
    earnedCount: earnedBadges.length,
    totalCount: badges.length,
    accountabilityScore: accountabilityScore.total,
    scoreBreakdown: accountabilityScore.breakdown,
    refetch: fetchActivityData,
  };
}
