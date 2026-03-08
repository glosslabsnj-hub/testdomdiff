import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches the coach (Dom) user ID from site_settings.
 * Returns null if not configured yet.
 */
export function useCoachId() {
  const { data: coachId, isLoading } = useQuery({
    queryKey: ["coach-user-id"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "coach_user_id")
        .maybeSingle();

      if (error || !data?.value) return null;
      return data.value;
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  return { coachId, isLoading };
}
