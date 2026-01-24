import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface UserMilestone {
  id: string;
  user_id: string;
  milestone_type: string;
  milestone_key: string;
  milestone_name: string;
  description: string | null;
  badge_icon: string | null;
  earned_at: string;
  created_at: string;
}

// Parole Board milestone definitions
export const PAROLE_MILESTONES = [
  {
    key: "week_1_complete",
    name: "First Count",
    description: "Completed your first week of discipline",
    icon: "Clock",
    type: "parole_board",
    weekRequired: 1,
  },
  {
    key: "week_4_complete",
    name: "Parole Hearing Scheduled",
    description: "Four weeks of consistent training - your hearing is set",
    icon: "Calendar",
    type: "parole_board",
    weekRequired: 4,
  },
  {
    key: "week_8_complete",
    name: "Parole Board Impressed",
    description: "Eight weeks in - the board sees your transformation",
    icon: "Star",
    type: "parole_board",
    weekRequired: 8,
  },
  {
    key: "week_12_complete",
    name: "Freedom Earned",
    description: "You've completed the full 12-week program. You're free.",
    icon: "Trophy",
    type: "parole_board",
    weekRequired: 12,
  },
  {
    key: "streak_7",
    name: "7-Day Lockdown",
    description: "Seven consecutive days of discipline",
    icon: "Flame",
    type: "streak",
    streakRequired: 7,
  },
  {
    key: "streak_30",
    name: "30-Day Veteran",
    description: "Thirty consecutive days of iron discipline",
    icon: "Award",
    type: "streak",
    streakRequired: 30,
  },
  {
    key: "streak_90",
    name: "Quarter Master",
    description: "Ninety days of unbroken discipline",
    icon: "Crown",
    type: "streak",
    streakRequired: 90,
  },
  {
    key: "first_checkin",
    name: "Roll Call Reported",
    description: "Submitted your first weekly check-in",
    icon: "ClipboardCheck",
    type: "checkin",
  },
  {
    key: "perfect_week",
    name: "Perfect Week",
    description: "Completed all routines for an entire week",
    icon: "CheckCircle",
    type: "discipline",
  },
  {
    key: "hydration_master",
    name: "Hydration Master",
    description: "Hit your water target for 7 consecutive days",
    icon: "Droplet",
    type: "discipline",
  },
];

export function useMilestones() {
  const { user, subscription } = useAuth();
  const { toast } = useToast();
  const [milestones, setMilestones] = useState<UserMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's earned milestones
  const fetchMilestones = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_milestones")
        .select("*")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false });

      if (error) throw error;
      setMilestones((data || []) as UserMilestone[]);
    } catch (e) {
      console.error("Error fetching milestones:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check if user has a specific milestone
  const hasMilestone = useCallback((key: string): boolean => {
    return milestones.some(m => m.milestone_key === key);
  }, [milestones]);

  // Award a milestone to the user
  const awardMilestone = useCallback(async (key: string): Promise<boolean> => {
    if (!user) return false;

    // Already has this milestone
    if (hasMilestone(key)) return false;

    const definition = PAROLE_MILESTONES.find(m => m.key === key);
    if (!definition) return false;

    try {
      const { error } = await supabase
        .from("user_milestones")
        .insert({
          user_id: user.id,
          milestone_type: definition.type,
          milestone_key: definition.key,
          milestone_name: definition.name,
          description: definition.description,
          badge_icon: definition.icon,
        });

      if (error) throw error;

      await fetchMilestones();

      toast({
        title: "🏆 Milestone Earned!",
        description: `${definition.name}: ${definition.description}`,
      });

      return true;
    } catch (e: any) {
      console.error("Error awarding milestone:", e);
      return false;
    }
  }, [user, hasMilestone, fetchMilestones, toast]);

  // Check and award milestone based on conditions
  const checkAndAwardMilestone = useCallback(async (
    key: string,
    condition: boolean
  ): Promise<boolean> => {
    if (!condition || hasMilestone(key)) return false;
    return await awardMilestone(key);
  }, [hasMilestone, awardMilestone]);

  // Check week-based milestones
  const checkWeekMilestones = useCallback(async (currentWeek: number) => {
    const weekMilestones = PAROLE_MILESTONES.filter(m => m.weekRequired);
    
    for (const milestone of weekMilestones) {
      if (milestone.weekRequired && currentWeek >= milestone.weekRequired) {
        await checkAndAwardMilestone(milestone.key, true);
      }
    }
  }, [checkAndAwardMilestone]);

  // Check streak-based milestones
  const checkStreakMilestones = useCallback(async (currentStreak: number) => {
    const streakMilestones = PAROLE_MILESTONES.filter(m => m.streakRequired);
    
    for (const milestone of streakMilestones) {
      if (milestone.streakRequired && currentStreak >= milestone.streakRequired) {
        await checkAndAwardMilestone(milestone.key, true);
      }
    }
  }, [checkAndAwardMilestone]);

  // Get milestone icon component name
  const getMilestoneIcon = useCallback((key: string): string | null => {
    const earned = milestones.find(m => m.milestone_key === key);
    if (earned?.badge_icon) return earned.badge_icon;
    
    const definition = PAROLE_MILESTONES.find(m => m.key === key);
    return definition?.icon || null;
  }, [milestones]);

  // Get progress to next milestone
  const getNextMilestone = useCallback(() => {
    const unearned = PAROLE_MILESTONES.filter(m => !hasMilestone(m.key));
    if (unearned.length === 0) return null;
    
    // Prioritize parole_board type milestones
    const paroleMilestones = unearned.filter(m => m.type === "parole_board");
    return paroleMilestones[0] || unearned[0];
  }, [hasMilestone]);

  // Get featured badge (most recent or highest tier)
  const getFeaturedBadge = useCallback((): UserMilestone | null => {
    // Prioritize "Freedom Earned" if user has it
    const freedomEarned = milestones.find(m => m.milestone_key === "freedom_earned");
    if (freedomEarned) return freedomEarned;

    // Otherwise return most recent
    return milestones[0] || null;
  }, [milestones]);

  // Check if user is Free World (coaching) tier
  const isFreeWorldUser = subscription?.plan_type === "coaching";

  useEffect(() => {
    if (user) {
      fetchMilestones();
    }
  }, [user, fetchMilestones]);

  return {
    milestones,
    loading,
    hasMilestone,
    awardMilestone,
    checkAndAwardMilestone,
    checkWeekMilestones,
    checkStreakMilestones,
    getMilestoneIcon,
    getNextMilestone,
    getFeaturedBadge,
    isFreeWorldUser,
    refetch: fetchMilestones,
    PAROLE_MILESTONES,
  };
}
