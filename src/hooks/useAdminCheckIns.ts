import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AdminCheckIn {
  id: string;
  user_id: string;
  week_number: number;
  weight: number | null;
  waist: number | null;
  steps_avg: number | null;
  workouts_completed: number | null;
  wins: string | null;
  struggles: string | null;
  changes: string | null;
  faith_reflection: string | null;
  coach_notes?: string | null;
  coach_reviewed_at?: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  // Joined profile data
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
    avatar_url: string | null;
  };
  // Joined subscription data
  subscription?: {
    plan_type: string;
    status: string;
    started_at: string;
  };
}

export interface CheckInFilters {
  weekNumber?: number;
  needsReview?: boolean;
  userId?: string;
  search?: string;
}

export function useAdminCheckIns(filters?: CheckInFilters) {
  const [checkIns, setCheckIns] = useState<AdminCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCheckIns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all check-ins
      let query = supabase
        .from("check_ins")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (filters?.weekNumber) {
        query = query.eq("week_number", filters.weekNumber);
      }

      if (filters?.userId) {
        query = query.eq("user_id", filters.userId);
      }

      const { data: checkInsData, error: checkInsError } = await query;

      if (checkInsError) throw checkInsError;

      // Fetch profiles for all unique user IDs
      const userIds = [...new Set((checkInsData || []).map(c => c.user_id))];
      
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, email, avatar_url")
        .in("user_id", userIds);

      // Fetch subscriptions for all unique user IDs
      const { data: subscriptionsData } = await supabase
        .from("subscriptions")
        .select("user_id, plan_type, status, started_at")
        .in("user_id", userIds)
        .eq("status", "active");

      // Map profiles and subscriptions to check-ins
      const profilesMap = new Map((profilesData || []).map(p => [p.user_id, p]));
      const subscriptionsMap = new Map((subscriptionsData || []).map(s => [s.user_id, s]));

      let enrichedCheckIns: AdminCheckIn[] = (checkInsData || []).map(checkIn => ({
        ...checkIn,
        profile: profilesMap.get(checkIn.user_id) || undefined,
        subscription: subscriptionsMap.get(checkIn.user_id) || undefined,
      }));

      // Apply client-side filters
      if (filters?.needsReview) {
        enrichedCheckIns = enrichedCheckIns.filter(c => !c.coach_reviewed_at);
      }

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        enrichedCheckIns = enrichedCheckIns.filter(c => 
          c.profile?.first_name?.toLowerCase().includes(searchLower) ||
          c.profile?.last_name?.toLowerCase().includes(searchLower) ||
          c.profile?.email.toLowerCase().includes(searchLower)
        );
      }

      setCheckIns(enrichedCheckIns);
    } catch (err: any) {
      console.error("Error fetching admin check-ins:", err);
      setError(err.message || "Failed to fetch check-ins");
    } finally {
      setLoading(false);
    }
  }, [filters?.weekNumber, filters?.needsReview, filters?.userId, filters?.search]);

  useEffect(() => {
    fetchCheckIns();
  }, [fetchCheckIns]);

  const addCoachNotes = async (checkInId: string, notes: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("check_ins")
        .update({
          coach_notes: notes,
          coach_reviewed_at: new Date().toISOString(),
        })
        .eq("id", checkInId);

      if (error) throw error;
      await fetchCheckIns();
      return true;
    } catch (err: any) {
      console.error("Error adding coach notes:", err);
      return false;
    }
  };

  const getCheckInStats = () => {
    const total = checkIns.length;
    const reviewed = checkIns.filter(c => c.coach_reviewed_at).length;
    const pending = total - reviewed;
    const thisWeek = checkIns.filter(c => {
      const submittedDate = new Date(c.submitted_at);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return submittedDate >= weekAgo;
    }).length;

    return { total, reviewed, pending, thisWeek };
  };

  return {
    checkIns,
    loading,
    error,
    refetch: fetchCheckIns,
    addCoachNotes,
    getCheckInStats,
  };
}
