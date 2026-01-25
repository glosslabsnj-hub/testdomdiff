import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SetupProgress {
  setup_wizard_completed: boolean;
  setup_wizard_step: number;
  wake_time: string | null;
  sleep_time: string | null;
}

export function useSetupProgress() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: progress, isLoading } = useQuery({
    queryKey: ["setup-progress", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("setup_wizard_completed, setup_wizard_step, wake_time, sleep_time")
        .eq("user_id", user.id)
        .single();
      
      if (error) throw error;
      return data as SetupProgress;
    },
    enabled: !!user?.id,
  });

  const updateStep = useMutation({
    mutationFn: async (step: number) => {
      if (!user?.id) throw new Error("No user");
      
      const { error } = await supabase
        .from("profiles")
        .update({ setup_wizard_step: step })
        .eq("user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["setup-progress"] });
    },
  });

  const completeSetup = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("No user");
      
      const { error } = await supabase
        .from("profiles")
        .update({ 
          setup_wizard_completed: true,
          setup_wizard_step: 5
        })
        .eq("user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["setup-progress"] });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  const updateSchedule = useMutation({
    mutationFn: async ({ wakeTime, sleepTime }: { wakeTime: string; sleepTime: string }) => {
      if (!user?.id) throw new Error("No user");
      
      const { error } = await supabase
        .from("profiles")
        .update({ 
          wake_time: wakeTime,
          sleep_time: sleepTime
        })
        .eq("user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["setup-progress"] });
    },
  });

  // Computed values
  const isWizardComplete = progress?.setup_wizard_completed ?? false;
  const currentStep = progress?.setup_wizard_step ?? 0;
  const wakeTime = progress?.wake_time ?? "06:00:00";
  const sleepTime = progress?.sleep_time ?? "22:00:00";

  // Check if user needs to see the wizard
  // Show wizard if: intake is complete AND wizard is not complete
  const needsSetupWizard = profile?.intake_completed_at && !isWizardComplete;

  return {
    isLoading,
    isWizardComplete,
    currentStep,
    wakeTime,
    sleepTime,
    needsSetupWizard,
    updateStep,
    completeSetup,
    updateSchedule,
  };
}
