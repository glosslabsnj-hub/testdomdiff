import { useQueryClient } from "@tanstack/react-query";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator";
import { useCallback } from "react";

interface DashboardPullToRefreshProps {
  children: React.ReactNode;
  queryKeys?: string[];
}

export function DashboardPullToRefresh({ 
  children, 
  queryKeys = ["profile", "subscription", "checkIns", "workoutCompletions"] 
}: DashboardPullToRefreshProps) {
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    // Invalidate multiple query keys
    await Promise.all(
      queryKeys.map((key) => queryClient.invalidateQueries({ queryKey: [key] }))
    );
    // Small delay for visual feedback
    await new Promise((resolve) => setTimeout(resolve, 300));
  }, [queryClient, queryKeys]);

  const { pullDistance, progress, isRefreshing } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
  });

  return (
    <>
      <PullToRefreshIndicator
        pullDistance={pullDistance}
        progress={progress}
        isRefreshing={isRefreshing}
      />
      {children}
    </>
  );
}
