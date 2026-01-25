import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CoachingSpotsData {
  availableSpots: number;
  totalSpots: number;
  activeClients: number;
  isFull: boolean;
  loading: boolean;
}

export function useCoachingSpots(): CoachingSpotsData {
  // Get max spots from config
  const { data: spotsConfig, isLoading: configLoading } = useQuery({
    queryKey: ["coaching-spots-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaching_spots")
        .select("max_spots")
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Count active coaching subscriptions
  const { data: activeCount, isLoading: countLoading } = useQuery({
    queryKey: ["coaching-active-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("plan_type", "coaching")
        .eq("status", "active");
      
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const loading = configLoading || countLoading;
  const totalSpots = spotsConfig?.max_spots || 10;
  const activeClients = activeCount || 0;
  const availableSpots = Math.max(0, totalSpots - activeClients);
  const isFull = availableSpots === 0;

  return {
    availableSpots,
    totalSpots,
    activeClients,
    isFull,
    loading,
  };
}

export default useCoachingSpots;
