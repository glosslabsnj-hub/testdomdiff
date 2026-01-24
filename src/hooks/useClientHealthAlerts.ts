import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ClientAlert {
  id: string;
  user_id: string;
  alert_type: "missed_checkin" | "weight_spike" | "low_workouts" | "expiring_soon" | "inactive";
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  created_at: string;
  // Joined profile data
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
    avatar_url: string | null;
  };
  subscription?: {
    plan_type: string;
    expires_at: string | null;
    started_at: string;
  };
}

export function useClientHealthAlerts() {
  const [alerts, setAlerts] = useState<ClientAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const generateAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const generatedAlerts: ClientAlert[] = [];
      const now = new Date();

      // Fetch all active subscriptions with profiles
      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("status", "active");

      if (!subscriptions) {
        setAlerts([]);
        setLoading(false);
        return;
      }

      const userIds = subscriptions.map(s => s.user_id);

      // Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, email, avatar_url")
        .in("user_id", userIds);

      // Fetch all check-ins
      const { data: checkIns } = await supabase
        .from("check_ins")
        .select("user_id, week_number, weight, workouts_completed, submitted_at")
        .in("user_id", userIds)
        .order("week_number", { ascending: false });

      const profilesMap = new Map((profiles || []).map(p => [p.user_id, p]));
      const subscriptionsMap = new Map(subscriptions.map(s => [s.user_id, s]));
      
      // Group check-ins by user
      const checkInsMap = new Map<string, typeof checkIns>();
      (checkIns || []).forEach(c => {
        if (!checkInsMap.has(c.user_id)) checkInsMap.set(c.user_id, []);
        checkInsMap.get(c.user_id)!.push(c);
      });

      for (const subscription of subscriptions) {
        const profile = profilesMap.get(subscription.user_id);
        const userCheckIns = checkInsMap.get(subscription.user_id) || [];
        const firstName = profile?.first_name || "Client";

        // 1. Check for expiring soon (transformation plans, 7 days or less)
        if (subscription.plan_type === "transformation" && subscription.expires_at) {
          const expiresAt = new Date(subscription.expires_at);
          const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysRemaining <= 7 && daysRemaining > 0) {
            generatedAlerts.push({
              id: `expiring-${subscription.user_id}`,
              user_id: subscription.user_id,
              alert_type: "expiring_soon",
              severity: daysRemaining <= 3 ? "high" : "medium",
              title: `Subscription Expiring`,
              description: `${firstName}'s 12-week program expires in ${daysRemaining} days.`,
              created_at: now.toISOString(),
              profile,
              subscription: {
                plan_type: subscription.plan_type,
                expires_at: subscription.expires_at,
                started_at: subscription.started_at,
              },
            });
          }
        }

        // 2. Check for missed check-ins (no check-in in last 2 weeks)
        if (userCheckIns.length > 0) {
          const lastCheckIn = userCheckIns[0];
          const lastSubmitted = new Date(lastCheckIn.submitted_at);
          const daysSinceCheckIn = Math.floor((now.getTime() - lastSubmitted.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceCheckIn >= 14) {
            generatedAlerts.push({
              id: `missed-checkin-${subscription.user_id}`,
              user_id: subscription.user_id,
              alert_type: "missed_checkin",
              severity: daysSinceCheckIn >= 21 ? "high" : "medium",
              title: `Missed Check-Ins`,
              description: `${firstName} hasn't submitted a check-in in ${daysSinceCheckIn} days.`,
              created_at: now.toISOString(),
              profile,
              subscription: {
                plan_type: subscription.plan_type,
                expires_at: subscription.expires_at,
                started_at: subscription.started_at,
              },
            });
          }
        } else {
          // No check-ins at all and subscription started more than 7 days ago
          const startedAt = new Date(subscription.started_at);
          const daysSinceStart = Math.floor((now.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceStart >= 7) {
            generatedAlerts.push({
              id: `no-checkins-${subscription.user_id}`,
              user_id: subscription.user_id,
              alert_type: "inactive",
              severity: "medium",
              title: `No Check-Ins Yet`,
              description: `${firstName} started ${daysSinceStart} days ago but hasn't submitted any check-ins.`,
              created_at: now.toISOString(),
              profile,
              subscription: {
                plan_type: subscription.plan_type,
                expires_at: subscription.expires_at,
                started_at: subscription.started_at,
              },
            });
          }
        }

        // 3. Check for weight spikes (>5 lbs change between consecutive check-ins)
        if (userCheckIns.length >= 2) {
          const latestWeight = userCheckIns[0].weight;
          const previousWeight = userCheckIns[1].weight;
          
          if (latestWeight && previousWeight) {
            const weightChange = Math.abs(latestWeight - previousWeight);
            
            if (weightChange >= 5) {
              const direction = latestWeight > previousWeight ? "gained" : "lost";
              generatedAlerts.push({
                id: `weight-spike-${subscription.user_id}`,
                user_id: subscription.user_id,
                alert_type: "weight_spike",
                severity: weightChange >= 8 ? "high" : "medium",
                title: `Significant Weight Change`,
                description: `${firstName} ${direction} ${weightChange.toFixed(1)} lbs since last check-in.`,
                created_at: now.toISOString(),
                profile,
                subscription: {
                  plan_type: subscription.plan_type,
                  expires_at: subscription.expires_at,
                  started_at: subscription.started_at,
                },
              });
            }
          }
        }

        // 4. Check for low workout completion (< 3 workouts in last check-in)
        if (userCheckIns.length > 0 && userCheckIns[0].workouts_completed !== null) {
          if (userCheckIns[0].workouts_completed < 3) {
            generatedAlerts.push({
              id: `low-workouts-${subscription.user_id}`,
              user_id: subscription.user_id,
              alert_type: "low_workouts",
              severity: userCheckIns[0].workouts_completed === 0 ? "high" : "low",
              title: `Low Workout Completion`,
              description: `${firstName} only completed ${userCheckIns[0].workouts_completed} workouts last week.`,
              created_at: now.toISOString(),
              profile,
              subscription: {
                plan_type: subscription.plan_type,
                expires_at: subscription.expires_at,
                started_at: subscription.started_at,
              },
            });
          }
        }
      }

      // Sort by severity
      const severityOrder = { high: 0, medium: 1, low: 2 };
      generatedAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      setAlerts(generatedAlerts);
    } catch (err) {
      console.error("Error generating client alerts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    generateAlerts();
  }, [generateAlerts]);

  const getAlertCounts = () => {
    return {
      total: alerts.length,
      high: alerts.filter(a => a.severity === "high").length,
      medium: alerts.filter(a => a.severity === "medium").length,
      low: alerts.filter(a => a.severity === "low").length,
    };
  };

  return {
    alerts,
    loading,
    refetch: generateAlerts,
    getAlertCounts,
  };
}
