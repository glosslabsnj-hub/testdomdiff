import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ClientProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  age: number | null;
  height: string | null;
  weight: string | null;
  goal: string | null;
  experience: string | null;
  equipment: string | null;
  injuries: string | null;
  faith_commitment: boolean | null;
  avatar_url: string | null;
  intake_completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Enhanced Free World intake fields
  body_fat_estimate: string | null;
  activity_level: string | null;
  training_days_per_week: number | null;
  sleep_quality: string | null;
  stress_level: string | null;
  previous_training: string | null;
  medical_conditions: string | null;
  motivation: string | null;
  short_term_goals: string | null;
  long_term_goals: string | null;
  nutrition_style: string | null;
  biggest_obstacle: string | null;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_type: "membership" | "transformation" | "coaching";
  status: "active" | "cancelled" | "expired";
  started_at: string;
  expires_at: string | null;
  cancelled_at: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientWithSubscription extends ClientProfile {
  subscriptions: Subscription[];
  activeSubscription: Subscription | null;
  daysRemaining: number | null;
}

interface ClientAnalytics {
  totalClients: number;
  activeClients: number;
  expiredClients: number;
  cancelledClients: number;
  clientsByPlan: {
    membership: number;
    transformation: number;
    coaching: number;
  };
  intakeCompleted: number;
  clients: ClientWithSubscription[];
}

export const useClientAnalytics = (filters?: {
  planType?: string;
  status?: string;
  search?: string;
}) => {
  const [analytics, setAnalytics] = useState<ClientAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClientData();
  }, [filters?.planType, filters?.status, filters?.search]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all subscriptions
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (subscriptionsError) throw subscriptionsError;

      // Combine profiles with their subscriptions
      const clientsWithSubs: ClientWithSubscription[] = (profiles || []).map((profile) => {
        const userSubs = (subscriptions || []).filter(
          (sub) => sub.user_id === profile.user_id
        ) as Subscription[];
        
        const activeSub = userSubs.find((sub) => sub.status === "active") || null;
        
        // Calculate days remaining for transformation plans
        let daysRemaining: number | null = null;
        if (activeSub?.plan_type === "transformation" && activeSub.expires_at) {
          const now = new Date();
          const expiresAt = new Date(activeSub.expires_at);
          const diffTime = expiresAt.getTime() - now.getTime();
          daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        }

        return {
          ...profile,
          subscriptions: userSubs,
          activeSubscription: activeSub,
          daysRemaining,
        } as ClientWithSubscription;
      });

      // Apply filters
      let filteredClients = clientsWithSubs;

      if (filters?.planType && filters.planType !== "all") {
        filteredClients = filteredClients.filter(
          (client) => client.activeSubscription?.plan_type === filters.planType
        );
      }

      if (filters?.status && filters.status !== "all") {
        if (filters.status === "no_subscription") {
          filteredClients = filteredClients.filter(
            (client) => client.subscriptions.length === 0
          );
        } else {
          filteredClients = filteredClients.filter(
            (client) => client.activeSubscription?.status === filters.status
          );
        }
      }

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredClients = filteredClients.filter(
          (client) =>
            client.first_name?.toLowerCase().includes(searchLower) ||
            client.last_name?.toLowerCase().includes(searchLower) ||
            client.email.toLowerCase().includes(searchLower)
        );
      }

      // Calculate analytics
      const activeClients = clientsWithSubs.filter(
        (c) => c.activeSubscription?.status === "active"
      ).length;

      const expiredClients = clientsWithSubs.filter(
        (c) => c.subscriptions.some((s) => s.status === "expired")
      ).length;

      const cancelledClients = clientsWithSubs.filter(
        (c) => c.subscriptions.some((s) => s.status === "cancelled")
      ).length;

      const clientsByPlan = {
        membership: clientsWithSubs.filter(
          (c) => c.activeSubscription?.plan_type === "membership"
        ).length,
        transformation: clientsWithSubs.filter(
          (c) => c.activeSubscription?.plan_type === "transformation"
        ).length,
        coaching: clientsWithSubs.filter(
          (c) => c.activeSubscription?.plan_type === "coaching"
        ).length,
      };

      const intakeCompleted = clientsWithSubs.filter(
        (c) => c.intake_completed_at
      ).length;

      setAnalytics({
        totalClients: clientsWithSubs.length,
        activeClients,
        expiredClients,
        cancelledClients,
        clientsByPlan,
        intakeCompleted,
        clients: filteredClients,
      });
    } catch (err: any) {
      console.error("Error fetching client data:", err);
      setError(err.message || "Failed to fetch client data");
    } finally {
      setLoading(false);
    }
  };

  return { analytics, loading, error, refetch: fetchClientData };
};
